// src/subscriptions/subscription.route.js
const express = require("express");
const { verifyAdmin } = require("../middleware/auth.middleware");
const { verifyToken } = require("../middleware/auth.middleware");
const {
  subscribe,
  unsubscribe,
  checkSubscription,
  getAllSubscribers,
} = require("./subscription.controller");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validation.middleware");

const router = express.Router();

// Public routes
// POST /api/subscriptions - Subscribe (public)
router.post(
  "/",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Name must not exceed 255 characters"),
    handleValidationErrors,
  ],
  subscribe
);

// POST /api/subscriptions/unsubscribe - Unsubscribe (public)
router.post(
  "/unsubscribe",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    handleValidationErrors,
  ],
  unsubscribe
);

// GET /api/subscriptions/check - Check subscription status (optional auth)
router.get("/check", checkSubscription);

// Admin routes
// GET /api/subscriptions/all - Get all subscribers (admin only)
router.get("/all", verifyAdmin, getAllSubscribers);

module.exports = router;

