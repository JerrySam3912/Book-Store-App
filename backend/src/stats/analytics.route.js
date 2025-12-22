// src/stats/analytics.route.js
const express = require("express");
const { verifyAdmin } = require("../middleware/auth.middleware");
const {
  getSalesByCategory,
  getRevenueTrends,
  getUserGrowth,
  getOrderStatusDistribution,
  getTopCustomers,
  getTopSellingBooks,
  getAnalyticsSummary
} = require("./analytics.controller");

const router = express.Router();

// All routes require admin authentication
router.use(verifyAdmin);

// GET /api/admin/analytics/summary
router.get("/summary", getAnalyticsSummary);

// GET /api/admin/analytics/sales-by-category
router.get("/sales-by-category", getSalesByCategory);

// GET /api/admin/analytics/revenue-trends
router.get("/revenue-trends", getRevenueTrends);

// GET /api/admin/analytics/user-growth
router.get("/user-growth", getUserGrowth);

// GET /api/admin/analytics/order-status-distribution
router.get("/order-status-distribution", getOrderStatusDistribution);

// GET /api/admin/analytics/top-customers
router.get("/top-customers", getTopCustomers);

// GET /api/admin/analytics/top-selling-books
router.get("/top-selling-books", getTopSellingBooks);

module.exports = router;

