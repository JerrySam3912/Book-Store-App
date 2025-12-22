-- Migration: Add VNPAY to payment_method ENUM
-- Run this if your database already exists

USE book_store;

-- Add VNPAY to orders.payment_method ENUM
ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('COD','BANK_TRANSFER','VNPAY') 
NOT NULL DEFAULT 'COD';

-- Add VNPAY to payments.method ENUM
ALTER TABLE payments 
MODIFY COLUMN method ENUM('COD','BANK_TRANSFER','VNPAY') 
NOT NULL;
