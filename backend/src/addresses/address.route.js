// src/addresses/address.route.js
const express = require("express");
const {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("./address.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validateAddress } = require("../middleware/validation.middleware");

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(verifyToken);

// GET /api/addresses - Lấy tất cả địa chỉ của user
router.get("/", getUserAddresses);

// GET /api/addresses/:id - Lấy 1 địa chỉ theo ID
router.get("/:id", getAddressById);

// POST /api/addresses - Tạo địa chỉ mới
router.post("/", validateAddress, createAddress);

// PUT /api/addresses/:id - Cập nhật địa chỉ
router.put("/:id", validateAddress, updateAddress);

// DELETE /api/addresses/:id - Xóa địa chỉ
router.delete("/:id", deleteAddress);

// PATCH /api/addresses/:id/set-default - Đặt địa chỉ làm mặc định
router.patch("/:id/set-default", setDefaultAddress);

module.exports = router;

