// src/addresses/address.controller.js
const db = require("../../db");
const logger = require("../utils/logger");

// Helper: Map MySQL row to frontend format
function mapAddressRow(row) {
  if (!row) return null;

  return {
    _id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    line1: row.line1,
    city: row.city,
    state: row.state,
    country: row.country,
    zipcode: row.zipcode,
    isDefault: !!row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Lấy tất cả địa chỉ của user hiện tại
async function getUserAddresses(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT * FROM user_addresses 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC
      `,
      [userId]
    );

    const addresses = rows.map(mapAddressRow);

    return res.status(200).json(addresses);
  } catch (err) {
    logger.error("Error fetching addresses:", err);
    return res.status(500).json({ message: "Failed to fetch addresses" });
  }
}

// Lấy 1 địa chỉ theo ID
async function getAddressById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    const address = mapAddressRow(rows[0]);

    return res.status(200).json(address);
  } catch (err) {
    logger.error("Error fetching address:", err);
    return res.status(500).json({ message: "Failed to fetch address" });
  }
}

// Thêm địa chỉ mới
async function createAddress(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, phone, line1, city, state, country, zipcode, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !phone || !line1 || !city || !country) {
      return res.status(400).json({
        message: "Missing required fields: fullName, phone, line1, city, country",
      });
    }

    // Nếu set làm default, cần unset các địa chỉ default khác
    if (isDefault) {
      await db.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
        [userId]
      );
    }

    // Nếu đây là địa chỉ đầu tiên, tự động set làm default
    const [existingAddresses] = await db.query(
      "SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?",
      [userId]
    );
    const shouldBeDefault = existingAddresses[0].count === 0 || isDefault;

    const [result] = await db.query(
      `
      INSERT INTO user_addresses 
        (user_id, full_name, phone, line1, city, state, country, zipcode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        fullName,
        phone,
        line1,
        city,
        state || null,
        country,
        zipcode || null,
        shouldBeDefault ? 1 : 0,
      ]
    );

    const [newAddressRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ?",
      [result.insertId]
    );

    const address = mapAddressRow(newAddressRows[0]);

    return res.status(201).json({
      message: "Address created successfully",
      address,
    });
  } catch (err) {
    logger.error("Error creating address:", err);
    return res.status(500).json({ message: "Failed to create address" });
  }
}

// Cập nhật địa chỉ
async function updateAddress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { fullName, phone, line1, city, state, country, zipcode, isDefault } = req.body;

    // Kiểm tra địa chỉ có tồn tại và thuộc về user không
    const [existingRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Nếu set làm default, unset các địa chỉ default khác
    if (isDefault) {
      await db.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id != ?",
        [userId, id]
      );
    }

    // Update địa chỉ
    await db.query(
      `
      UPDATE user_addresses SET
        full_name = ?,
        phone = ?,
        line1 = ?,
        city = ?,
        state = ?,
        country = ?,
        zipcode = ?,
        is_default = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        fullName || existingRows[0].full_name,
        phone || existingRows[0].phone,
        line1 || existingRows[0].line1,
        city || existingRows[0].city,
        state !== undefined ? state : existingRows[0].state,
        country || existingRows[0].country,
        zipcode !== undefined ? zipcode : existingRows[0].zipcode,
        isDefault !== undefined ? (isDefault ? 1 : 0) : existingRows[0].is_default,
        id,
        userId,
      ]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ?",
      [id]
    );

    const address = mapAddressRow(updatedRows[0]);

    return res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (err) {
    logger.error("Error updating address:", err);
    return res.status(500).json({ message: "Failed to update address" });
  }
}

// Xóa địa chỉ
async function deleteAddress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra địa chỉ có tồn tại và thuộc về user không
    const [existingRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = existingRows[0].is_default === 1;

    // Xóa địa chỉ
    await db.query("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    // Nếu địa chỉ bị xóa là default, set địa chỉ đầu tiên còn lại làm default
    if (wasDefault) {
      const [remainingAddresses] = await db.query(
        "SELECT id FROM user_addresses WHERE user_id = ? ORDER BY created_at ASC LIMIT 1",
        [userId]
      );

      if (remainingAddresses.length > 0) {
        await db.query(
          "UPDATE user_addresses SET is_default = 1 WHERE id = ?",
          [remainingAddresses[0].id]
        );
      }
    }

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    logger.error("Error deleting address:", err);
    return res.status(500).json({ message: "Failed to delete address" });
  }
}

// Đặt địa chỉ làm mặc định
async function setDefaultAddress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra địa chỉ có tồn tại và thuộc về user không
    const [existingRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Unset tất cả địa chỉ default khác
    await db.query(
      "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
      [userId]
    );

    // Set địa chỉ này làm default
    await db.query(
      "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM user_addresses WHERE id = ?",
      [id]
    );

    const address = mapAddressRow(updatedRows[0]);

    return res.status(200).json({
      message: "Default address updated successfully",
      address,
    });
  } catch (err) {
    logger.error("Error setting default address:", err);
    return res.status(500).json({ message: "Failed to set default address" });
  }
}

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

