// src/settings/settings.route.js
const express = require("express");
const { verifyAdmin } = require("../middleware/auth.middleware");
const { getSettings, updateSettings } = require("./settings.controller");

const router = express.Router();

// All routes require admin authentication
router.use(verifyAdmin);

// GET /api/admin/settings
router.get("/", getSettings);

// PUT /api/admin/settings
router.put("/", updateSettings);

module.exports = router;

