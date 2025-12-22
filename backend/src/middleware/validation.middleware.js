// src/middleware/validation.middleware.js
const { body, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth Validation
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Book Validation
const validateCreateBook = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Author must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  handleValidationErrors
];

const validateUpdateBook = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Author must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  handleValidationErrors
];

// Address Validation
const validateAddress = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Phone number must contain only digits, +, -, spaces, or parentheses')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('line1')
    .trim()
    .notEmpty()
    .withMessage('Address line is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Address line must be between 5 and 255 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('zipcode')
    .optional()
    .trim()
    .matches(/^[0-9A-Z\s-]+$/)
    .withMessage('Zipcode must contain only alphanumeric characters, spaces, or hyphens')
    .isLength({ max: 20 })
    .withMessage('Zipcode must not exceed 20 characters'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  handleValidationErrors
];

// Review Validation
const validateReview = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a valid integer'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  handleValidationErrors
];

// Order Validation
const validateOrder = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Phone number must contain only digits, +, -, spaces, or parentheses'),
  body('address')
    .isObject()
    .withMessage('Address must be an object'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  // Support both formats: array of IDs or array of objects {bookId, quantity}
  body('productIds.*')
    .custom((value) => {
      // Nếu là object {bookId, quantity}
      if (typeof value === 'object' && value !== null) {
        if (!value.bookId || typeof value.bookId !== 'number') {
          throw new Error('Each product must have a valid bookId (number)');
        }
        if (value.quantity !== undefined && (typeof value.quantity !== 'number' || value.quantity < 1)) {
          throw new Error('Quantity must be a positive number');
        }
        return true;
      }
      // Nếu là number (backward compatible)
      if (typeof value === 'number' && value >= 1) {
        return true;
      }
      throw new Error('Each product must be either a number (bookId) or an object {bookId, quantity}');
    }),
  body('totalPrice')
    .optional() // Không bắt buộc nữa vì backend sẽ tự tính
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(['COD', 'BANK_TRANSFER', 'VNPAY'])
    .withMessage('Payment method must be COD, BANK_TRANSFER, or VNPAY'),
  body('voucherCode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Voucher code must not exceed 50 characters'),
  body('shippingFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping fee must be a positive number'),
  body('addressId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'number' && value >= 1) return true;
      throw new Error('Address ID must be null or a valid integer >= 1');
    }),
  handleValidationErrors
];

// User Profile Validation
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Phone number must contain only digits, +, -, spaces, or parentheses')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  handleValidationErrors
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateBook,
  validateUpdateBook,
  validateAddress,
  validateReview,
  validateOrder,
  validateUpdateProfile,
  validateChangePassword,
  handleValidationErrors
};

