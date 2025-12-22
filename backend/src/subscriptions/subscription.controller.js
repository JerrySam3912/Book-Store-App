// src/subscriptions/subscription.controller.js
const db = require("../../db");
const logger = require("../utils/logger");

/**
 * POST /api/subscriptions
 * Subscribe to newsletter (public - không cần login)
 */
async function subscribe(req, res) {
  try {
    const { email, name } = req.body;
    const userId = req.user?.id || null; // Optional: nếu user đã login

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already subscribed
    const [existing] = await db.query(
      "SELECT id, is_active FROM subscriptions WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      if (existing[0].is_active === 1) {
        return res.status(200).json({
          message: "You are already subscribed to our newsletter!",
          subscribed: true,
        });
      } else {
        // Reactivate subscription
        await db.query(
          "UPDATE subscriptions SET is_active = 1, user_id = ?, name = ?, unsubscribed_at = NULL, subscribed_at = CURRENT_TIMESTAMP WHERE email = ?",
          [userId, name || null, email]
        );
        return res.status(200).json({
          message: "Welcome back! You have been resubscribed to our newsletter.",
          subscribed: true,
        });
      }
    }

    // Create new subscription
    await db.query(
      "INSERT INTO subscriptions (user_id, email, name, is_active) VALUES (?, ?, ?, 1)",
      [userId, email, name || null]
    );

    return res.status(201).json({
      message: "Thank you for subscribing! You will receive updates about new books and special offers.",
      subscribed: true,
    });
  } catch (err) {
    logger.error("Subscribe error:", err);
    return res.status(500).json({ message: "Failed to subscribe" });
  }
}

/**
 * POST /api/subscriptions/unsubscribe
 * Unsubscribe from newsletter
 */
async function unsubscribe(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [result] = await db.query(
      "UPDATE subscriptions SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Email not found in our subscription list" });
    }

    return res.status(200).json({
      message: "You have been unsubscribed from our newsletter.",
      subscribed: false,
    });
  } catch (err) {
    logger.error("Unsubscribe error:", err);
    return res.status(500).json({ message: "Failed to unsubscribe" });
  }
}

/**
 * GET /api/subscriptions/check
 * Check subscription status (optional - for logged in users)
 */
async function checkSubscription(req, res) {
  try {
    const email = req.user?.email || req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [rows] = await db.query(
      "SELECT is_active, subscribed_at FROM subscriptions WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(200).json({ subscribed: false });
    }

    return res.status(200).json({
      subscribed: rows[0].is_active === 1,
      subscribedAt: rows[0].subscribed_at,
    });
  } catch (err) {
    logger.error("Check subscription error:", err);
    return res.status(500).json({ message: "Failed to check subscription" });
  }
}

/**
 * GET /api/subscriptions (ADMIN ONLY)
 * Get all subscribers
 */
async function getAllSubscribers(req, res) {
  try {
    const [subscribers] = await db.query(
      `SELECT 
        s.id,
        s.email,
        s.name,
        u.username,
        s.is_active,
        s.subscribed_at,
        s.unsubscribed_at
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.subscribed_at DESC`
    );

    return res.status(200).json({
      subscribers: subscribers.map(sub => ({
        id: sub.id,
        email: sub.email,
        name: sub.name || sub.username || 'Guest',
        isActive: sub.is_active === 1,
        subscribedAt: sub.subscribed_at,
        unsubscribedAt: sub.unsubscribed_at,
      })),
      total: subscribers.length,
    });
  } catch (err) {
    logger.error("Get subscribers error:", err);
    return res.status(500).json({ message: "Failed to fetch subscribers" });
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  checkSubscription,
  getAllSubscribers,
};

