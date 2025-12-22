// src/stats/analytics.controller.js
const db = require("../../db");
const logger = require("../utils/logger");
const {
  generateSalesByCategory,
  generateRevenueTrends,
  generateUserGrowth,
  generateOrderStatusDistribution,
  generateTopCustomers,
  generateTopSellingBooks,
  generateAnalyticsSummary
} = require("../utils/demoDataGenerator");
require("dotenv").config();

// Check if demo data should be used
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === '1';

/**
 * GET /api/admin/analytics/sales-by-category
 * Get sales statistics by category
 */
async function getSalesByCategory(req, res) {
  try {
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateSalesByCategory(),
        isDemo: true // Flag to indicate demo data
      });
    }

    const [results] = await db.query(`
      SELECT 
        c.name as category_name,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      INNER JOIN books b ON oi.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY c.id, c.name
      HAVING c.name IS NOT NULL
      ORDER BY total_revenue DESC
    `);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        category: row.category_name,
        orders: row.total_orders,
        quantity: row.total_quantity,
        revenue: parseFloat(row.total_revenue || 0)
      }))
    });
  } catch (err) {
    logger.error("Error fetching sales by category:", err);
    return res.status(500).json({ message: "Failed to fetch sales by category" });
  }
}

/**
 * GET /api/admin/analytics/revenue-trends
 * Get revenue trends over time (last 12 months)
 */
async function getRevenueTrends(req, res) {
  try {
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateRevenueTrends(),
        isDemo: true
      });
    }

    const [results] = await db.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') as month,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total_price) as revenue,
        SUM(oi.quantity) as items_sold
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        month: row.month,
        orders: row.order_count,
        revenue: parseFloat(row.revenue || 0),
        itemsSold: row.items_sold || 0
      }))
    });
  } catch (err) {
    logger.error("Error fetching revenue trends:", err);
    return res.status(500).json({ message: "Failed to fetch revenue trends" });
  }
}

/**
 * GET /api/admin/analytics/user-growth
 * Get user growth over time (last 12 months)
 */
async function getUserGrowth(req, res) {
  try {
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateUserGrowth(),
        isDemo: true
      });
    }

    const [results] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        month: row.month,
        newUsers: row.new_users
      }))
    });
  } catch (err) {
    console.error("Error fetching user growth:", err);
    return res.status(500).json({ message: "Failed to fetch user growth" });
  }
}

/**
 * GET /api/admin/analytics/order-status-distribution
 * Get distribution of orders by status
 */
async function getOrderStatusDistribution(req, res) {
  try {
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateOrderStatusDistribution(),
        isDemo: true
      });
    }

    // ✅ FIX: Đếm order status distribution
    // Logic:
    // 1. CANCELLED luôn giữ nguyên (ưu tiên cao nhất)
    // 2. SHIPPED và COMPLETED giữ nguyên status (không quan tâm payment_status)
    // 3. Nếu status = 'PENDING' và payment_status = 'PAID' → đếm vào 'PAID' (fix lỗi IPN chưa chạy)
    // 4. Các trường hợp khác giữ nguyên status
    const [results] = await db.query(`
      SELECT 
        CASE 
          WHEN status = 'CANCELLED' THEN 'CANCELLED'
          WHEN status IN ('SHIPPED', 'COMPLETED') THEN status
          WHEN status = 'PENDING' AND payment_status = 'PAID' THEN 'PAID'
          ELSE status
        END as status,
        COUNT(*) as count,
        SUM(total_price) as total_revenue
      FROM orders
      GROUP BY 
        CASE 
          WHEN status = 'CANCELLED' THEN 'CANCELLED'
          WHEN status IN ('SHIPPED', 'COMPLETED') THEN status
          WHEN status = 'PENDING' AND payment_status = 'PAID' THEN 'PAID'
          ELSE status
        END
      ORDER BY count DESC
    `);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        status: row.status,
        count: row.count,
        revenue: parseFloat(row.total_revenue || 0)
      }))
    });
  } catch (err) {
    logger.error("Error fetching order status distribution:", err);
    return res.status(500).json({ message: "Failed to fetch order status distribution" });
  }
}

/**
 * GET /api/admin/analytics/top-customers
 * Get top customers by total spending
 */
async function getTopCustomers(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateTopCustomers(limit),
        isDemo: true
      });
    }
    
    const [results] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.name,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_price) as total_spent
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY u.id, u.username, u.email, u.name
      ORDER BY total_spent DESC
      LIMIT ?
    `, [limit]);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        name: row.name || row.username,
        totalOrders: row.total_orders,
        totalSpent: parseFloat(row.total_spent || 0)
      }))
    });
  } catch (err) {
    console.error("Error fetching top customers:", err);
    return res.status(500).json({ message: "Failed to fetch top customers" });
  }
}

/**
 * GET /api/admin/analytics/top-selling-books
 * Get top selling books
 */
async function getTopSellingBooks(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateTopSellingBooks(limit),
        isDemo: true
      });
    }
    
    const [results] = await db.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.cover_image,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM books b
      INNER JOIN order_items oi ON b.id = oi.book_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY b.id, b.title, b.author, b.cover_image
      ORDER BY total_sold DESC
      LIMIT ?
    `, [limit]);

    return res.status(200).json({
      success: true,
      data: results.map(row => ({
        id: row.id,
        title: row.title,
        author: row.author || 'Unknown',
        imageUrl: row.cover_image || null,
        totalSold: row.total_sold || 0,
        revenue: parseFloat(row.total_revenue || 0)
      }))
    });
  } catch (err) {
    logger.error("Error fetching top selling books:", err);
    return res.status(500).json({ message: "Failed to fetch top selling books" });
  }
}

/**
 * GET /api/admin/analytics/summary
 * Get overall analytics summary
 */
async function getAnalyticsSummary(req, res) {
  try {
    // ✅ Hybrid: Return demo data if flag is set
    if (USE_DEMO_DATA) {
      return res.status(200).json({
        success: true,
        data: generateAnalyticsSummary(),
        isDemo: true
      });
    }

    // Total revenue
    const [revenueResult] = await db.query(`
      SELECT SUM(total_price) as total_revenue
      FROM orders
      WHERE status IN ('PAID', 'SHIPPED', 'COMPLETED')
    `);

    // Total orders
    const [ordersResult] = await db.query(`
      SELECT COUNT(*) as total_orders
      FROM orders
    `);

    // Total users
    const [usersResult] = await db.query(`
      SELECT COUNT(*) as total_users
      FROM users
    `);

    // Total books
    const [booksResult] = await db.query(`
      SELECT COUNT(*) as total_books
      FROM books
    `);

    // This month revenue
    const [monthRevenueResult] = await db.query(`
      SELECT SUM(total_price) as month_revenue
      FROM orders
      WHERE status IN ('PAID', 'SHIPPED', 'COMPLETED')
        AND MONTH(created_at) = MONTH(NOW())
        AND YEAR(created_at) = YEAR(NOW())
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || 0),
        totalOrders: ordersResult[0]?.total_orders || 0,
        totalUsers: usersResult[0]?.total_users || 0,
        totalBooks: booksResult[0]?.total_books || 0,
        monthRevenue: parseFloat(monthRevenueResult[0]?.month_revenue || 0)
      }
    });
  } catch (err) {
    logger.error("Error fetching analytics summary:", err);
    return res.status(500).json({ message: "Failed to fetch analytics summary" });
  }
}

module.exports = {
  getSalesByCategory,
  getRevenueTrends,
  getUserGrowth,
  getOrderStatusDistribution,
  getTopCustomers,
  getTopSellingBooks,
  getAnalyticsSummary
};

