// Application constants
module.exports = {
  // Authentication
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d', // 7 days instead of 1h
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',
  SALT_ROUNDS: 10,
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_PAGE_LIMIT: 50,
  
  // Shipping (USD - converted from VND: 30000 VND ≈ $30 USD, but for demo using $5)
  DEFAULT_SHIPPING_FEE: 5.00, // $5 USD
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // General API
  RATE_LIMIT_AUTH_MAX: 5, // Auth endpoints (stricter)
  
  // Password Reset
  PASSWORD_RESET_EXPIRY: '15m',
  MIN_PASSWORD_LENGTH: 6,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // VNPay Configuration (can be overridden by environment variables)
  VNPAY: {
    TMN_CODE: process.env.VNP_TMN_CODE || '5EKYOSGT',
    HASH_SECRET: process.env.VNP_HASH_SECRET || 'XJRGWJJQL1JZG5GSEYYZ800LZ76ZR236',
    URL: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    RETURN_URL: process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/vnpay-return',
    IPN_URL: process.env.VNP_IPN_URL || 'http://localhost:5000/api/payments/vnpay-ipn',
  },

  // Response Messages
  MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later'
  }
};
