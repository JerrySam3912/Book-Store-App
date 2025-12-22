# Book Store Database - Entity Relationship Diagram (Corrected)

## ERD Trừu Tượng với Attributes (Entities chính)

```mermaid
erDiagram
    users {
        int id PK
        string username UK
        string email UK
        string password_hash
        string name
        string phone
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    user_addresses {
        int id PK
        int user_id FK
        string full_name
        string phone
        string line1
        string city
        string state
        string country
        string zipcode
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }
    
    categories {
        int id PK
        string name
        string slug UK
        int parent_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    books {
        int id PK
        string title
        text description
        string category
        int category_id FK
        string author
        string publisher
        string isbn
        boolean trending
        string cover_image
        decimal old_price
        decimal new_price
        int stock
        timestamp created_at
        timestamp updated_at
    }
    
    book_images {
        int id PK
        int book_id FK
        string image_url
        int sort_order
        timestamp created_at
    }
    
    vouchers {
        int id PK
        string code UK
        string name
        text description
        enum type
        decimal value
        decimal min_order_amount
        decimal max_discount
        int usage_limit
        int used_count
        timestamp valid_from
        timestamp valid_to
        boolean is_active
        text applicable_categories
        int min_quantity
        timestamp created_at
        timestamp updated_at
    }
    
    orders {
        int id PK
        int user_id FK
        int address_id FK
        string name
        string email
        string phone
        string city
        string state
        string country
        string zipcode
        enum status
        enum payment_status
        enum payment_method
        string shipping_method
        decimal items_total
        decimal shipping_fee
        decimal discount_total
        decimal total_price
        timestamp created_at
        timestamp updated_at
    }
    
    payments {
        int id PK
        int order_id FK
        decimal amount
        enum method
        enum status
        string transaction_ref
        timestamp paid_at
        timestamp created_at
    }
    
    carts {
        int id PK
        int user_id FK
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    subscriptions {
        int id PK
        int user_id FK
        string email UK
        string name
        boolean is_active
        timestamp subscribed_at
        timestamp unsubscribed_at
    }
    
    users ||--o{ user_addresses : "has"
    users ||--o{ subscriptions : "subscribes"
    users ||--o{ carts : "owns"
    users ||--o{ orders : "places"
    users }o--o{ books : "reviews"
    users }o--o{ books : "wishlists"
    categories ||--o{ categories : "parent"
    categories ||--o{ books : "categorizes"
    books ||--o{ book_images : "has"
    carts }o--o{ books : "contains"
    orders }o--o{ books : "contains"
    orders ||--o{ payments : "has"
    orders }o--o{ vouchers : "uses"
    user_addresses ||--o{ orders : "used_in"
```

## ERD với đầy đủ Attributes (Bao gồm bảng trung gian)

```mermaid
erDiagram
    users {
        int id PK
        string username UK
        string email UK
        string password_hash
        string name
        string phone
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    user_addresses {
        int id PK
        int user_id FK
        string full_name
        string phone
        string line1
        string city
        string state
        string country
        string zipcode
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }
    
    categories {
        int id PK
        string name
        string slug UK
        int parent_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    books {
        int id PK
        string title
        text description
        string category
        int category_id FK
        string author
        string publisher
        string isbn
        boolean trending
        string cover_image
        decimal old_price
        decimal new_price
        int stock
        timestamp created_at
        timestamp updated_at
    }
    
    book_images {
        int id PK
        int book_id FK
        string image_url
        int sort_order
        timestamp created_at
    }
    
    vouchers {
        int id PK
        string code UK
        string name
        text description
        enum type
        decimal value
        decimal min_order_amount
        decimal max_discount
        int usage_limit
        int used_count
        timestamp valid_from
        timestamp valid_to
        boolean is_active
        text applicable_categories
        int min_quantity
        timestamp created_at
        timestamp updated_at
    }
    
    orders {
        int id PK
        int user_id FK
        int address_id FK
        string name
        string email
        string phone
        string city
        string state
        string country
        string zipcode
        enum status
        enum payment_status
        enum payment_method
        string shipping_method
        decimal items_total
        decimal shipping_fee
        decimal discount_total
        decimal total_price
        timestamp created_at
        timestamp updated_at
    }
    
    order_items {
        int id PK
        int order_id FK
        int book_id FK
        int quantity
        decimal price
        decimal total_price
        timestamp created_at
    }
    
    order_vouchers {
        int id PK
        int order_id FK
        int voucher_id FK
        decimal discount_amount
        timestamp created_at
    }
    
    payments {
        int id PK
        int order_id FK
        decimal amount
        enum method
        enum status
        string transaction_ref
        timestamp paid_at
        timestamp created_at
    }
    
    reviews {
        int id PK
        int user_id FK
        int book_id FK
        int rating
        text comment
        timestamp created_at
    }
    
    wishlists {
        int id PK
        int user_id FK
        int book_id FK
        timestamp created_at
    }
    
    carts {
        int id PK
        int user_id FK
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    cart_items {
        int id PK
        int cart_id FK
        int book_id FK
        int quantity
        decimal unit_price
        timestamp created_at
        timestamp updated_at
    }
    
    subscriptions {
        int id PK
        int user_id FK
        string email UK
        string name
        boolean is_active
        timestamp subscribed_at
        timestamp unsubscribed_at
    }
    
    users ||--o{ user_addresses : "has"
    users ||--o{ subscriptions : "subscribes"
    users ||--o{ carts : "owns"
    users ||--o{ orders : "places"
    users }o--o{ books : "reviews"
    users }o--o{ books : "wishlists"
    categories ||--o{ categories : "parent"
    categories ||--o{ books : "categorizes"
    books ||--o{ book_images : "has"
    carts }o--o{ books : "contains"
    orders }o--o{ books : "contains"
    orders ||--o{ payments : "has"
    orders }o--o{ vouchers : "uses"
    user_addresses ||--o{ orders : "used_in"
    orders ||--o{ order_items : "has"
    carts ||--o{ cart_items : "has"
    vouchers ||--o{ order_vouchers : "used_in"
```

## Các thay đổi so với phiên bản ban đầu:

1. ✅ **orders ||--o{ payments** (đã sửa từ `||--||` thành `||--o{`)
   - Trong db.sql: `payments.order_id INT NOT NULL` → 1 order có thể có nhiều payments
   - Quan hệ đúng: **1-N** (một order có nhiều payment records)

## Phân tích các quan hệ:

### Quan hệ 1-N (One-to-Many):
- ✅ users → user_addresses (1 user có nhiều địa chỉ)
- ✅ users → subscriptions (1 user có nhiều subscription)
- ✅ users → carts (1 user có nhiều carts)
- ✅ users → orders (1 user có nhiều orders)
- ✅ categories → categories (self-reference, 1 category có nhiều sub-categories)
- ✅ categories → books (1 category có nhiều books)
- ✅ books → book_images (1 book có nhiều images)
- ✅ orders → payments (1 order có nhiều payments) ⚠️ **ĐÃ SỬA**
- ✅ orders → order_items (1 order có nhiều items)
- ✅ carts → cart_items (1 cart có nhiều items)
- ✅ vouchers → order_vouchers (1 voucher có thể dùng trong nhiều orders)
- ✅ user_addresses → orders (1 address có thể dùng trong nhiều orders)

### Quan hệ N-N (Many-to-Many) - qua bảng trung gian:
- ✅ users ↔ books (qua reviews)
- ✅ users ↔ books (qua wishlists)
- ✅ carts ↔ books (qua cart_items)
- ✅ orders ↔ books (qua order_items)
- ✅ orders ↔ vouchers (qua order_vouchers)

## Tóm tắt:

ERD của bạn **gần như đúng**, chỉ cần sửa 1 chỗ:
- ❌ `orders ||--|| payments` → ✅ `orders ||--o{ payments`

Tất cả các quan hệ khác đều hợp lý với db.sql!

