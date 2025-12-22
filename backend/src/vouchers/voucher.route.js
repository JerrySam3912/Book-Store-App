// src/vouchers/voucher.route.js
const express = require("express");
const {
  getAvailableVouchers,
  validateVoucherCode,
} = require("./voucher.controller");

const router = express.Router();

// Lấy danh sách voucher có sẵn (public)
router.get("/", getAvailableVouchers);

// Validate voucher code (public, nhưng có thể thêm rate limiting)
router.post("/validate", validateVoucherCode);

module.exports = router;

