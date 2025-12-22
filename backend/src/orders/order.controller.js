// src/orders/order.controller.js
const db = require("../../db");
const logger = require("../utils/logger");
const { DEFAULT_SHIPPING_FEE } = require("../utils/constants");

/**
 * POST /api/orders
 * Body FE gửi:
 * {
 *   name,
 *   email,
 *   phone,
 *   address: { city, country, state, zipcode },
 *   productIds: [{ bookId, quantity }] hoặc [bookId1, bookId2, ...],
 *   paymentMethod: 'COD' | 'BANK_TRANSFER',
 *   voucherCode: string (optional),
 *   shippingFee: number (optional, default 5.00 USD)
 * }
 */
async function createOrder(req, res) {
  const user = req.user; // nếu order.route đang dùng verifyToken
  const {
    name,
    email,
    phone,
    address,
    productIds,
    paymentMethod = "COD", // Mặc định là COD
    voucherCode, // Optional
    shippingFee: providedShippingFee,
    addressId, // Optional: ID của saved address
  } = req.body;
  
  // Ensure shippingFee is a valid number, default to DEFAULT_SHIPPING_FEE
  const shippingFee = providedShippingFee !== undefined 
    ? parseFloat(providedShippingFee) || DEFAULT_SHIPPING_FEE
    : DEFAULT_SHIPPING_FEE;

  try {
      // validate đơn giản
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !address.city ||
      !address.country ||
      !productIds ||
      !Array.isArray(productIds) ||
      productIds.length === 0
    ) {
      logger.warn("Order validation failed:", {
        missingFields: {
          name: !name,
          email: !email,
          phone: !phone,
          address: !address,
          city: !address?.city,
          country: !address?.country,
          productIds: !productIds || !Array.isArray(productIds) || productIds.length === 0
        }
      });
      return res.status(400).json({ 
        message: "Missing order fields",
        details: {
          name: !name,
          email: !email,
          phone: !phone,
          address: !address,
          city: !address?.city,
          country: !address?.country,
          productIds: !productIds || !Array.isArray(productIds) || productIds.length === 0
        }
      });
    }
    
    logger.info("Creating order:", {
      userId: user?.id,
      email,
      productCount: productIds.length,
      hasAddressId: !!addressId
    });

    // Validate payment method
    if (!["COD", "BANK_TRANSFER", "VNPAY"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method. Must be COD, BANK_TRANSFER, or VNPAY" });
    }

    // Nếu dùng JWT: user.id = users.id
    const userId = user?.id || null;

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // 1) Xử lý productIds và tính items_total
      const bookQuantityMap = {};
      const bookCategories = [];
      let itemsTotal = 0;
      let itemCount = 0;

      for (const item of productIds) {
        let bookId, quantity;
        if (typeof item === 'object' && item.bookId) {
          bookId = Number(item.bookId); // Convert to number
          quantity = Number(item.quantity) || 1;
        } else {
          bookId = Number(item); // Convert to number
          quantity = 1;
        }
        
        if (isNaN(bookId) || bookId <= 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Invalid bookId: ${item.bookId || item}` });
        }
        
        bookQuantityMap[bookId] = (bookQuantityMap[bookId] || 0) + quantity;
        itemCount += quantity;
      }

      // Lấy giá và category của từng book
      for (const [bookId, quantity] of Object.entries(bookQuantityMap)) {
        const [bookRows] = await conn.query(
          "SELECT new_price, category FROM books WHERE id = ?",
          [bookId]
        );

        if (bookRows.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Book not found with id = ${bookId}` });
        }

        const unitPrice = parseFloat(bookRows[0].new_price) || 0;
        const lineTotal = unitPrice * quantity;
        itemsTotal += lineTotal;

        // Lưu category để check voucher
        if (bookRows[0].category && !bookCategories.includes(bookRows[0].category)) {
          bookCategories.push(bookRows[0].category);
        }
      }

      // 2) Validate và tính discount từ voucher
      let discountTotal = 0;
      let shippingDiscount = 0;
      let voucherId = null;

      if (voucherCode) {
        try {
          // Validate voucher trong transaction
          const [vouchers] = await conn.query(
            `SELECT * FROM vouchers WHERE code = ? AND is_active = 1`,
            [voucherCode]
          );

          if (vouchers.length === 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Voucher không tồn tại hoặc đã bị vô hiệu hóa" });
          }

          const voucher = vouchers[0];
          const now = new Date();
          const validFrom = new Date(voucher.valid_from);
          const validTo = new Date(voucher.valid_to);

          // Kiểm tra thời gian hiệu lực
          if (now < validFrom || now > validTo) {
            await conn.rollback();
            return res.status(400).json({ message: "Voucher đã hết hạn hoặc chưa có hiệu lực" });
          }

          // Kiểm tra usage limit
          if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
            await conn.rollback();
            return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
          }

          // Kiểm tra min_order_amount
          if (itemsTotal < voucher.min_order_amount) {
            await conn.rollback();
            return res.status(400).json({
              message: `Đơn hàng tối thiểu ${voucher.min_order_amount.toLocaleString('vi-VN')}₫ để sử dụng voucher này`,
            });
          }

          // Kiểm tra min_quantity
          if (voucher.min_quantity !== null && itemCount < voucher.min_quantity) {
            await conn.rollback();
            return res.status(400).json({
              message: `Cần mua tối thiểu ${voucher.min_quantity} sách để sử dụng voucher này`,
            });
          }

          // Kiểm tra applicable_categories
          if (voucher.applicable_categories) {
            try {
              const categories = JSON.parse(voucher.applicable_categories);
              if (Array.isArray(categories) && categories.length > 0) {
                const hasApplicableCategory = bookCategories.some((cat) => categories.includes(cat));
                if (!hasApplicableCategory) {
                  await conn.rollback();
                  return res.status(400).json({
                    message: `Voucher chỉ áp dụng cho danh mục: ${categories.join(", ")}`,
                  });
                }
              }
            } catch (e) {
              // Nếu parse JSON lỗi, bỏ qua check này
            }
          }

          // Tính toán discount
          if (voucher.type === "PERCENTAGE") {
            discountTotal = (itemsTotal * voucher.value) / 100;
            if (voucher.max_discount !== null && discountTotal > voucher.max_discount) {
              discountTotal = voucher.max_discount;
            }
          } else if (voucher.type === "FIXED_AMOUNT") {
            discountTotal = voucher.value;
            if (discountTotal > itemsTotal) {
              discountTotal = itemsTotal;
            }
          } else if (voucher.type === "FREE_SHIP") {
            shippingDiscount = voucher.value;
            discountTotal = 0;
          }

          discountTotal = Math.round(discountTotal * 100) / 100;
          voucherId = voucher.id;

          // Tăng used_count của voucher
          await conn.query(
            "UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?",
            [voucherId]
          );
        } catch (voucherErr) {
          await conn.rollback();
          logger.error("Error validating voucher:", voucherErr);
          return res.status(400).json({ message: "Lỗi khi xử lý voucher" });
        }
      }

      // 3) Tính shipping_fee (trừ đi shippingDiscount nếu có)
      const finalShippingFee = Math.max(0, parseFloat(shippingFee) - parseFloat(shippingDiscount || 0));

      // 4) Tính total_price
      const totalPrice = parseFloat(itemsTotal) - parseFloat(discountTotal) + parseFloat(finalShippingFee);
      
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Order calculation:', {
          itemsTotal,
          discountTotal,
          shippingFee: parseFloat(shippingFee),
          shippingDiscount: parseFloat(shippingDiscount || 0),
          finalShippingFee,
          totalPrice
        });
      }

      // 5) Tạo record trong bảng orders (KHÔNG có voucher_id - dùng order_vouchers table thay thế)
      const [orderResult] = await conn.query(
        `
        INSERT INTO orders 
          (user_id, address_id, name, email, phone, city, country, state, zipcode, 
           payment_method, payment_status, status,
           items_total, shipping_fee, discount_total, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?, ?, ?, ?)
        `,
        [
          userId,
          addressId ? Number(addressId) : null,
          name,
          email,
          phone,
          address.city,
          address.country,
          address.state || null,
          address.zipcode || null,
          paymentMethod,
          itemsTotal,
          finalShippingFee,
          discountTotal,
          totalPrice,
        ]
      );

      const orderId = orderResult.insertId;

      // 6) Insert order_items cho từng book
      for (const [bookId, quantity] of Object.entries(bookQuantityMap)) {
        const [bookRows] = await conn.query(
          "SELECT new_price FROM books WHERE id = ?",
          [bookId]
        );
        const unitPrice = bookRows[0].new_price;
        const lineTotal = unitPrice * quantity;

        await conn.query(
          `
          INSERT INTO order_items
            (order_id, book_id, quantity, price, total_price)
          VALUES (?, ?, ?, ?, ?)
          `,
          [orderId, bookId, quantity, unitPrice, lineTotal]
        );
      }

      // 7) Lưu voucher vào order_vouchers nếu có
      if (voucherId) {
        await conn.query(
          `
          INSERT INTO order_vouchers (order_id, voucher_id, discount_amount)
          VALUES (?, ?, ?)
          `,
          [orderId, voucherId, discountTotal]
        );
      }

      // 8) Tạo payment record
      await conn.query(
        `
        INSERT INTO payments (order_id, amount, method, status)
        VALUES (?, ?, ?, 'PENDING')
        `,
        [orderId, totalPrice, paymentMethod]
      );

      // 4) Clear cart sau khi tạo order thành công
      if (userId) {
        // Tìm cart ACTIVE của user
        const [cartRows] = await conn.query(
          "SELECT id FROM carts WHERE user_id = ? AND status = 'ACTIVE' LIMIT 1",
          [userId]
        );
        
        if (cartRows.length > 0) {
          const cartId = cartRows[0].id;
          // Xóa tất cả items trong cart
          await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
          // Đổi status cart thành ORDERED
          await conn.query(
            "UPDATE carts SET status = 'ORDERED' WHERE id = ?",
            [cartId]
          );
        }
      }

      await conn.commit();

      return res.status(201).json({
        message: "Order created successfully",
        orderId,
      });
    } catch (err) {
      await conn.rollback();
      logger.error("Error creating order:", {
        message: err.message,
        sql: err.sql,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        stack: err.stack
      });
      
      // Trả về message chi tiết hơn trong development
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? err.message 
        : "Failed to create order";
      
      return res.status(500).json({ 
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          code: err.code,
          sqlState: err.sqlState 
        })
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    logger.error("DB connection error:", {
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ 
      message: "Failed to create order"
    });
  }
}

/**
 * GET /api/orders/email/:email
 * Trả về danh sách đơn theo email, format giống FE đang dùng
 */
async function getOrdersByEmail(req, res) {
  const { email } = req.params;
  const user = req.user;

  try {
    // nếu muốn bảo mật: user chỉ xem được order của chính mình (trừ admin)
    if (user && user.role !== "ADMIN" && user.email !== email) {
      return res
        .status(403)
        .json({ message: "You can only see your own orders" });
    }

    // 1) Lấy các order theo email
    const [orders] = await db.query(
      `
      SELECT 
        id,
        user_id,
        name,
        email,
        phone,
        city,
        country,
        state,
        zipcode,
        status,
        payment_status,
        payment_method,
        total_price,
        created_at,
        updated_at
      FROM orders
      WHERE email = ?
      ORDER BY created_at DESC
      `,
      [email]
    );

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orders.map((o) => o.id);

    // 2) Lấy các item tương ứng (book_id)
    const [items] = await db.query(
      `
      SELECT order_id, book_id
      FROM order_items
      WHERE order_id IN (?)
      `,
      [orderIds]
    );

    // 3) Map thành format FE mong muốn
    const result = orders.map((order) => {
      const relatedItems = items.filter((i) => i.order_id === order.id);

      return {
        _id: order.id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        totalPrice: parseFloat(order.total_price) || 0,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        address: {
          city: order.city,
          state: order.state,
          country: order.country,
          zipcode: order.zipcode,
        },
        productIds: relatedItems.map((i) => i.book_id),
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    logger.error("Error fetching orders:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

/**
 * GET /api/orders (ADMIN ONLY)
 * Lấy tất cả orders với filter và pagination
 */
async function getAllOrders(req, res) {
  try {
    const { status, paymentStatus, page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push("o.status = ?");
      queryParams.push(status);
    }

    if (paymentStatus) {
      whereConditions.push("o.payment_status = ?");
      queryParams.push(paymentStatus);
    }

    if (search) {
      whereConditions.push("(o.email LIKE ? OR o.name LIKE ? OR o.phone LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get orders with order items
    queryParams.push(parseInt(limit), offset);
    const [orders] = await db.query(
      `
      SELECT 
        o.id,
        o.user_id,
        o.name,
        o.email,
        o.phone,
        o.city,
        o.country,
        o.state,
        o.zipcode,
        o.status,
        o.payment_status,
        o.payment_method,
        o.items_total,
        o.shipping_fee,
        o.discount_total,
        o.total_price,
        o.created_at,
        o.updated_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
      `,
      queryParams
    );

    if (orders.length === 0) {
      return res.status(200).json({
        orders: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      });
    }

    const orderIds = orders.map((o) => o.id);

    // Get order items with book details
    const [items] = await db.query(
      `
      SELECT 
        oi.order_id,
        oi.book_id,
        oi.quantity,
        oi.price as unit_price,
        oi.total_price,
        b.title,
        b.cover_image
      FROM order_items oi
      INNER JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id IN (?)
      `,
      [orderIds]
    );
    
    // Get vouchers applied to orders
    const [orderVouchers] = await db.query(
      `
      SELECT 
        ov.order_id,
        ov.voucher_id,
        ov.discount_amount,
        v.code,
        v.name as voucher_name,
        v.type as voucher_type
      FROM order_vouchers ov
      LEFT JOIN vouchers v ON ov.voucher_id = v.id
      WHERE ov.order_id IN (?)
      `,
      [orderIds]
    );

    // Map orders with items and vouchers
    const result = orders.map((order) => {
      const orderItems = items.filter((i) => i.order_id === order.id);
      const orderVoucher = orderVouchers.find((v) => v.order_id === order.id);
      
      return {
        _id: order.id,
        userId: order.user_id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        totalPrice: parseFloat(order.total_price) || 0,
        itemsTotal: parseFloat(order.items_total) || 0,
        shippingFee: parseFloat(order.shipping_fee) || 0,
        discountTotal: parseFloat(order.discount_total) || 0,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        address: {
          city: order.city,
          state: order.state,
          country: order.country,
          zipcode: order.zipcode,
        },
        voucher: orderVoucher ? {
          code: orderVoucher.code,
          name: orderVoucher.voucher_name,
          type: orderVoucher.voucher_type,
          discountAmount: parseFloat(orderVoucher.discount_amount) || 0,
        } : null,
        items: orderItems.map((item) => ({
          bookId: item.book_id,
          title: item.title,
          coverImage: item.cover_image,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price) || 0,
          totalPrice: parseFloat(item.total_price) || 0,
        })),
      };
    });

    return res.status(200).json({
      orders: result,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error("Error fetching all orders:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

/**
 * GET /api/orders/:id (ADMIN ONLY)
 * Lấy chi tiết một order
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `
      SELECT 
        o.id,
        o.user_id,
        o.name,
        o.email,
        o.phone,
        o.city,
        o.country,
        o.state,
        o.zipcode,
        o.status,
        o.payment_status,
        o.payment_method,
        o.items_total,
        o.shipping_fee,
        o.discount_total,
        o.total_price,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.id = ?
      `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Get order items with book details
    const [items] = await db.query(
      `
      SELECT 
        oi.book_id,
        oi.quantity,
        oi.price as unit_price,
        oi.total_price,
        b.title,
        b.cover_image,
        b.new_price as current_price
      FROM order_items oi
      INNER JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = ?
      `,
      [id]
    );
    
    // Get voucher applied to this order
    const [voucherRows] = await db.query(
      `
      SELECT 
        ov.voucher_id,
        ov.discount_amount,
        v.code,
        v.name as voucher_name,
        v.type as voucher_type
      FROM order_vouchers ov
      LEFT JOIN vouchers v ON ov.voucher_id = v.id
      WHERE ov.order_id = ?
      LIMIT 1
      `,
      [id]
    );
    
    const orderVoucher = voucherRows.length > 0 ? voucherRows[0] : null;

    const result = {
      _id: order.id,
      userId: order.user_id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      totalPrice: parseFloat(order.total_price) || 0,
      itemsTotal: parseFloat(order.items_total) || 0,
      shippingFee: parseFloat(order.shipping_fee) || 0,
      discountTotal: parseFloat(order.discount_total) || 0,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      address: {
        city: order.city,
        state: order.state,
        country: order.country,
        zipcode: order.zipcode,
      },
      voucher: orderVoucher ? {
        code: orderVoucher.code,
        name: orderVoucher.voucher_name,
        type: orderVoucher.voucher_type,
        discountAmount: parseFloat(orderVoucher.discount_amount) || 0,
      } : null,
      items: items.map((item) => ({
        bookId: item.book_id,
        title: item.title,
        coverImage: item.cover_image,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price) || 0,
        totalPrice: parseFloat(item.total_price) || 0,
        currentPrice: parseFloat(item.current_price) || 0,
      })),
    };

    return res.status(200).json(result);
  } catch (err) {
    logger.error("Error fetching order:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
}

/**
 * PATCH /api/orders/:id/status (ADMIN ONLY)
 * Cập nhật order status
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({ message: "status or paymentStatus is required" });
    }

    // Validate status values
    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const validPaymentStatuses = ["PENDING", "PAID", "REFUNDED"];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(", ")}` });
    }

    // Build update query
    const updates = [];
    const updateParams = [];

    if (status) {
      updates.push("status = ?");
      updateParams.push(status);
    }

    if (paymentStatus) {
      updates.push("payment_status = ?");
      updateParams.push(paymentStatus);
    }

    updateParams.push(id);

    const [result] = await db.query(
      `UPDATE orders SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch updated order
    const [updatedOrders] = await db.query(
      "SELECT id, status, payment_status, updated_at FROM orders WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrders[0],
    });
  } catch (err) {
    logger.error("Error updating order status:", err);
    return res.status(500).json({ message: "Failed to update order status" });
  }
}

module.exports = {
  createOrder,
  getOrdersByEmail,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
