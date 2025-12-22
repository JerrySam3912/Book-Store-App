-- =========================================
-- 1. DROP & CREATE DATABASE
-- =========================================
DROP DATABASE IF EXISTS book_store;
CREATE DATABASE book_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE book_store;

-- =========================================
-- 2. USERS
--    - Giữ nguyên cấu trúc cũ, thêm phone + is_active
-- =========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  phone         VARCHAR(20),
  role ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (OPTIONAL) Seed admin user
-- Tự generate bcrypt hash rồi thay vào <BCRYPT_HASH>
-- INSERT INTO users (username, email, password_hash, name, role)
-- VALUES ('admin', 'admin@example.com', '<BCRYPT_HASH>', 'Admin', 'ADMIN');

-- =========================================
-- 3. USER ADDRESSES
--    - Một user có thể có nhiều địa chỉ
--    - Order có thể link tới address_id nhưng vẫn lưu snapshot name/email/phone
-- =========================================
CREATE TABLE user_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone     VARCHAR(20)  NOT NULL,
  line1     VARCHAR(255) NOT NULL,   -- Đường, số nhà
  city      VARCHAR(100) NOT NULL,
  state     VARCHAR(100),
  country   VARCHAR(100) NOT NULL,
  zipcode   VARCHAR(20),
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 4. CATEGORIES
--    - Cho phép phân loại sách
--    - books vẫn giữ cột category (string) để không phá backend hiện tại
-- =========================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed một vài category mẫu
INSERT INTO categories (name, slug) VALUES
  ('Business',   'business'),
  ('Technology', 'technology'),
  ('Fiction',    'fiction'),
  ('Horror',     'horror'),
  ('Adventure',  'adventure');

-- =========================================
-- 5. BOOKS
--    - Giữ nguyên các cột backend đang dùng:
--      title, description, category, trending, cover_image, old_price, new_price
--    - Thêm: category_id, author, publisher, isbn, stock
-- =========================================
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(100) NOT NULL,  -- string cũ: 'business', 'fiction',...
  category_id INT NULL,               -- FK sang bảng categories (optional)
  author      VARCHAR(255),
  publisher   VARCHAR(255),
  isbn        VARCHAR(50),
  trending    TINYINT(1) NOT NULL DEFAULT 0,
  cover_image VARCHAR(255),
  old_price   DECIMAL(10,2) DEFAULT 0.00,
  new_price   DECIMAL(10,2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0, -- tồn kho cơ bản
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 6. BOOK IMAGES (optional nhiều ảnh / sách)
-- =========================================
CREATE TABLE book_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NOT NULL,
  image_url  VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_images_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 6.5. VOUCHERS / COUPONS (Tạo trước orders vì orders có FK reference)
--    - Mã giảm giá, freeship, discount
-- =========================================
CREATE TABLE vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('PERCENTAGE','FIXED_AMOUNT','FREE_SHIP') NOT NULL,
  value DECIMAL(10,2) NOT NULL, -- % hoặc số tiền giảm
  min_order_amount DECIMAL(10,2) DEFAULT 0.00, -- Đơn hàng tối thiểu
  max_discount DECIMAL(10,2) NULL, -- Giảm tối đa (cho PERCENTAGE)
  usage_limit INT DEFAULT NULL, -- NULL = không giới hạn
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  applicable_categories TEXT NULL, -- JSON array: ['business', 'fiction'] hoặc NULL = tất cả
  min_quantity INT DEFAULT NULL, -- Số lượng sách tối thiểu (ví dụ: mua 3 sách)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 7. ORDERS
--    - Giữ các cột backend đang dùng:
--      user_id, name, email, phone, city, state, country, zipcode, total_price
--    - Thêm:
--      address_id, status, payment_status, payment_method,
--      shipping_method, items_total, shipping_fee, discount_total
-- =========================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  address_id INT NULL, -- link tới user_addresses nếu có
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100),
  country    VARCHAR(100) NOT NULL,
  zipcode    VARCHAR(20),
  status ENUM('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED')
        NOT NULL DEFAULT 'PENDING',
  payment_status ENUM('PENDING','PAID','FAILED','REFUNDED')
        NOT NULL DEFAULT 'PENDING',
  payment_method ENUM('COD','BANK_TRANSFER','VNPAY')
        NOT NULL DEFAULT 'COD',
  shipping_method VARCHAR(100),
  items_total   DECIMAL(10,2) DEFAULT 0.00,  -- tổng tiền trước ship/discount
  shipping_fee  DECIMAL(10,2) DEFAULT 0.00,
  discount_total DECIMAL(10,2) DEFAULT 0.00,
  total_price   DECIMAL(10,2) NOT NULL,      -- backend hiện tại đang dùng
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_orders_address
    FOREIGN KEY (address_id) REFERENCES user_addresses(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 7.5. ORDER_VOUCHERS (Tạo sau orders vì cần orders và vouchers)
--    - Track voucher nào được dùng trong order nào
-- =========================================
CREATE TABLE order_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  voucher_id INT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL, -- Số tiền giảm thực tế
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_vouchers_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_vouchers_voucher
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 8. ORDER ITEMS
--    - Giữ cột price, total_price như cũ
--    - Thêm quantity
-- =========================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  book_id  INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price    DECIMAL(10,2) NOT NULL,      -- đơn giá (backend đang dùng)
  total_price DECIMAL(10,2) NOT NULL,   -- price * quantity
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 9. PAYMENTS
--    - Lưu thông tin thanh toán (sau này muốn xài VNPAY, MoMo, v.v.)
-- =========================================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount   DECIMAL(10,2) NOT NULL,
  method ENUM('COD','BANK_TRANSFER','VNPAY') NOT NULL,
  status ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  transaction_ref VARCHAR(100),
  paid_at   TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 10. REVIEWS (Đánh giá sách)
-- =========================================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating  INT NOT NULL,  -- 1-5 (CHECK chỉ có tác dụng thật ở MySQL 8+)
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Optional) MySQL 8+ mới enforce CHECK, 5.7 trở xuống chỉ bỏ qua:
-- ALTER TABLE reviews
--   ADD CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5);

-- =========================================
-- 11. WISHLISTS (Sách yêu thích)
-- =========================================
CREATE TABLE wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlists_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE CASCADE,
  UNIQUE KEY uk_wishlist_user_book (user_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- 12. (OPTIONAL) SEED DATA DEMO
--    - Bạn có thể tự thêm INSERT books / orders tuỳ ý cho demo
-- =========================================

-- Ví dụ seed 1-2 cuốn sách:

INSERT INTO books (title, description, category, new_price, old_price, stock, trending, cover_image)
VALUES
  ('Atomic Habits', 'Simple steps to build better habits', 'business', 15.99, 20.00, 50, 1, 'atomic-habits.png'),
  ('The Hobbit', 'A fantasy novel by J.R.R. Tolkien', 'adventure', 12.50, 15.00, 30, 1, 'the-hobbit.png');

-- =========================================
-- CARTS (giỏ hàng) & CART_ITEMS
-- =========================================

-- Cart: 1 user có thể có nhiều cart theo thời gian,
-- nhưng luôn chỉ có 1 cart ACTIVE là giỏ hàng hiện tại.
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  status ENUM('ACTIVE','ORDERED','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cart items: mỗi dòng là 1 sách trong giỏ
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL, -- giá tại thời điểm thêm vào giỏ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE RESTRICT,
  CONSTRAINT uk_cart_items_unique_book_per_cart
    UNIQUE KEY (cart_id, book_id) -- 1 sách chỉ xuất hiện 1 lần trong 1 cart
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add subscriptions table to book_store database
USE book_store;

-- =========================================
-- SUBSCRIPTIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  CONSTRAINT fk_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




INSERT INTO books 
(title, description, category, category_id, author, publisher, isbn, trending, cover_image, old_price, new_price, stock)
VALUES
('How to Grow Your Online Store',
 'Learn the best strategies to grow your online store in today''s competitive market.',
 'business', NULL, NULL, NULL, NULL,
 1, 'book-1.png', 29.99, 19.99, 50),

('Top 10 Fiction Books This Year',
 'A curated list of the best fiction books that are trending this year.',
 'books', NULL, NULL, NULL, NULL,
 1, 'book-2.png', 24.99, 14.99, 50),

('Mastering SEO in 2024',
 'Tips and tricks to boost your SEO and rank higher on search engines.',
 'marketing', NULL, NULL, NULL, NULL,
 1, 'book-3.png', 39.99, 29.99, 50),

('Best eCommerce Platforms',
 'A comprehensive guide on choosing the best eCommerce platforms for 2024.',
 'business', NULL, NULL, NULL, NULL,
 0, 'book-4.png', 49.99, 39.99, 50),

('Non-Fiction Reads You Must Try',
 'Our top picks for non-fiction books to add to your reading list.',
 'books', NULL, NULL, NULL, NULL,
 1, 'book-5.png', 19.99, 9.99, 50),

('Ultimate Guide to Digital Marketing',
 'A complete guide to digital marketing strategies for 2024.',
 'marketing', NULL, NULL, NULL, NULL,
 0, 'book-6.png', 44.99, 34.99, 50),

('The First Days',
 'Katie is driving to work one beautiful day when a dead man jumps into her car and tries to eat her...',
 'horror', NULL, NULL, NULL, NULL,
 1, 'book-7.png', 59.99, 49.99, 50),

('The Hunger Games',
 'Could you survive on your own in the wild, with everyone out to make sure you don''t live to see the morning?',
 'fiction', NULL, NULL, NULL, NULL,
 1, 'book-8.png', 21.99, 16.99, 50),

('Harry Potter and the Order of the Phoenix',
 'Harry Potter is about to start his fifth year at Hogwarts School of Witchcraft and Wizardry...',
 'adventure', NULL, NULL, NULL, NULL,
 0, 'book-9.png', 27.99, 18.99, 50),

('Pride and Prejudice',
 'The romantic clash between the opinionated Elizabeth and the proud Mr. Darcy...',
 'fiction', NULL, NULL, NULL, NULL,
 1, 'book-10.png', 14.99, 10.99, 50),

('To Kill a Mockingbird',
 'The unforgettable novel of a childhood in a sleepy Southern town...',
 'fiction', NULL, NULL, NULL, NULL,
 1, 'book-11.png', 32.99, 25.99, 50),

('The Fault in Our Stars',
 'Despite the tumor-shrinking medical miracle...',
 'business', NULL, NULL, NULL, NULL,
 1, 'book-12.png', 19.99, 9.99, 50),

('The Picture of Dorian Gray',
 'Oscar Wilde's only novel is the dreamlike story of a young man who sells his soul for eternal youth...',
 'horror', NULL, NULL, NULL, NULL,
 1, 'book-13.png', 26.99, 21.99, 50),

('The Giving Tree',
 'Once there was a tree... and she loved a little boy.',
 'fiction', NULL, NULL, NULL, NULL,
 0, 'book-14.png', 34.99, 24.99, 50),

('Gone with the Wind',
 'Scarlett O''Hara must use every means at her disposal to claw her way out of poverty...',
 'fiction', NULL, NULL, NULL, NULL,
 0, 'book-15.png', 22.99, 12.99, 50),

('The Lightning Thief',
 'Percy Jackson is a good kid, but he can''t seem to focus or control his temper...',
 'fiction', NULL, NULL, NULL, NULL,
 0, 'book-16.png', 24.99, 19.99, 50),

('Alice's Adventures in Wonderland',
 'When Alice sees a white rabbit take a watch out of its waistcoat pocket...',
 'adventure', NULL, NULL, NULL, NULL,
 1, 'book-17.png', 49.99, 39.99, 50),

('Divergent',
 'All sixteen-year-olds must select the faction to which they will devote their lives...',
 'business', NULL, NULL, NULL, NULL,
 1, 'book-18.png', 18.99, 12.99, 50),

('The Alchemist',
 'The mystical story of Santiago, an Andalusian shepherd boy...',
 'adventure', NULL, NULL, NULL, NULL,
 1, 'book-19.png', 35.99, 27.99, 50),

('Four Thousand Weeks',
 'Nobody needs to be told there isn't enough time...',
 'business', NULL, NULL, NULL, NULL,
 0, 'book-20.png', 24.99, 14.99, 50);






-- =========================================
-- VOUCHERS SEED DATA (ENGLISH & USD VERSION)
-- Currency: USD ($)
-- =========================================

-- 1. Fixed Amount Discounts
-- Replaced 10K/20K/30K VND with $1, $2, $3, $5 (Approximate scaling for small coupons)
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active) VALUES
('SAVE1', '$1 Off - Sitewide', 'Save $1.00 on orders over $15.00', 'FIXED_AMOUNT', 1.00, 15.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE2', '$2 Off - Sitewide', 'Save $2.00 on orders over $25.00', 'FIXED_AMOUNT', 2.00, 25.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE3', '$3 Off - Sitewide', 'Save $3.00 on orders over $40.00', 'FIXED_AMOUNT', 3.00, 40.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE5', '$5 Off - Sitewide', 'Save $5.00 on orders over $60.00', 'FIXED_AMOUNT', 5.00, 60.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1);

-- 2. Percentage Discounts
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active) VALUES
('SAVE10PERCENT', '10% Off - Sitewide', 'Discount 10% (max $5.00) for orders from $20.00', 'PERCENTAGE', 10.00, 20.00, 5.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE15PERCENT', '15% Off - Sitewide', 'Discount 15% (max $10.00) for orders from $30.00', 'PERCENTAGE', 15.00, 30.00, 10.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE20PERCENT', '20% Off - Sitewide', 'Discount 20% (max $15.00) for orders from $50.00', 'PERCENTAGE', 20.00, 50.00, 15.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('SAVE30PERCENT', '30% Off - Buy 3 Items', 'Discount 30% (max $20.00) when buying 3 or more books', 'PERCENTAGE', 30.00, 0.00, 20.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1);

-- 3. Free Shipping Vouchers
-- Shipping costs in US are usually $5-$10, thresholds usually $25-$50
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active) VALUES
('FREESHIP_KIDS', 'Free Ship - Children Books', 'Free shipping (max $5.00) for Children book orders from $25.00', 'FREE_SHIP', 5.00, 25.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('FREESHIP_STD', 'Free Ship - Sitewide', 'Free shipping (max $5.00) for orders from $30.00', 'FREE_SHIP', 5.00, 30.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('FREESHIP_MAX', 'Free Ship - Sitewide', 'Free shipping (max $10.00) for orders from $50.00', 'FREE_SHIP', 10.00, 50.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1);

-- 4. Category Specific Vouchers
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active, applicable_categories) VALUES
('BUSINESS20', '20% Off - Business Books', 'Discount 20% (max $8.00) for Business books from $20.00', 'PERCENTAGE', 20.00, 20.00, 8.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '["business"]'),
('FICTION15', '15% Off - Fiction Books', 'Discount 15% (max $6.00) for Fiction books from $15.00', 'PERCENTAGE', 15.00, 15.00, 6.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '["fiction"]'),
('TECHNOLOGY25', '25% Off - Technology Books', 'Discount 25% (max $10.00) for Technology books from $30.00', 'PERCENTAGE', 25.00, 30.00, 10.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '["technology"]');

-- 5. Quantity Based Vouchers (Buy X Get Y%)
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active, min_quantity) VALUES
('BUY3GET30', 'Buy 3 Books Get 30% Off', 'Discount 30% (max $15.00) when buying 3 or more books', 'PERCENTAGE', 30.00, 0.00, 15.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, 3),
('BUY5GET40', 'Buy 5 Books Get 40% Off', 'Discount 40% (max $25.00) when buying 5 or more books', 'PERCENTAGE', 40.00, 0.00, 25.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, 5);

-- 6. Special Event Vouchers
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount, usage_limit, valid_from, valid_to, is_active) VALUES
('WELCOME1', 'Welcome Offer - $1 Off', 'Welcome voucher for new customers, $1.00 off first order from $10.00', 'FIXED_AMOUNT', 1.00, 10.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1),
('BIRTHDAY20', 'Birthday Special - 20% Off', 'Special Birthday Gift: 20% off (max $10.00) for your order', 'PERCENTAGE', 20.00, 20.00, 10.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1);


INSERT INTO users (email, username, password_hash, name, role)
VALUES (
  'admin@example.com',
  'admin',
  '$2b$10$PHrBQXW9Hsx7wcv3a9VePuHHodnX2d6DT7vZ89FAnaLgSv0joi2L6', -- đây là hash của '123456'
  'Jerry Sam',
  'ADMIN'
);

-- Update admin name to "Jerry Sam" (in case admin already exists)
UPDATE users
SET name = 'Jerry Sam'
WHERE email = 'admin@example.com' AND role = 'ADMIN';
