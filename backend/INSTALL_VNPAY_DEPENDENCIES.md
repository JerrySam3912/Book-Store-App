# VNPay Integration - Required Dependencies

## Installation

Before running the VNPay integration, you need to install the following npm packages:

```bash
cd backend
npm install moment qs
```

These packages are required for:
- **moment**: Date/time formatting for VNPay payment URLs
- **qs**: Query string parsing and stringifying for VNPay checksum generation

## Environment Variables (Optional)

You can optionally set these in your `.env` file:

```env
VNP_TMN_CODE=5EKYOSGT
VNP_HASH_SECRET=XJRGWJJQL1JZG5GSEYYZ800LZ76ZR236
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/payments/vnpay-return
VNP_IPN_URL=http://localhost:5000/api/payments/vnpay-ipn
FRONTEND_URL=http://localhost:5173
```

**Note**: Default values are already set in `backend/src/utils/constants.js` and `backend/src/utils/vnpay.js` using the test credentials provided by VNPay.

## Database Migration

Run the migration script to add VNPAY to payment_method enum:

```sql
source backend/migration-add-vnpay-payment-method.sql
```

Or manually run:

```sql
USE book_store;

ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('COD','BANK_TRANSFER','VNPAY') 
NOT NULL DEFAULT 'COD';

ALTER TABLE payments 
MODIFY COLUMN method ENUM('COD','BANK_TRANSFER','VNPAY') 
NOT NULL;
```
