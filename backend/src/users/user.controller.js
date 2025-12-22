// src/users/user.controller.js
const bcrypt = require("bcrypt");
const db = require("../../db");
const logger = require("../utils/logger");

const SALT_ROUNDS = 10;

/**
 * GET /api/users/profile
 * Lấy thông tin profile của user hiện tại
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, username, email, name, phone, role, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    logger.error("Error fetching user profile:", err);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

/**
 * PUT /api/users/profile
 * Cập nhật thông tin profile (name, phone)
 */
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Validate
    if (!name && !phone) {
      return res.status(400).json({ message: "At least one field (name or phone) is required" });
    }

    // Build update query
    const updates = [];
    const updateParams = [];

    if (name !== undefined) {
      updates.push("name = ?");
      updateParams.push(name);
    }

    if (phone !== undefined) {
      updates.push("phone = ?");
      updateParams.push(phone);
    }

    updateParams.push(userId);

    const [result] = await db.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch updated user
    const [updatedRows] = await db.query(
      "SELECT id, username, email, name, phone, role, updated_at FROM users WHERE id = ?",
      [userId]
    );

    const updatedUser = updatedRows[0];

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (err) {
    logger.error("Error updating user profile:", err);
    return res.status(500).json({ message: "Failed to update user profile" });
  }
}

/**
 * PATCH /api/users/change-password
 * Đổi mật khẩu
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Get current user
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await db.query(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newPasswordHash, userId]
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    logger.error("Error changing password:", err);
    return res.status(500).json({ message: "Failed to change password" });
  }
}

/**
 * GET /api/users (ADMIN ONLY)
 * Lấy tất cả users với filter, search, pagination
 */
async function getAllUsers(req, res) {
  try {
    const { role, search, page = 1, limit = 10, isActive } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (role) {
      whereConditions.push("role = ?");
      queryParams.push(role);
    }

    if (isActive !== undefined && isActive !== '') {
      whereConditions.push("is_active = ?");
      queryParams.push(isActive === 'true' ? 1 : 0);
    }

    if (search) {
      whereConditions.push("(email LIKE ? OR name LIKE ? OR username LIKE ? OR phone LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    logger.debug("Count Query:", { query: countQuery, params: queryParams });
    
    const [countResult] = await db.query(
      countQuery,
      queryParams.length > 0 ? queryParams : []
    );
    const total = countResult[0].total;
    logger.debug("Total users found:", total);

    // Get users - build params array correctly
    const usersQueryParams = queryParams.length > 0 ? [...queryParams] : [];
    usersQueryParams.push(parseInt(limit), offset);
    
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        name,
        phone,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    logger.debug("Users Query:", { query: usersQuery, params: usersQueryParams });
    
    const [users] = await db.query(usersQuery, usersQueryParams);
    logger.debug(`Raw users from DB: ${users.length} users`);

    // Format response
    const result = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
      isActive: user.is_active === 1,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    logger.debug(`Formatted result: ${result.length} users, total: ${total}`);

    return res.status(200).json({
      users: result,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    logger.error("Error fetching users:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

/**
 * GET /api/users/:id (ADMIN ONLY)
 * Lấy chi tiết một user
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT id, username, email, name, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
      isActive: user.is_active === 1,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    logger.error("Error fetching user:", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}

/**
 * PATCH /api/users/:id/status (ADMIN ONLY)
 * Ban/Unban user (toggle is_active)
 */
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: "isActive is required" });
    }

    // Security: Không cho phép ban admin accounts
    const [targetUser] = await db.query(
      "SELECT role FROM users WHERE id = ?",
      [id]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser[0].role === 'ADMIN' && !isActive) {
      // Prevent banning admin accounts
      return res.status(403).json({ 
        message: "Cannot ban admin account. Admin accounts are protected." 
      });
    }

    const [result] = await db.query(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [isActive ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `User ${isActive ? 'activated' : 'banned'} successfully`,
    });
  } catch (err) {
    logger.error("Error updating user status:", err);
    return res.status(500).json({ message: "Failed to update user status" });
  }
}

/**
 * PUT /api/users/:id (ADMIN ONLY)
 * Admin update user info
 */
async function updateUserByAdmin(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;
    const currentAdminId = req.user.id; // ID của admin đang thực hiện action

    // Build update query
    const updates = [];
    const updateParams = [];

    if (name !== undefined) {
      updates.push("name = ?");
      updateParams.push(name);
    }

    if (phone !== undefined) {
      updates.push("phone = ?");
      updateParams.push(phone);
    }

    if (role !== undefined) {
      if (!['USER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be USER or ADMIN" });
      }

      // Security: Không cho phép admin downgrade admin khác thành user
      // Chỉ cho phép upgrade USER → ADMIN, không cho ADMIN → USER
      if (role === 'USER') {
        // Check if target user is an admin
        const [targetUser] = await db.query(
          "SELECT role FROM users WHERE id = ?",
          [id]
        );

        if (targetUser.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        if (targetUser[0].role === 'ADMIN') {
          // Prevent downgrading admin to user
          return res.status(403).json({ 
            message: "Cannot downgrade admin account to user. Admin accounts are protected." 
          });
        }
      }

      updates.push("role = ?");
      updateParams.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    updateParams.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch updated user
    const [updatedRows] = await db.query(
      "SELECT id, username, email, name, phone, role, is_active, updated_at FROM users WHERE id = ?",
      [id]
    );

    const updatedUser = updatedRows[0];

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name || '',
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        isActive: updatedUser.is_active === 1,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (err) {
    logger.error("Error updating user:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserByAdmin,
};

