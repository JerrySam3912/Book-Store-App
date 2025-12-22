// src/settings/settings.controller.js
const db = require("../../db");
const logger = require("../utils/logger");

// In-memory settings (có thể lưu vào database nếu cần)
let settings = {
  siteName: "Book Store",
  siteDescription: "Your favorite online bookstore",
  currency: "USD",
  timezone: "UTC",
  emailNotifications: true,
  paymentMethods: ["COD", "CREDIT_CARD"],
};

/**
 * GET /api/admin/settings
 * Get all settings
 */
async function getSettings(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    logger.error("Error fetching settings:", err);
    return res.status(500).json({ message: "Failed to fetch settings" });
  }
}

/**
 * PUT /api/admin/settings
 * Update settings
 */
async function updateSettings(req, res) {
  try {
    const {
      siteName,
      siteDescription,
      currency,
      timezone,
      emailNotifications,
      paymentMethods,
    } = req.body;

    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (currency !== undefined) settings.currency = currency;
    if (timezone !== undefined) settings.timezone = timezone;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (paymentMethods !== undefined && Array.isArray(paymentMethods)) {
      settings.paymentMethods = paymentMethods;
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (err) {
    logger.error("Error updating settings:", err);
    return res.status(500).json({ message: "Failed to update settings" });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};

