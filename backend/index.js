// index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const db = require("./db");
const logger = require("./src/utils/logger");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://book-app-frontend-tau.vercel.app",
    ],
    credentials: true,
  })
);

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// ====== ROUTES IMPORT ======
const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const authRoutes = require("./src/auth/auth.route");

// admin stats
const adminStatsRoutes = require("./src/stats/admin.stats");

// analytics
const analyticsRoutes = require("./src/stats/analytics.route");

// settings
const settingsRoutes = require("./src/settings/settings.route");

// 🆕 cart
const cartRoutes = require("./src/cart/cart.route");

// 🆕 wishlist
const wishlistRoutes = require("./src/wishlist/wishlist.route");

// 🆕 reviews
const reviewRoutes = require("./src/reviews/review.route");

// 🆕 addresses
const addressRoutes = require("./src/addresses/address.route");

// 🆕 users
const userRoutes = require("./src/users/user.route");

// 🆕 subscriptions
const subscriptionRoutes = require("./src/subscriptions/subscription.route");

// 🆕 vouchers
const voucherRoutes = require("./src/vouchers/voucher.route");

// ====== AUTH MIDDLEWARE IMPORT ======
const {
  verifyToken,
  verifyAdmin,
} = require("./src/middleware/auth.middleware");

// ====== API ROUTES ======
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// admin stats (chỉ admin)
app.use("/api/admin", verifyAdmin, adminStatsRoutes);

// analytics (chỉ admin)
app.use("/api/admin/analytics", analyticsRoutes);

// settings (chỉ admin)
app.use("/api/admin/settings", settingsRoutes);

// 🆕 cart (chỉ user đã login)
app.use("/api/cart", verifyToken, cartRoutes);

// 🆕 wishlist (chỉ user đã login)
app.use("/api/wishlist", verifyToken, wishlistRoutes);

// 🆕 reviews (một số route public, một số require auth - xử lý trong route file)
app.use("/api/reviews", reviewRoutes);

// 🆕 addresses (chỉ user đã login)
app.use("/api/addresses", addressRoutes);

// 🆕 users (chỉ user đã login)
app.use("/api/users", userRoutes);

// 🆕 payments (VNPay integration)
const paymentRoutes = require("./src/payments/payment.route");
app.use("/api/payments", paymentRoutes);

// 🆕 subscriptions (public routes)
app.use("/api/subscriptions", subscriptionRoutes);

// 🆕 vouchers (public routes)
app.use("/api/vouchers", voucherRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Book Store Server is running with MySQL!");
});

// Handle 404 - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server + test MySQL connection
app.listen(port, async () => {
  logger.info(`Server listening on port ${port}`);

  try {
    await db.query("SELECT 1");
    logger.info("✅ MySQL connected successfully!");
  } catch (err) {
    logger.error("❌ MySQL connection error:", err.message);
  }
});
