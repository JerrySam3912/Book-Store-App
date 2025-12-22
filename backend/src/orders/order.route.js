// src/orders/order.route.js
const express = require("express");
const { 
  createOrder, 
  getOrdersByEmail, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus 
} = require("./order.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const { validateOrder } = require("../middleware/validation.middleware");

const router = express.Router();

// Tạo order: user đã login (có JWT)
router.post("/", verifyToken, validateOrder, createOrder);

// Lấy orders theo email: cũng yêu cầu login
router.get("/email/:email", verifyToken, getOrdersByEmail);

// Admin routes
router.get("/", verifyAdmin, getAllOrders);
router.get("/:id", verifyAdmin, getOrderById);
router.patch("/:id/status", verifyAdmin, updateOrderStatus);

module.exports = router;
