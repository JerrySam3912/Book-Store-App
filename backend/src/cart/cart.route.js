// src/cart/cart.route.js
const express = require("express");
const router = express.Router();

const {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("./cart.controller");

// Tất cả route này sẽ được bọc bởi verifyToken ở index.js

// Lấy cart hiện tại
router.get("/", getCart);

// Thêm item vào cart
router.post("/items", addItemToCart);

// Cập nhật quantity
router.patch("/items/:itemId", updateCartItemQuantity);

// Xoá 1 item
router.delete("/items/:itemId", removeCartItem);

// Xoá toàn bộ cart
router.delete("/", clearCart);

module.exports = router;
