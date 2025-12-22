// src/payments/payment.controller.js
const db = require("../../db");
const logger = require("../utils/logger");
const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay");
const { VNPAY } = require("../utils/constants");

/**
 * POST /api/payments/vnpay/create-url
 * Body: { orderId, amount }
 * Tạo VNPay payment URL cho order đã tạo
 */
async function createVnpayPaymentUrl(req, res) {
  try {
    const { orderId, amount } = req.body;
    const user = req.user;

    // Validate
    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    // Verify order exists and belongs to user (or is admin)
    const [orders] = await db.query(
      `SELECT id, user_id, total_price, payment_method, payment_status 
       FROM orders 
       WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Check permission (order owner or admin)
    if (order.user_id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ message: "You don't have permission to access this order" });
    }

    // Verify order is for VNPay
    if (order.payment_method !== "VNPAY") {
      return res.status(400).json({ message: "Order is not using VNPay payment method" });
    }

    // Verify order is still pending payment
    if (order.payment_status !== "PENDING") {
      return res.status(400).json({ 
        message: `Order payment status is ${order.payment_status}, cannot create payment URL` 
      });
    }

    // Get client IP
    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Use order.total_price as amount (in VND, assuming conversion from USD was done when creating order)
    // For now, assuming amount is already in VND. If in USD, need to convert
    const amountInVND = parseFloat(amount); // Assuming frontend sends in VND

    // Create payment URL
    // Return URL: VNPay redirects to backend route, backend will then redirect to frontend
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
    const returnUrl = `${backendUrl}/api/payments/vnpay-return`;
    const paymentUrl = createPaymentUrl({
      orderId: orderId.toString(),
      amount: amountInVND,
      orderInfo: `Thanh toan don hang #${orderId}`,
      ipAddr,
      returnUrl,
      locale: 'vn'
    });

    logger.info("VNPay payment URL created:", {
      orderId,
      userId: user.id,
      amount: amountInVND
    });

    res.json({
      paymentUrl,
      orderId
    });
  } catch (error) {
    logger.error("Error creating VNPay payment URL:", error);
    res.status(500).json({ message: "Failed to create payment URL" });
  }
}

/**
 * GET /api/payments/vnpay-return
 * VNPay redirect user về đây sau khi thanh toán
 */
async function vnpayReturn(req, res) {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    // Verify checksum
    const isValid = verifyReturnUrl(vnp_Params, secureHash);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!isValid) {
      logger.warn("VNPay return checksum invalid:", { orderId });
      return res.redirect(`${frontendUrl}/payment/failed?reason=checksum_failed`);
    }

    // Get order info
    const [orders] = await db.query(
      `SELECT id, payment_status, total_price FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.redirect(`${frontendUrl}/payment/failed?reason=order_not_found`);
    }

    // Response code 00 means success
    if (rspCode === '00') {
      // Payment successful
      // Note: IPN should handle the actual status update, but we can show success here
      return res.redirect(`${frontendUrl}/payment/success?orderId=${orderId}`);
    } else {
      // Payment failed
      return res.redirect(`${frontendUrl}/payment/failed?orderId=${orderId}&code=${rspCode}`);
    }
  } catch (error) {
    logger.error("Error in VNPay return handler:", error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment/failed?reason=server_error`);
  }
}

/**
 * GET /api/payments/vnpay-ipn
 * VNPay IPN (Instant Payment Notification) - server call server
 * This is the REAL handler that updates order status
 */
async function vnpayIPN(req, res) {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const vnp_Amount = vnp_Params['vnp_Amount'];
    const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
    const vnp_PayDate = vnp_Params['vnp_PayDate'];

    // Verify checksum
    const isValid = verifyReturnUrl(vnp_Params, secureHash);

    if (!isValid) {
      logger.warn("VNPay IPN checksum invalid:", { orderId });
      return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    // Get order info
    const [orders] = await db.query(
      `SELECT id, payment_status, total_price, user_id FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      logger.warn("VNPay IPN: Order not found:", { orderId });
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    const order = orders[0];

    // Check amount (VNPay sends amount in cents, so divide by 100)
    const amountFromVNPay = parseFloat(vnp_Amount) / 100;
    const orderAmount = parseFloat(order.total_price);

    // Allow small difference due to rounding
    if (Math.abs(amountFromVNPay - orderAmount) > 1) {
      logger.warn("VNPay IPN: Amount mismatch:", { 
        orderId, 
        vnpAmount: amountFromVNPay, 
        orderAmount 
      });
      return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
    }

    // Check if order payment status is still PENDING (avoid duplicate updates)
    if (order.payment_status !== 'PENDING') {
      logger.info("VNPay IPN: Order already processed:", { 
        orderId, 
        currentStatus: order.payment_status 
      });
      return res.status(200).json({ 
        RspCode: '02', 
        Message: 'This order has been updated to the payment status' 
      });
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      if (rspCode === '00') {
        // Payment successful
        await conn.query(
          `UPDATE orders 
           SET payment_status = 'PAID', 
               status = 'PAID',
               updated_at = NOW()
           WHERE id = ?`,
          [orderId]
        );

        // Update or create payment record
        await conn.query(
          `INSERT INTO payments (order_id, amount, method, status, transaction_ref, paid_at)
           VALUES (?, ?, 'VNPAY', 'SUCCESS', ?, NOW())
           ON DUPLICATE KEY UPDATE
           status = 'SUCCESS',
           transaction_ref = ?,
           paid_at = NOW()`,
          [orderId, orderAmount, vnp_TransactionNo, vnp_TransactionNo]
        );

        logger.info("VNPay IPN: Payment successful:", { 
          orderId, 
          transactionNo: vnp_TransactionNo 
        });

        await conn.commit();
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        // Payment failed
        await conn.query(
          `UPDATE orders 
           SET payment_status = 'FAILED',
               updated_at = NOW()
           WHERE id = ?`,
          [orderId]
        );

        await conn.query(
          `INSERT INTO payments (order_id, amount, method, status, transaction_ref)
           VALUES (?, ?, 'VNPAY', 'FAILED', ?)
           ON DUPLICATE KEY UPDATE
           status = 'FAILED',
           transaction_ref = ?`,
          [orderId, orderAmount, vnp_TransactionNo || null, vnp_TransactionNo || null]
        );

        logger.info("VNPay IPN: Payment failed:", { 
          orderId, 
          rspCode 
        });

        await conn.commit();
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
      }
    } catch (err) {
      await conn.rollback();
      logger.error("VNPay IPN: Database error:", err);
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    logger.error("Error in VNPay IPN handler:", error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
}

module.exports = {
  createVnpayPaymentUrl,
  vnpayReturn,
  vnpayIPN
};
