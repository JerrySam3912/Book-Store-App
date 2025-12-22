# Book Store - UML Class Diagram

## Class Diagram (Mermaid Format)

```mermaid
classDiagram
    class User {
        -int id
        -string username
        -string email
        -string password_hash
        +string name
        +string phone
        +string role
        +boolean is_active
        +List~Order~ orders
        +List~Review~ reviews
        +List~Wishlist~ wishlists
        +List~UserAddress~ addresses
        +List~Cart~ carts
        +login() void
        +logout() void
        +register() void
        +changePassword() void
        +getUserById() User
        +getAllUsers() List~User~
    }

    class Book {
        -int id
        +string title
        +string description
        +string category
        +int category_id
        +string author
        +string publisher
        +string isbn
        +boolean trending
        +string cover_image
        +decimal old_price
        +decimal new_price
        +int stock
        +List~Review~ reviews
        +List~Wishlist~ wishlists
        +List~OrderItem~ orderItems
        +List~CartItem~ cartItems
        +List~BookImage~ images
        +getBookById() Book
        +getBooksByCategory(category) List~Book~
        +getBooksByPrice(minPrice, maxPrice) List~Book~
        +getTrendingBooks() List~Book~
        +createBook() Book
        +updateBook() Book
        +deleteBook() void
    }

    class Review {
        -int id
        -int user_id
        -int book_id
        +int rating
        +string comment
        +Date created_at
        +getReviewById() Review
        +getReviewContent() string
        +addReview(bookId, rating, comment) void
        +getReviewsByBook(bookId) List~Review~
        +getReviewsByUser(userId) List~Review~
    }

    class Cart {
        -int id
        -int user_id
        +string status
        +boolean empty
        +int itemQuantity
        +List~CartItem~ items
        +checkout() Order
        +addItem(bookId, quantity) void
        +removeItem(bookId) void
        +updateItemQuantity(bookId, quantity) void
        +clearCart() void
        +getCartTotal() decimal
        +getCartById() Cart
    }

    class CartItem {
        -int id
        -int cart_id
        -int book_id
        +int quantity
        +decimal unit_price
        +getTotalPrice() decimal
    }

    class Order {
        -int id
        -int user_id
        -int address_id
        +string name
        +string email
        +string phone
        +string city
        +string state
        +string country
        +string zipcode
        +string status
        +string payment_status
        +string payment_method
        +string shipping_method
        +decimal items_total
        +decimal shipping_fee
        +decimal discount_total
        +decimal total_price
        +Date orderDate
        +List~OrderItem~ orderItems
        +List~Payment~ payments
        +List~Voucher~ vouchers
        +getOrderById() Order
        +getOrderStatus() string
        +totalPrice() decimal
        +createOrder() Order
        +updateOrderStatus(status) void
        +cancelOrder() void
    }

    class OrderItem {
        -int id
        -int order_id
        -int book_id
        +int quantity
        +decimal price
        +decimal total_price
        +getTotalPrice() decimal
    }

    class Payment {
        -int id
        -int order_id
        +decimal amount
        +string method
        +string status
        +string transaction_ref
        +Date paymentDate
        +getPaymentById() Payment
        +getPaymentDate() Date
        +addStatus() string
        +addPayment(orderId, amount) void
        +createVnpayPaymentUrl() string
        +processPayment() void
    }

    class Voucher {
        -int id
        +string code
        +string name
        +string description
        +string type
        +decimal value
        +decimal min_order_amount
        +decimal max_discount
        +int usage_limit
        +int used_count
        +Date valid_from
        +Date valid_to
        +boolean is_active
        +getVoucherByCode(code) Voucher
        +validateVoucher(orderTotal, itemCount) boolean
        +applyVoucher(orderId) decimal
        +getDiscountAmount(orderTotal) decimal
    }

    class Category {
        -int id
        +string name
        +string slug
        -int parent_id
        +List~Book~ books
        +getCategoryById() Category
        +getCategoryBySlug(slug) Category
        +getAllCategories() List~Category~
        +getSubCategories(parentId) List~Category~
    }

    class Wishlist {
        -int id
        -int user_id
        -int book_id
        +Date created_at
        +addToWishlist(bookId) void
        +removeFromWishlist(bookId) void
        +getWishlistByUser(userId) List~Wishlist~
    }

    class UserAddress {
        -int id
        -int user_id
        +string full_name
        +string phone
        +string line1
        +string city
        +string state
        +string country
        +string zipcode
        +boolean is_default
        +getAddressById() UserAddress
        +getAddressesByUser(userId) List~UserAddress~
        +setAsDefault() void
    }

    class BookImage {
        -int id
        -int book_id
        +string image_url
        +int sort_order
        +getImagesByBook(bookId) List~BookImage~
    }

    %% Relationships
    User "1" --> "*" Order : places
    User "1" --> "*" Review : writes
    User "1" --> "*" Wishlist : has
    User "1" --> "*" UserAddress : has
    User "1" --> "*" Cart : owns
    
    Book "1" --> "*" Review : receives
    Book "1" --> "*" Wishlist : in
    Book "1" --> "*" OrderItem : ordered_as
    Book "1" --> "*" CartItem : in_cart
    Book "1" --> "*" BookImage : has
    Book "*" --> "1" Category : belongs_to
    
    Cart "1" --> "*" CartItem : contains
    Cart "*" --> "1" User : owned_by
    
    Order "1" --> "*" OrderItem : contains
    Order "1" --> "*" Payment : has
    Order "*" --> "1" User : placed_by
    Order "*" --> "1" UserAddress : uses
    
    OrderItem "*" --> "1" Order : part_of
    OrderItem "*" --> "1" Book : references
    
    CartItem "*" --> "1" Cart : part_of
    CartItem "*" --> "1" Book : references
    
    Payment "*" --> "1" Order : pays_for
    
    Order "*" --> "*" Voucher : uses
    
    Category "1" --> "*" Category : parent_of
```

## Cách sử dụng:

### 1. PlantUML (File: `Class_Diagram.puml`)
- Mở file `backend/Class_Diagram.puml`
- Sử dụng:
  - **Online**: http://www.plantuml.com/plantuml/uml/
  - **VS Code**: Cài extension "PlantUML"
  - **IntelliJ/WebStorm**: Có sẵn plugin PlantUML
  - **Command line**: `java -jar plantuml.jar Class_Diagram.puml`

### 2. Mermaid (File: `Class_Diagram.md`)
- File này có thể xem trực tiếp trong:
  - GitHub (render tự động)
  - VS Code với extension "Markdown Preview Mermaid Support"
  - https://mermaid.live/
  - Các markdown viewers hỗ trợ Mermaid

## So sánh với FurniScape Diagram:

| FurniScape | Book Store |
|------------|------------|
| User | User |
| Product | Book |
| Comment | Review |
| Cart | Cart |
| Order | Order |
| Order Detail | OrderItem |
| Payment | Payment |
| - | Voucher (thêm) |
| - | Category (thêm) |
| - | Wishlist (thêm) |
| - | UserAddress (thêm) |
| - | BookImage (thêm) |
| - | CartItem (thêm) |

## Relationships:

- **Association**: User → Order, User → Review, Book → Review
- **Composition** (filled diamond): Order → OrderItem, Order → Payment, Cart → CartItem, Book → BookImage
- **Aggregation**: User → Cart, Book → Category
- **Many-to-Many**: Order ↔ Voucher (qua order_vouchers table)

