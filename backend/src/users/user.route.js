// src/users/user.route.js
const express = require("express");
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserByAdmin,
} = require("./user.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const { validateUpdateProfile, validateChangePassword } = require("../middleware/validation.middleware");

const router = express.Router();

// User routes (require authentication)
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, validateUpdateProfile, updateUserProfile);
router.patch("/change-password", verifyToken, validateChangePassword, changePassword);

// Admin routes (require admin role)
router.get("/", verifyAdmin, getAllUsers);
router.get("/:id", verifyAdmin, getUserById);
router.put("/:id", verifyAdmin, updateUserByAdmin);
router.patch("/:id/status", verifyAdmin, updateUserStatus);

module.exports = router;
