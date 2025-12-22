// src/vouchers/voucher.controller.js
const db = require("../../db");
const logger = require("../utils/logger");

/**
 * Validate và tính toán discount từ voucher
 * @param {string} voucherCode - Mã voucher
 * @param {number} orderTotal - Tổng tiền đơn hàng (items_total)
 * @param {number} itemCount - Số lượng sách trong đơn
 * @param {Array} bookCategories - Danh sách category của các sách trong đơn
 * @returns {Object} { valid: boolean, discount: number, voucher: object, error: string }
 */
async function validateVoucher(voucherCode, orderTotal, itemCount = 0, bookCategories = []) {
  if (!voucherCode) {
    return { valid: false, discount: 0, error: "Voucher code is required" };
  }

  try {
    // Tìm voucher
    const [vouchers] = await db.query(
      `SELECT * FROM vouchers WHERE code = ? AND is_active = 1`,
      [voucherCode]
    );

    if (vouchers.length === 0) {
      return { valid: false, discount: 0, error: "Voucher không tồn tại hoặc đã bị vô hiệu hóa" };
    }

    const voucher = vouchers[0];
    const now = new Date();
    const validFrom = new Date(voucher.valid_from);
    const validTo = new Date(voucher.valid_to);

    // Kiểm tra thời gian hiệu lực
    if (now < validFrom || now > validTo) {
      return { valid: false, discount: 0, error: "Voucher đã hết hạn hoặc chưa có hiệu lực" };
    }

    // Kiểm tra usage limit
    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return { valid: false, discount: 0, error: "Voucher đã hết lượt sử dụng" };
    }

    // Kiểm tra min_order_amount
    if (orderTotal < voucher.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        error: `Đơn hàng tối thiểu ${voucher.min_order_amount.toLocaleString('vi-VN')}₫ để sử dụng voucher này`,
      };
    }

    // Kiểm tra min_quantity (số lượng sách)
    if (voucher.min_quantity !== null && itemCount < voucher.min_quantity) {
      return {
        valid: false,
        discount: 0,
        error: `Cần mua tối thiểu ${voucher.min_quantity} sách để sử dụng voucher này`,
      };
    }

    // Kiểm tra applicable_categories
    if (voucher.applicable_categories) {
      try {
        const categories = JSON.parse(voucher.applicable_categories);
        if (Array.isArray(categories) && categories.length > 0) {
          const hasApplicableCategory = bookCategories.some((cat) => categories.includes(cat));
          if (!hasApplicableCategory) {
            return {
              valid: false,
              discount: 0,
              error: `Voucher chỉ áp dụng cho danh mục: ${categories.join(", ")}`,
            };
          }
        }
      } catch (e) {
        // Nếu parse JSON lỗi, bỏ qua check này
      }
    }

    // Tính toán discount
    let discount = 0;

    if (voucher.type === "PERCENTAGE") {
      discount = (orderTotal * voucher.value) / 100;
      // Áp dụng max_discount nếu có
      if (voucher.max_discount !== null && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    } else if (voucher.type === "FIXED_AMOUNT") {
      discount = voucher.value;
      // Không được giảm nhiều hơn tổng tiền
      if (discount > orderTotal) {
        discount = orderTotal;
      }
    } else if (voucher.type === "FREE_SHIP") {
      // FREE_SHIP sẽ được xử lý riêng ở shipping_fee
      discount = 0; // Không giảm vào items_total
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100, // Làm tròn 2 chữ số
      shippingDiscount: voucher.type === "FREE_SHIP" ? voucher.value : 0,
      voucher: voucher,
      error: null,
    };
  } catch (err) {
    logger.error("Error validating voucher:", err);
    return { valid: false, discount: 0, error: "Lỗi khi xử lý voucher" };
  }
}

/**
 * GET /api/vouchers
 * Lấy danh sách voucher có sẵn
 */
async function getAvailableVouchers(req, res) {
  try {
    const now = new Date();
    const [vouchers] = await db.query(
      `SELECT 
        id, code, name, description, type, value, 
        min_order_amount, max_discount, usage_limit, used_count,
        valid_from, valid_to, min_quantity, applicable_categories
      FROM vouchers 
      WHERE is_active = 1 
        AND valid_from <= ? 
        AND valid_to >= ?
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY created_at DESC`,
      [now, now]
    );

    return res.status(200).json({ vouchers });
  } catch (err) {
    logger.error("Error fetching vouchers:", err);
    return res.status(500).json({ message: "Failed to fetch vouchers" });
  }
}

/**
 * POST /api/vouchers/validate
 * Validate voucher code và trả về discount amount
 * Body: { code, orderTotal, itemCount, bookCategories }
 */
async function validateVoucherCode(req, res) {
  try {
    const { code, orderTotal, itemCount = 0, bookCategories = [] } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: "code and orderTotal are required" });
    }

    const result = await validateVoucher(code, orderTotal, itemCount, bookCategories);

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        discount: 0,
        error: result.error,
      });
    }

    return res.status(200).json({
      valid: true,
      discount: result.discount,
      shippingDiscount: result.shippingDiscount || 0,
      voucher: {
        id: result.voucher.id,
        code: result.voucher.code,
        name: result.voucher.name,
        type: result.voucher.type,
      },
    });
  } catch (err) {
    logger.error("Error validating voucher:", err);
    return res.status(500).json({ message: "Failed to validate voucher" });
  }
}

module.exports = {
  validateVoucher,
  getAvailableVouchers,
  validateVoucherCode,
};

