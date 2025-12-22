// src/books/book.route.js
const express = require("express");
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getCategories,
  getRecommendedBooks,
} = require("./book.controller");
const { verifyAdmin, optionalToken } = require("../middleware/auth.middleware");
const { validateCreateBook, validateUpdateBook } = require("../middleware/validation.middleware");

const router = express.Router();

// POST /api/books/create-book (ADMIN)
router.post("/create-book", verifyAdmin, validateCreateBook, createBook);

// GET /api/books (PUBLIC) - Hỗ trợ search, filter, pagination
router.get("/", getAllBooks);

// GET /api/books/categories (PUBLIC) - Lấy danh sách categories
router.get("/categories", getCategories);

// GET /api/books/recommended (PUBLIC - Optional auth) - Hybrid Recommendation
// User chưa login → Trending + High Rating
// User đã login → 70% Category-based + 30% Trending
router.get("/recommended", optionalToken, getRecommendedBooks);

// GET /api/books/:id (PUBLIC)
router.get("/:id", getBookById);

// PUT /api/books/edit/:id (ADMIN)
router.put("/edit/:id", verifyAdmin, validateUpdateBook, updateBook);

// DELETE /api/books/:id (ADMIN)
router.delete("/:id", verifyAdmin, deleteBook);

module.exports = router;
