// src/cart/cart.controller.js
const pool = require("../../db");
const logger = require("../utils/logger");

/**
 * Helper: tìm hoặc tạo cart ACTIVE của user
 */
async function findOrCreateActiveCart(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM carts WHERE user_id = ? AND status = 'ACTIVE' LIMIT 1",
    [userId]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  // Chưa có cart ACTIVE -> tạo mới
  const [result] = await pool.query(
    "INSERT INTO carts (user_id, status) VALUES (?, 'ACTIVE')",
    [userId]
  );

  return {
    id: result.insertId,
    user_id: userId,
    status: "ACTIVE",
  };
}

/**
 * Helper: build response cart (items, total, count)
 */
async function buildCartResponse(cart) {
  const [items] = await pool.query(
    `
      SELECT 
        ci.id,
        ci.book_id    AS bookId,
        ci.quantity,
        ci.unit_price AS unitPrice,
        (ci.quantity * ci.unit_price) AS lineTotal,
        b.title,
        b.cover_image AS coverImage,
        b.new_price   AS currentPrice
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.cart_id = ?
    `,
    [cart.id]
  );

  let itemsTotal = 0;
  let itemsCount = 0;
  items.forEach((item) => {
    itemsTotal += Number(item.lineTotal);
    itemsCount += item.quantity;
  });

  return {
    id: cart.id,
    items,
    itemsTotal,
    itemsCount,
  };
}

/**
 * GET /api/cart
 * Lấy giỏ ACTIVE của user (tự tạo nếu chưa có)
 */
async function getCart(req, res) {
  try {
    const userId = req.user.id;

    const cart = await findOrCreateActiveCart(userId);
    const cartResponse = await buildCartResponse(cart);

    res.json(cartResponse);
  } catch (error) {
    logger.error("Error in getCart:", error);
    res.status(500).json({ message: "Failed to get cart" });
  }
}

/**
 * POST /api/cart/items
 * Body: { bookId, quantity }
 * Thêm sách vào giỏ (nếu đã có thì tăng quantity)
 */
async function addItemToCart(req, res) {
  try {
    const userId = req.user.id;
    let { bookId, quantity } = req.body;

    bookId = Number(bookId);
    quantity = Number(quantity) || 1;

    if (!bookId || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "bookId and positive quantity are required" });
    }

    const cart = await findOrCreateActiveCart(userId);

    // Kiểm tra book tồn tại + lấy giá hiện tại
    const [bookRows] = await pool.query(
      "SELECT id, new_price, stock FROM books WHERE id = ?",
      [bookId]
    );
    if (bookRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    const book = bookRows[0];

    // (Optional) Check stock ở đây
    // if (book.stock < quantity) { ... }

    // Kiểm tra item đã tồn tại trong cart chưa
    const [itemRows] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND book_id = ?",
      [cart.id, bookId]
    );

    if (itemRows.length > 0) {
      // Đã có -> tăng quantity
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [quantity, itemRows[0].id]
      );
    } else {
      // Chưa có -> insert mới
      await pool.query(
        "INSERT INTO cart_items (cart_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [cart.id, bookId, quantity, book.new_price]
      );
    }

    const cartResponse = await buildCartResponse(cart);
    res.status(200).json(cartResponse);
  } catch (error) {
    logger.error("Error in addItemToCart:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
}

/**
 * PATCH /api/cart/items/:itemId
 * Body: { quantity }
 * Cập nhật số lượng 1 item trong cart
 */
async function updateCartItemQuantity(req, res) {
  try {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);
    let { quantity } = req.body;
    quantity = Number(quantity);

    if (!itemId || isNaN(quantity)) {
      return res
        .status(400)
        .json({ message: "itemId and quantity are required" });
    }

    // Tìm item thuộc cart của user hiện tại
    const [rows] = await pool.query(
      `
        SELECT ci.id, ci.cart_id, ci.book_id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = ? AND c.user_id = ? AND c.status = 'ACTIVE'
        LIMIT 1
      `,
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const item = rows[0];

    if (quantity <= 0) {
      // Nếu quantity <= 0 -> coi như xoá
      await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
    } else {
      // Optional: check stock ở đây nếu muốn

      await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [quantity, itemId]
      );
    }

    // Lấy lại cart
    const [cartRows] = await pool.query("SELECT * FROM carts WHERE id = ?", [
      item.cart_id,
    ]);
    const cart = cartRows[0];

    const cartResponse = await buildCartResponse(cart);
    res.json(cartResponse);
  } catch (error) {
    logger.error("Error in updateCartItemQuantity:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
}

/**
 * DELETE /api/cart/items/:itemId
 * Xoá 1 item khỏi cart
 */
async function removeCartItem(req, res) {
  try {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);

    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    // Check item thuộc cart ACTIVE của user
    const [rows] = await pool.query(
      `
        SELECT ci.id, ci.cart_id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = ? AND c.user_id = ? AND c.status = 'ACTIVE'
        LIMIT 1
      `,
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const item = rows[0];

    await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);

    const [cartRows] = await pool.query("SELECT * FROM carts WHERE id = ?", [
      item.cart_id,
    ]);
    const cart = cartRows[0];

    const cartResponse = await buildCartResponse(cart);
    res.json(cartResponse);
  } catch (error) {
    logger.error("Error in removeCartItem:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
}

/**
 * DELETE /api/cart
 * Xoá toàn bộ items trong cart ACTIVE của user
 */
async function clearCart(req, res) {
  try {
    const userId = req.user.id;

    const cart = await findOrCreateActiveCart(userId);

    await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);

    const cartResponse = await buildCartResponse(cart);
    res.json(cartResponse);
  } catch (error) {
    logger.error("Error in clearCart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
