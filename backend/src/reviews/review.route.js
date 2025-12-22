// src/reviews/review.route.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { validateReview } = require("../middleware/validation.middleware");

const {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} = require("./review.controller");

// Public routes (không cần đăng nhập)
// Lấy reviews của 1 sách
router.get("/book/:bookId", getBookReviews);

// Lấy reviews của 1 user
router.get("/user/:userId", getUserReviews);

// Protected routes (cần đăng nhập)
// Tạo review mới
router.post("/", verifyToken, validateReview, createReview);

// Cập nhật review
router.put("/:reviewId", verifyToken, validateReview, updateReview);

// Xóa review
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports = router;


