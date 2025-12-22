// src/books/book.controller.js
const db = require("../../db");
const logger = require("../utils/logger");
const { sendNewBookNotification } = require("../utils/emailService");
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_PAGE_LIMIT } = require("../utils/constants");

// ✅ Helper: convert MySQL row -> format FE đang dùng
function mapBookRow(row) {
  if (!row) return null;

  return {
    _id: row.id,                     // FE đang dùng _id
    id: row.id,                      // Also include id for email service
    title: row.title,
    description: row.description,
    category: row.category,
    author: row.author || null,      // Include author if exists
    trending: !!row.trending,        // 0/1 -> true/false
    coverImage: row.cover_image,     // snake_case -> camelCase
    oldPrice: Number(row.old_price),
    newPrice: Number(row.new_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ✅ Helper: convert input trending (bool/string/undefined) -> 0/1
function toTrendingValue(input, fallback) {
  if (typeof input === "boolean") {
    return input ? 1 : 0;
  }
  if (typeof input === "string") {
    const v = input.toLowerCase();
    if (v === "true" || v === "1" || v === "on") return 1;
    if (v === "false" || v === "0" || v === "off") return 0;
  }
  // nếu không truyền hoặc không parse được, dùng fallback (thường là giá trị cũ trong DB)
  return typeof fallback === "number" ? fallback : 0;
}

// Tạo sách mới (ADMIN)
async function createBook(req, res) {
  try {
    const {
      title,
      description,
      category,
      trending,
      coverImage,
      oldPrice,
      newPrice,
    } = req.body;

    // validate đơn giản
    if (!title || !description || !category || oldPrice == null || newPrice == null) {
      return res
        .status(400)
        .json({ message: "Missing required book fields" });
    }

    const trendingValue = toTrendingValue(trending, 0);
    const { author } = req.body; // Get author if provided

    const [result] = await db.query(
      `
      INSERT INTO books 
        (title, description, category, author, trending, cover_image, old_price, new_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        description,
        category,
        author || null,
        trendingValue,
        coverImage || null,
        oldPrice,
        newPrice,
      ]
    );

    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [
      result.insertId,
    ]);

    const book = mapBookRow(rows[0]);

    // Send email notification to subscribers (async, don't wait for it)
    sendNewBookNotification(book).catch(err => {
      logger.error("Failed to send new book notifications:", err);
      // Don't fail the request if email sending fails
    });

    return res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (err) {
    logger.error("Error creating book:", err);
    return res.status(500).json({ message: "Failed to create book" });
  }
}

// Lấy tất cả sách (PUBLIC) - Hỗ trợ Search, Filter, Pagination
async function getAllBooks(req, res) {
  try {
    const {
      search = "",
      category = "",
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      sort = "newest", // newest, oldest, price_low, price_high
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(MAX_PAGE_LIMIT, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Search by title or description
    if (search.trim()) {
      whereConditions.push("(title LIKE ? OR description LIKE ? OR author LIKE ?)");
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by category
    if (category.trim() && category.toLowerCase() !== "all") {
      whereConditions.push("category = ?");
      queryParams.push(category.toLowerCase());
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Sort order
    let orderClause = "ORDER BY created_at DESC"; // default: newest
    switch (sort) {
      case "oldest":
        orderClause = "ORDER BY created_at ASC";
        break;
      case "price_low":
        orderClause = "ORDER BY new_price ASC";
        break;
      case "price_high":
        orderClause = "ORDER BY new_price DESC";
        break;
      case "title":
        orderClause = "ORDER BY title ASC";
        break;
    }

    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM books ${whereClause}`,
      queryParams
    );
    const totalBooks = countResult[0].total;
    const totalPages = Math.ceil(totalBooks / limitNum);

    // Get paginated books
    const [rows] = await db.query(
      `SELECT * FROM books ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      [...queryParams, limitNum, offset]
    );

    const books = rows.map(mapBookRow);

    // Return với pagination metadata
    return res.status(200).json({
      books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    logger.error("Error fetching books:", err);
    return res.status(500).json({ message: "Failed to fetch books" });
  }
}

// Lấy danh sách categories (PUBLIC)
async function getCategories(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category"
    );
    
    const categories = rows.map(row => row.category);
    
    return res.status(200).json(categories);
  } catch (err) {
    logger.error("Error fetching categories:", err);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}

// Lấy 1 sách theo id (PUBLIC)
async function getBookById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = mapBookRow(rows[0]);

    return res.status(200).json(book);
  } catch (err) {
    logger.error("Error fetching book:", err);
    return res.status(500).json({ message: "Failed to fetch book" });
  }
}

// Cập nhật sách (ADMIN)
async function updateBook(req, res) {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    trending,
    coverImage,
    oldPrice,
    newPrice,
  } = req.body;

  try {
    const [existingRows] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const current = existingRows[0];

    const trendingValue = toTrendingValue(trending, current.trending);
    const newCover =
      coverImage !== undefined ? coverImage : current.cover_image;

    await db.query(
      `
      UPDATE books SET
        title = ?,
        description = ?,
        category = ?,
        trending = ?,
        cover_image = ?,
        old_price = ?,
        new_price = ?
      WHERE id = ?
    `,
      [
        title || current.title,
        description || current.description,
        category || current.category,
        trendingValue,
        newCover,
        oldPrice !== undefined ? oldPrice : current.old_price,
        newPrice !== undefined ? newPrice : current.new_price,
        id,
      ]
    );

    const [updatedRows] = await db.query("SELECT * FROM books WHERE id = ?", [
      id,
    ]);

    const book = mapBookRow(updatedRows[0]);

    return res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (err) {
    logger.error("Error updating book:", err);
    return res.status(500).json({ message: "Failed to update book" });
  }
}

// Xoá sách (ADMIN)
async function deleteBook(req, res) {
  const { id } = req.params;

  try {
    const [existingRows] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    await db.query("DELETE FROM books WHERE id = ?", [id]);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    logger.error("Error deleting book:", err);
    return res.status(500).json({ message: "Failed to delete book" });
  }
}

// ✅ Hybrid Recommendation System
// GET /api/books/recommended
// Logic:
// 1. User chưa login → Trending + High Rating
// 2. User đã login, có orders/wishlist → 70% Category-based + 30% Trending
// 3. User đã login, chưa có lịch sử → Trending + High Rating
async function getRecommendedBooks(req, res) {
  try {
    const userId = req.user?.id; // Optional: có thể không có nếu user chưa login
    const limit = 10;

    // Helper: Lấy trending + high rating books (fallback)
    async function getTrendingAndHighRatingBooks(count) {
      const [rows] = await db.query(
        `
        SELECT b.*, 
               COALESCE(AVG(r.rating), 0) AS avg_rating,
               COUNT(r.id) AS review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.trending = 1 OR (SELECT AVG(rating) FROM reviews WHERE book_id = b.id) >= 4.0
        GROUP BY b.id
        ORDER BY b.trending DESC, avg_rating DESC, review_count DESC
        LIMIT ?
        `,
        [count]
      );
      return rows.map(mapBookRow);
    }

    // Case 1: User chưa login → Trending + High Rating
    if (!userId) {
      const books = await getTrendingAndHighRatingBooks(limit);
      return res.status(200).json({ books });
    }

    // Case 2 & 3: User đã login → Check orders + wishlist
    // Lấy categories từ orders
    const [orderCategories] = await db.query(
      `
      SELECT b.category, COUNT(*) AS count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN books b ON oi.book_id = b.id
      WHERE o.user_id = ? AND b.category IS NOT NULL
      GROUP BY b.category
      ORDER BY count DESC
      `,
      [userId]
    );

    // Lấy categories từ wishlist
    const [wishlistCategories] = await db.query(
      `
      SELECT b.category, COUNT(*) AS count
      FROM wishlists w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ? AND b.category IS NOT NULL
      GROUP BY b.category
      ORDER BY count DESC
      `,
      [userId]
    );

    // Combine và count frequency
    const categoryMap = new Map();
    
    // Add từ orders (weight = 2 vì đã mua = quan tâm hơn)
    orderCategories.forEach(row => {
      const current = categoryMap.get(row.category) || 0;
      categoryMap.set(row.category, current + row.count * 2);
    });

    // Add từ wishlist (weight = 1)
    wishlistCategories.forEach(row => {
      const current = categoryMap.get(row.category) || 0;
      categoryMap.set(row.category, current + row.count);
    });

    // Case 3: User chưa có lịch sử → Fallback
    if (categoryMap.size === 0) {
      const books = await getTrendingAndHighRatingBooks(limit);
      return res.status(200).json({ books });
    }

    // Case 2: User có lịch sử → Hybrid: 70% Category-based + 30% Trending
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3 categories
      .map(([category]) => category);

    const categoryCount = Math.ceil(limit * 0.7); // 7 sách
    const trendingCount = limit - categoryCount; // 3 sách

    // Lấy books từ top categories (ưu tiên trending trong category)
    const categoryBooks = [];
    for (const category of topCategories) {
      if (categoryBooks.length >= categoryCount) break;
      
      const remaining = categoryCount - categoryBooks.length;
      const [rows] = await db.query(
        `
        SELECT b.*, 
               COALESCE(AVG(r.rating), 0) AS avg_rating,
               COUNT(r.id) AS review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.category = ? 
          AND b.id NOT IN (SELECT book_id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = ?)
          AND b.id NOT IN (SELECT book_id FROM wishlists WHERE user_id = ?)
        GROUP BY b.id
        ORDER BY b.trending DESC, avg_rating DESC, review_count DESC
        LIMIT ?
        `,
        [category, userId, userId, remaining]
      );
      
      const mapped = rows.map(mapBookRow);
      categoryBooks.push(...mapped);
    }

    // Lấy trending books để đa dạng (không trùng với category books)
    const categoryBookIds = categoryBooks.map(b => b._id);
    let trendingRows;
    if (categoryBookIds.length > 0) {
      const placeholders = categoryBookIds.map(() => '?').join(',');
      const [rows] = await db.query(
        `
        SELECT b.*, 
               COALESCE(AVG(r.rating), 0) AS avg_rating,
               COUNT(r.id) AS review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.trending = 1
          AND b.id NOT IN (${placeholders})
        GROUP BY b.id
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT ?
        `,
        [...categoryBookIds, trendingCount]
      );
      trendingRows = rows;
    } else {
      const [rows] = await db.query(
        `
        SELECT b.*, 
               COALESCE(AVG(r.rating), 0) AS avg_rating,
               COUNT(r.id) AS review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.trending = 1
        GROUP BY b.id
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT ?
        `,
        [trendingCount]
      );
      trendingRows = rows;
    }

    const trendingBooks = trendingRows.map(mapBookRow);

    // Combine: 70% category + 30% trending
    const allBooks = [...categoryBooks.slice(0, categoryCount), ...trendingBooks];
    
    // Nếu chưa đủ 10, bổ sung bằng trending + high rating
    if (allBooks.length < limit) {
      const existingIds = allBooks.map(b => b._id);
      let additionalRows;
      if (existingIds.length > 0) {
        const placeholders = existingIds.map(() => '?').join(',');
        const [rows] = await db.query(
          `
          SELECT b.*, 
                 COALESCE(AVG(r.rating), 0) AS avg_rating,
                 COUNT(r.id) AS review_count
          FROM books b
          LEFT JOIN reviews r ON b.id = r.book_id
          WHERE b.id NOT IN (${placeholders})
          GROUP BY b.id
          ORDER BY b.trending DESC, avg_rating DESC, review_count DESC
          LIMIT ?
          `,
          [...existingIds, limit - allBooks.length]
        );
        additionalRows = rows;
      } else {
        const [rows] = await db.query(
          `
          SELECT b.*, 
                 COALESCE(AVG(r.rating), 0) AS avg_rating,
                 COUNT(r.id) AS review_count
          FROM books b
          LEFT JOIN reviews r ON b.id = r.book_id
          GROUP BY b.id
          ORDER BY b.trending DESC, avg_rating DESC, review_count DESC
          LIMIT ?
          `,
          [limit - allBooks.length]
        );
        additionalRows = rows;
      }
      allBooks.push(...additionalRows.map(mapBookRow));
    }

    return res.status(200).json({ 
      books: allBooks.slice(0, limit),
      method: 'hybrid' // Debug: biết đang dùng phương pháp nào
    });
  } catch (err) {
    logger.error("Error in getRecommendedBooks:", err);
    // Fallback: return trending books nếu có lỗi
    try {
      const [rows] = await db.query(
        "SELECT * FROM books WHERE trending = 1 LIMIT ?",
        [10]
      );
      return res.status(200).json({ books: rows.map(mapBookRow) });
    } catch (fallbackErr) {
      return res.status(500).json({ message: "Failed to get recommended books" });
    }
  }
}

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getCategories,
  getRecommendedBooks,
};
