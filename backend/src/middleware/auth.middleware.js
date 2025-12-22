// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const db = require("../../db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Middleware: yêu cầu chỉ cần đăng nhập (USER hoặc ADMIN)
async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET); // { id, email, role, name }
    
    // ✅ FIX: Check is_active trong database để đảm bảo account chưa bị ban
    const [rows] = await db.query(
      "SELECT is_active FROM users WHERE id = ?",
      [payload.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ FIX: Reject nếu account bị ban (is_active = 0)
    if (rows[0].is_active === 0) {
      return res.status(403).json({ 
        message: "Your account has been banned. Please contact administrator." 
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    logger.warn("JWT verify error:", { message: err.message });
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Middleware: chỉ cho phép ADMIN
function verifyAdmin(req, res, next) {
  verifyToken(req, res, function () {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
}

// Middleware: Optional token - nếu có token thì verify, không có thì skip
// Dùng cho các route public nhưng có thể personalize nếu user login
async function optionalToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    // Không có token → skip, req.user = undefined
    return next();
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    // Token không hợp lệ → skip
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check is_active trong database
    const [rows] = await db.query(
      "SELECT is_active FROM users WHERE id = ?",
      [payload.id]
    );

    if (rows.length === 0 || rows[0].is_active === 0) {
      // User không tồn tại hoặc bị ban → skip
      return next();
    }

    req.user = payload;
    next();
  } catch (err) {
    // Token invalid/expired → skip (không throw error)
    next();
  }
}

module.exports = {
  verifyToken,
  verifyAdmin,
  optionalToken,
};
