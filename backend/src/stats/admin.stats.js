// backend/src/stats/admin.stats.js
const express = require("express");
const router = express.Router();
const db = require("../../db");
const logger = require("../utils/logger");
const { generateMonthlyOrders } = require("../utils/demoDataGenerator");
require("dotenv").config();

// Helper: convert month number → name (1 → "Jan")
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Check if demo data should be used
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === '1';

router.get("/", async (req, res) => {
  try {
    // 1. Total books
    const [booksCountResult] = await db.query(`SELECT COUNT(*) AS totalBooks FROM books`);
    const totalBooks = booksCountResult[0].totalBooks;

    // 2. Total orders
    const [ordersCountResult] = await db.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const totalOrders = ordersCountResult[0].totalOrders;

    // 3. Total sales (sum of total_price in orders)
    const [salesResult] = await db.query(`SELECT SUM(total_price) AS totalSales FROM orders`);
    const totalSales = salesResult[0].totalSales || 0;

    // 4. Trending books count
    const [trendingBooksResult] = await db.query(
      `SELECT COUNT(*) AS trendingBooks FROM books WHERE trending = 1`
    );
    const trendingBooks = trendingBooksResult[0].trendingBooks;

    // 5. Monthly orders - ✅ Hybrid: Use demo data if flag is set
    let monthlyOrders;
    if (USE_DEMO_DATA) {
      monthlyOrders = generateMonthlyOrders();
    } else {
      const [monthlyRows] = await db.query(`
        SELECT 
          MONTH(created_at) AS month,
          COUNT(*) AS orders
        FROM orders
        GROUP BY MONTH(created_at)
        ORDER BY MONTH(created_at)
      `);

      // Convert to frontend format
      monthlyOrders = monthlyRows.map((row) => ({
        month: MONTHS[row.month - 1],
        orders: row.orders,
      }));
    }

    // 6. Recent Orders (5 most recent)
    const [recentOrdersRows] = await db.query(`
      SELECT 
        id,
        name,
        email,
        total_price,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentOrders = recentOrdersRows.map(order => ({
      id: order.id,
      name: order.name,
      email: order.email,
      totalPrice: parseFloat(order.total_price) || 0,
      status: order.status,
      createdAt: order.created_at,
    }));

    // 7. Top Selling Books (top 5 by quantity sold)
    const [topBooksRows] = await db.query(`
      SELECT 
        b.id,
        b.title,
        b.cover_image,
        b.new_price,
        COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM books b
      LEFT JOIN order_items oi ON b.id = oi.book_id
      GROUP BY b.id, b.title, b.cover_image, b.new_price
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    const topSellingBooks = topBooksRows.map(book => ({
      id: book.id,
      title: book.title,
      coverImage: book.cover_image,
      price: parseFloat(book.new_price) || 0,
      totalSold: parseInt(book.total_sold) || 0,
    }));

    // 8. Recent Users (5 most recent)
    const [recentUsersRows] = await db.query(`
      SELECT 
        id,
        username,
        email,
        name,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentUsers = recentUsersRows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      role: user.role,
      createdAt: user.created_at,
    }));

    // Send response matching Dashboard.jsx format
    return res.status(200).json({
      totalBooks,
      totalSales,
      trendingBooks,
      totalOrders,
      monthlyOrders,   // used in RevenueChart component
      recentOrders,
      topSellingBooks,
      recentUsers,
    });
  } catch (error) {
    logger.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

module.exports = router;
