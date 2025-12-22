// src/wishlist/wishlist.controller.js
const db = require("../../db");

/**
 * GET /api/wishlist
 * Lấy danh sách wishlist của user
 */
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        w.id,
        w.book_id AS bookId,
        w.created_at AS addedAt,
        b.title,
        b.description,
        b.category,
        b.cover_image AS coverImage,
        b.old_price AS oldPrice,
        b.new_price AS newPrice,
        b.author
      FROM wishlists w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
      `,
      [userId]
    );

    // Map to format FE expects
    const wishlistItems = rows.map((row) => ({
      wishlistId: row.id,
      addedAt: row.addedAt,
      book: {
        _id: row.bookId,
        title: row.title,
        description: row.description,
        category: row.category,
        coverImage: row.coverImage,
        oldPrice: Number(row.oldPrice),
        newPrice: Number(row.newPrice),
        author: row.author,
      },
    }));

    res.json(wishlistItems);
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({ message: "Failed to get wishlist" });
  }
}

/**
 * POST /api/wishlist
 * Body: { bookId }
 * Thêm sách vào wishlist
 */
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    // Check if book exists
    const [bookRows] = await db.query("SELECT id FROM books WHERE id = ?", [
      bookId,
    ]);
    if (bookRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if already in wishlist
    const [existingRows] = await db.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({ message: "Book already in wishlist" });
    }

    // Add to wishlist
    const [result] = await db.query(
      "INSERT INTO wishlists (user_id, book_id) VALUES (?, ?)",
      [userId, bookId]
    );

    res.status(201).json({
      message: "Added to wishlist",
      wishlistId: result.insertId,
    });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
}

/**
 * DELETE /api/wishlist/:bookId
 * Xóa sách khỏi wishlist
 */
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    // Check if exists
    const [existingRows] = await db.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Book not in wishlist" });
    }

    // Remove from wishlist
    await db.query("DELETE FROM wishlists WHERE user_id = ? AND book_id = ?", [
      userId,
      bookId,
    ]);

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
}

/**
 * GET /api/wishlist/check/:bookId
 * Kiểm tra sách có trong wishlist không
 */
async function checkWishlist(req, res) {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);

    const [rows] = await db.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    res.json({ inWishlist: rows.length > 0 });
  } catch (error) {
    console.error("Error in checkWishlist:", error);
    res.status(500).json({ message: "Failed to check wishlist" });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};


