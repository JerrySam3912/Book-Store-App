// src/payments/payment.route.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  createVnpayPaymentUrl,
  vnpayReturn,
  vnpayIPN
} = require("./payment.controller");

// Create VNPay payment URL (requires authentication)
router.post("/vnpay/create-url", verifyToken, createVnpayPaymentUrl);

// VNPay return URL (public - VNPay redirects user here)
router.get("/vnpay-return", vnpayReturn);

// VNPay IPN (public - VNPay server calls this)
router.get("/vnpay-ipn", vnpayIPN);

module.exports = router;
