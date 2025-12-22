// src/reviews/review.controller.js
const db = require("../../db");
const logger = require("../utils/logger");

/**
 * GET /api/reviews/book/:bookId
 * Lấy tất cả reviews của 1 sách
 */
async function getBookReviews(req, res) {
  try {
    const bookId = Number(req.params.bookId);

    const [rows] = await db.query(
      `
      SELECT 
        r.id,
        r.user_id AS userId,
        r.book_id AS bookId,
        r.rating,
        r.comment,
        r.created_at AS createdAt,
        u.name AS userName,
        u.email AS userEmail
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
      `,
      [bookId]
    );

    // Tính rating trung bình
    const totalRating = rows.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = rows.length > 0 ? (totalRating / rows.length).toFixed(1) : 0;

    res.json({
      reviews: rows,
      totalReviews: rows.length,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    logger.error("Error in getBookReviews:", error);
    res.status(500).json({ message: "Failed to get reviews" });
  }
}

/**
 * POST /api/reviews
 * Body: { bookId, rating, comment }
 * Tạo review mới (user phải đăng nhập)
 */
async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { bookId, rating, comment } = req.body;

    // Convert to numbers
    const bookIdNum = Number(bookId);
    const ratingNum = Number(rating);

    // Validate
    if (!bookId || !rating) {
      return res.status(400).json({ message: "bookId and rating are required" });
    }

    if (isNaN(bookIdNum) || bookIdNum < 1) {
      return res.status(400).json({ message: "bookId must be a valid positive integer" });
    }

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if book exists
    const [bookRows] = await db.query("SELECT id FROM books WHERE id = ?", [bookIdNum]);
    if (bookRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user already reviewed this book
    const [existingReview] = await db.query(
      "SELECT id FROM reviews WHERE user_id = ? AND book_id = ?",
      [userId, bookIdNum]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({ message: "You have already reviewed this book" });
    }

    // Create review
    const [result] = await db.query(
      "INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, bookIdNum, ratingNum, comment || null]
    );

    // Get the created review with user info
    const [newReview] = await db.query(
      `
      SELECT 
        r.id,
        r.user_id AS userId,
        r.book_id AS bookId,
        r.rating,
        r.comment,
        r.created_at AS createdAt,
        u.name AS userName,
        u.email AS userEmail
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      message: "Review created successfully",
      review: newReview[0],
    });
  } catch (error) {
    logger.error("Error in createReview:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
}

/**
 * PUT /api/reviews/:reviewId
 * Body: { rating, comment }
 * Cập nhật review (chỉ owner mới được sửa)
 */
async function updateReview(req, res) {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.reviewId);
    const { rating, comment } = req.body;

    // Check if review exists and belongs to user
    const [existingReview] = await db.query(
      "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );

    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Review not found or you don't have permission" });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Update review
    await db.query(
      "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
      [rating || existingReview[0].rating, comment !== undefined ? comment : existingReview[0].comment, reviewId]
    );

    // Get updated review
    const [updatedReview] = await db.query(
      `
      SELECT 
        r.id,
        r.user_id AS userId,
        r.book_id AS bookId,
        r.rating,
        r.comment,
        r.created_at AS createdAt,
        u.name AS userName,
        u.email AS userEmail
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
      `,
      [reviewId]
    );

    res.json({
      message: "Review updated successfully",
      review: updatedReview[0],
    });
  } catch (error) {
    logger.error("Error in updateReview:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
}

/**
 * DELETE /api/reviews/:reviewId
 * Xóa review (chỉ owner hoặc admin mới được xóa)
 */
async function deleteReview(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const reviewId = Number(req.params.reviewId);

    // Check if review exists
    const [existingReview] = await db.query("SELECT * FROM reviews WHERE id = ?", [reviewId]);

    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check permission (owner or admin)
    if (existingReview[0].user_id !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ message: "You don't have permission to delete this review" });
    }

    // Delete review
    await db.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteReview:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
}

/**
 * GET /api/reviews/user/:userId
 * Lấy tất cả reviews của 1 user
 */
async function getUserReviews(req, res) {
  try {
    const targetUserId = Number(req.params.userId);

    const [rows] = await db.query(
      `
      SELECT 
        r.id,
        r.user_id AS userId,
        r.book_id AS bookId,
        r.rating,
        r.comment,
        r.created_at AS createdAt,
        b.title AS bookTitle,
        b.cover_image AS bookCoverImage
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      `,
      [targetUserId]
    );

    res.json(rows);
  } catch (error) {
    logger.error("Error in getUserReviews:", error);
    res.status(500).json({ message: "Failed to get user reviews" });
  }
}

module.exports = {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
};


