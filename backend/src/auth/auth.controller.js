// src/auth/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const logger = require("../utils/logger");
const { AppError, asyncHandler, handleMySQLError } = require("../middleware/errorHandler");
const { JWT_EXPIRY, SALT_ROUNDS, PASSWORD_RESET_EXPIRY, MIN_PASSWORD_LENGTH } = require("../utils/constants");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// REGISTER: user thường (role = USER)
async function register(req, res) {
  const { name, email, password, username } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Generate username from email if not provided
    let finalUsername = username;
    if (!finalUsername) {
      // Use email prefix as username, replace invalid chars
      finalUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      // Ensure uniqueness by appending random number if needed
      let counter = 1;
      let tempUsername = finalUsername;
      while (true) {
        const [existingUser] = await db.query(
          "SELECT id FROM users WHERE username = ?",
          [tempUsername]
        );
        if (existingUser.length === 0) {
          finalUsername = tempUsername;
          break;
        }
        tempUsername = `${finalUsername}_${counter}`;
        counter++;
      }
    }

    // Check trùng email
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Check trùng username
    const [existingUsername] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [finalUsername]
    );

    if (existingUsername.length > 0) {
      return res.status(409).json({ message: "Username already in use" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO users (username, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'USER')",
      [finalUsername, email, name || null, passwordHash]
    );

    const user = {
      id: result.insertId,
      username: finalUsername,
      email,
      name: name || null,
      role: "USER",
    };

    // Tạo token
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (err) {
    logger.error("Register error:", err);
    const mysqlError = handleMySQLError(err);
    if (mysqlError.isOperational) {
      return res.status(mysqlError.statusCode).json({ message: mysqlError.message });
    }
    return res.status(500).json({ message: "Failed to register user" });
  }
}

// LOGIN chung (USER & ADMIN)
async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ FIX: SELECT thêm is_active để check account status
    const [rows] = await db.query(
      "SELECT id, username, email, name, password_hash, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // ✅ FIX: Check is_active TRƯỚC khi verify password (security best practice)
    if (user.is_active === 0) {
      return res.status(403).json({ 
        message: "Your account has been banned. Please contact administrator." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (err) {
    logger.error("Login error:", err);
    return res.status(500).json({ message: "Failed to login" });
  }
}

// ADMIN LOGIN (bắt buộc role = ADMIN)
async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ FIX: SELECT thêm is_active để check account status
    const [rows] = await db.query(
      "SELECT id, username, email, name, password_hash, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not an admin account" });
    }

    // ✅ FIX: Check is_active TRƯỚC khi verify password
    if (user.is_active === 0) {
      return res.status(403).json({ 
        message: "Your admin account has been banned. Please contact administrator." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: payload,
    });
  } catch (err) {
    logger.error("Admin login error:", err);
    return res.status(500).json({ message: "Failed to login as admin" });
  }
}

// FORGOT PASSWORD: Generate reset token
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [rows] = await db.query(
      "SELECT id, email, username FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        type: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: PASSWORD_RESET_EXPIRY }
    );

    // In production, send email with reset link
    // For development, we'll log it or return it
    // TODO: Integrate email service (nodemailer, SendGrid, etc.)
    logger.info(`Password Reset Token requested for ${user.email}`);
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Reset Link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    }

    // In development, return token in response (remove in production!)
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        message: "Password reset token generated",
        resetToken, // ⚠️ Remove this in production!
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
      });
    }

    // In production, just return success message
    return res.status(200).json({
      message: "If that email exists, a password reset link has been sent to your email.",
    });
  } catch (err) {
    logger.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to process password reset request" });
  }
}

// RESET PASSWORD: Verify token and update password
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if token is for password reset
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ message: "Invalid token type" });
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
      }
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check if user still exists
    const [rows] = await db.query(
      "SELECT id FROM users WHERE id = ? AND email = ?",
      [decoded.id, decoded.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await db.query(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [passwordHash, decoded.id]
    );

    return res.status(200).json({
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    logger.error("Reset password error:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
};
