// src/wishlist/wishlist.route.js
const express = require("express");
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("./wishlist.controller");

// Tất cả routes này đều require authentication (verifyToken)
// được setup ở index.js

// Lấy danh sách wishlist
router.get("/", getWishlist);

// Thêm sách vào wishlist
router.post("/", addToWishlist);

// Xóa sách khỏi wishlist
router.delete("/:bookId", removeFromWishlist);

// Kiểm tra sách có trong wishlist không
router.get("/check/:bookId", checkWishlist);

module.exports = router;


