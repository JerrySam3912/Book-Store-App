// src/auth/auth.route.js
const express = require("express");
const { register, login, adminLogin, forgotPassword, resetPassword } = require("./auth.controller");
const { validateRegister, validateLogin, handleValidationErrors } = require("../middleware/validation.middleware");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimiter");
const { body } = require("express-validator");

const router = express.Router();

// POST /api/auth/register
router.post("/register", authLimiter, validateRegister, register);

// POST /api/auth/login
router.post("/login", authLimiter, validateLogin, login);

// POST /api/auth/admin-login
router.post("/admin-login", authLimiter, validateLogin, adminLogin);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  passwordResetLimiter,
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    handleValidationErrors,
  ],
  forgotPassword
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  passwordResetLimiter,
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one letter and one number"),
    handleValidationErrors,
  ],
  resetPassword
);

module.exports = router;
