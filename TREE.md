build-full-stack-book-store-mern-app
 ┣ backend
 ┃ ┣ logs
 ┃ ┃ ┣ combined.log
 ┃ ┃ ┣ error.log
 ┃ ┃ ┣ exceptions.log
 ┃ ┃ ┗ rejections.log
 ┃ ┣ src
 ┃ ┃ ┣ addresses
 ┃ ┃ ┃ ┣ address.controller.js
 ┃ ┃ ┃ ┗ address.route.js
 ┃ ┃ ┣ auth
 ┃ ┃ ┃ ┣ auth.controller.js
 ┃ ┃ ┃ ┗ auth.route.js
 ┃ ┃ ┣ books
 ┃ ┃ ┃ ┣ book.controller.js
 ┃ ┃ ┃ ┗ book.route.js
 ┃ ┃ ┣ cart
 ┃ ┃ ┃ ┣ cart.controller.js
 ┃ ┃ ┃ ┗ cart.route.js
 ┃ ┃ ┣ middleware
 ┃ ┃ ┃ ┣ auth.middleware.js
 ┃ ┃ ┃ ┣ errorHandler.js
 ┃ ┃ ┃ ┣ rateLimiter.js
 ┃ ┃ ┃ ┣ validation.middleware.js
 ┃ ┃ ┃ ┗ verifyAdminToken.js
 ┃ ┃ ┣ orders
 ┃ ┃ ┃ ┣ order.controller.js
 ┃ ┃ ┃ ┗ order.route.js
 ┃ ┃ ┣ payments
 ┃ ┃ ┃ ┣ payment.controller.js
 ┃ ┃ ┃ ┗ payment.route.js
 ┃ ┃ ┣ reviews
 ┃ ┃ ┃ ┣ review.controller.js
 ┃ ┃ ┃ ┗ review.route.js
 ┃ ┃ ┣ settings
 ┃ ┃ ┃ ┣ settings.controller.js
 ┃ ┃ ┃ ┗ settings.route.js
 ┃ ┃ ┣ stats
 ┃ ┃ ┃ ┣ admin.stats.js
 ┃ ┃ ┃ ┣ analytics.controller.js
 ┃ ┃ ┃ ┗ analytics.route.js
 ┃ ┃ ┣ subscriptions
 ┃ ┃ ┃ ┣ subscription.controller.js
 ┃ ┃ ┃ ┗ subscription.route.js
 ┃ ┃ ┣ users
 ┃ ┃ ┃ ┣ user.controller.js
 ┃ ┃ ┃ ┗ user.route.js
 ┃ ┃ ┣ utils
 ┃ ┃ ┃ ┣ constants.js
 ┃ ┃ ┃ ┣ emailService.js
 ┃ ┃ ┃ ┣ logger.js
 ┃ ┃ ┃ ┗ vnpay.js
 ┃ ┃ ┣ vouchers
 ┃ ┃ ┃ ┣ voucher.controller.js
 ┃ ┃ ┃ ┗ voucher.route.js
 ┃ ┃ ┗ wishlist
 ┃ ┃ ┃ ┣ wishlist.controller.js
 ┃ ┃ ┃ ┗ wishlist.route.js
 ┃ ┣ .env
 ┃ ┣ .gitignore
 ┃ ┣ BACKEND_CODE_REVIEW.md
 ┃ ┣ db.js
 ┃ ┣ db.sql
 ┃ ┣ fix-all-console-logs.js
 ┃ ┣ hash.js
 ┃ ┣ index.js
 ┃ ┣ INSTALL_VNPAY_DEPENDENCIES.md
 ┃ ┣ kill-port.ps1
 ┃ ┣ migration-add-vnpay-payment-method.sql
 ┃ ┣ package-lock.json
 ┃ ┣ package.json
 ┃ ┣ README.md
 ┃ ┗ vercel.json
 ┣ frontend
 ┃ ┣ dist
 ┃ ┃ ┣ assets
 ┃ ┃ ┃ ┣ banner-CPNHAexH.png
 ┃ ┃ ┃ ┣ book-1-B1xQiJT2.png
 ┃ ┃ ┃ ┣ book-10-xVrX68nq.png
 ┃ ┃ ┃ ┣ book-11-CKqyPB4W.png
 ┃ ┃ ┃ ┣ book-12-Dg43d4ns.png
 ┃ ┃ ┃ ┣ book-13-DcQT69Os.png
 ┃ ┃ ┃ ┣ book-14-D2fHpBE1.png
 ┃ ┃ ┃ ┣ book-15-CgvOoWUN.png
 ┃ ┃ ┃ ┣ book-16-CI0t_bgM.png
 ┃ ┃ ┃ ┣ book-17-DCfySxvX.png
 ┃ ┃ ┃ ┣ book-18-Ck_SLq5q.png
 ┃ ┃ ┃ ┣ book-19-DXneJCzt.png
 ┃ ┃ ┃ ┣ book-2-Tu8MsBUJ.png
 ┃ ┃ ┃ ┣ book-20-Cc0XVoRk.png
 ┃ ┃ ┃ ┣ book-3-hEICsyVV.png
 ┃ ┃ ┃ ┣ book-4-D2LIpjOL.png
 ┃ ┃ ┃ ┣ book-5-EhY6gdv0.png
 ┃ ┃ ┃ ┣ book-6-BgG1845x.png
 ┃ ┃ ┃ ┣ book-7-CkRHt0El.png
 ┃ ┃ ┃ ┣ book-8-EjNNjCDW.png
 ┃ ┃ ┃ ┣ book-9-BOs4gFp5.png
 ┃ ┃ ┃ ┣ footer-logo-Dnfif8R1.png
 ┃ ┃ ┃ ┣ girl-stop-DWYq-HSK.png
 ┃ ┃ ┃ ┣ index-BpLCEy_G.css
 ┃ ┃ ┃ ┣ index-BxaNp3yb.js
 ┃ ┃ ┃ ┣ news-1-Bs2dD4Ui.png
 ┃ ┃ ┃ ┣ news-2-3kZaaqGT.png
 ┃ ┃ ┃ ┣ news-3-Bp5u55fO.png
 ┃ ┃ ┃ ┣ news-4-B5v-2cpe.png
 ┃ ┃ ┃ ┣ ride-lifetime-HWHy4DsQ.png
 ┃ ┃ ┃ ┗ young-bucks-DXcJ8Oet.png
 ┃ ┃ ┣ books.json
 ┃ ┃ ┣ fav-icon.png
 ┃ ┃ ┣ index.html
 ┃ ┃ ┗ vite.svg
 ┃ ┣ public
 ┃ ┃ ┣ books.json
 ┃ ┃ ┣ fav-icon.png
 ┃ ┃ ┗ vite.svg
 ┃ ┣ src
 ┃ ┃ ┣ assets
 ┃ ┃ ┃ ┣ books
 ┃ ┃ ┃ ┃ ┣ book-1.png
 ┃ ┃ ┃ ┃ ┣ book-10.png
 ┃ ┃ ┃ ┃ ┣ book-11.png
 ┃ ┃ ┃ ┃ ┣ book-12.png
 ┃ ┃ ┃ ┃ ┣ book-13.png
 ┃ ┃ ┃ ┃ ┣ book-14.png
 ┃ ┃ ┃ ┃ ┣ book-15.png
 ┃ ┃ ┃ ┃ ┣ book-16.png
 ┃ ┃ ┃ ┃ ┣ book-17.png
 ┃ ┃ ┃ ┃ ┣ book-18.png
 ┃ ┃ ┃ ┃ ┣ book-19.png
 ┃ ┃ ┃ ┃ ┣ book-2.png
 ┃ ┃ ┃ ┃ ┣ book-20.png
 ┃ ┃ ┃ ┃ ┣ book-3.png
 ┃ ┃ ┃ ┃ ┣ book-4.png
 ┃ ┃ ┃ ┃ ┣ book-5.png
 ┃ ┃ ┃ ┃ ┣ book-6.png
 ┃ ┃ ┃ ┃ ┣ book-7.png
 ┃ ┃ ┃ ┃ ┣ book-8.png
 ┃ ┃ ┃ ┃ ┣ book-9.png
 ┃ ┃ ┃ ┃ ┣ girl-stop.png
 ┃ ┃ ┃ ┃ ┣ ride-lifetime.png
 ┃ ┃ ┃ ┃ ┣ young-bucks-2.png
 ┃ ┃ ┃ ┃ ┗ young-bucks.png
 ┃ ┃ ┃ ┣ news
 ┃ ┃ ┃ ┃ ┣ news-1.png
 ┃ ┃ ┃ ┃ ┣ news-2.png
 ┃ ┃ ┃ ┃ ┣ news-3.png
 ┃ ┃ ┃ ┃ ┗ news-4.png
 ┃ ┃ ┃ ┣ avatar.png
 ┃ ┃ ┃ ┣ banner.png
 ┃ ┃ ┃ ┣ footer-logo.png
 ┃ ┃ ┃ ┣ github-cover.png
 ┃ ┃ ┃ ┗ react.svg
 ┃ ┃ ┣ components
 ┃ ┃ ┃ ┣ AdminLogin.jsx
 ┃ ┃ ┃ ┣ BookReviews.jsx
 ┃ ┃ ┃ ┣ ErrorBoundary.jsx
 ┃ ┃ ┃ ┣ Footer.jsx
 ┃ ┃ ┃ ┣ ForgotPassword.jsx
 ┃ ┃ ┃ ┣ Loading.jsx
 ┃ ┃ ┃ ┣ LoadingSkeleton.jsx
 ┃ ┃ ┃ ┣ Login.jsx
 ┃ ┃ ┃ ┣ Navbar.jsx
 ┃ ┃ ┃ ┣ Register.jsx
 ┃ ┃ ┃ ┗ ResetPassword.jsx
 ┃ ┃ ┣ context
 ┃ ┃ ┃ ┗ AuthContext.jsx
 ┃ ┃ ┣ pages
 ┃ ┃ ┃ ┣ addresses
 ┃ ┃ ┃ ┃ ┗ AddressesPage.jsx
 ┃ ┃ ┃ ┣ books
 ┃ ┃ ┃ ┃ ┣ BookCard.jsx
 ┃ ┃ ┃ ┃ ┣ BooksPage.jsx
 ┃ ┃ ┃ ┃ ┣ CartPage.jsx
 ┃ ┃ ┃ ┃ ┣ CheckoutPage.jsx
 ┃ ┃ ┃ ┃ ┣ OrderPage.jsx
 ┃ ┃ ┃ ┃ ┣ SingleBook.jsx
 ┃ ┃ ┃ ┃ ┗ WishlistPage.jsx
 ┃ ┃ ┃ ┣ dashboard
 ┃ ┃ ┃ ┃ ┣ addBook
 ┃ ┃ ┃ ┃ ┃ ┣ AddBook.jsx
 ┃ ┃ ┃ ┃ ┃ ┣ InputField.jsx
 ┃ ┃ ┃ ┃ ┃ ┗ SelectField.jsx
 ┃ ┃ ┃ ┃ ┣ analytics
 ┃ ┃ ┃ ┃ ┃ ┗ AnalyticsPage.jsx
 ┃ ┃ ┃ ┃ ┣ EditBook
 ┃ ┃ ┃ ┃ ┃ ┗ UpdateBook.jsx
 ┃ ┃ ┃ ┃ ┣ manageBooks
 ┃ ┃ ┃ ┃ ┃ ┗ ManageBooks.jsx
 ┃ ┃ ┃ ┃ ┣ manageOrders
 ┃ ┃ ┃ ┃ ┃ ┗ ManageOrders.jsx
 ┃ ┃ ┃ ┃ ┣ manageUsers
 ┃ ┃ ┃ ┃ ┃ ┗ ManageUsers.jsx
 ┃ ┃ ┃ ┃ ┣ settings
 ┃ ┃ ┃ ┃ ┃ ┗ SettingsPage.jsx
 ┃ ┃ ┃ ┃ ┣ users
 ┃ ┃ ┃ ┃ ┃ ┗ UserDashboard.jsx
 ┃ ┃ ┃ ┃ ┣ Dashboard.jsx
 ┃ ┃ ┃ ┃ ┣ DashboardLayout.jsx
 ┃ ┃ ┃ ┃ ┗ RevenueChart.jsx
 ┃ ┃ ┃ ┣ home
 ┃ ┃ ┃ ┃ ┣ Banner.jsx
 ┃ ┃ ┃ ┃ ┣ Home.jsx
 ┃ ┃ ┃ ┃ ┣ News.jsx
 ┃ ┃ ┃ ┃ ┣ Recommened.jsx
 ┃ ┃ ┃ ┃ ┗ TopSellers.jsx
 ┃ ┃ ┃ ┣ payment
 ┃ ┃ ┃ ┃ ┣ PaymentFailed.jsx
 ┃ ┃ ┃ ┃ ┗ PaymentSuccess.jsx
 ┃ ┃ ┃ ┗ user
 ┃ ┃ ┃ ┃ ┗ ProfilePage.jsx
 ┃ ┃ ┣ redux
 ┃ ┃ ┃ ┣ features
 ┃ ┃ ┃ ┃ ┣ addresses
 ┃ ┃ ┃ ┃ ┃ ┗ addressesApi.js
 ┃ ┃ ┃ ┃ ┣ analytics
 ┃ ┃ ┃ ┃ ┃ ┗ analyticsApi.js
 ┃ ┃ ┃ ┃ ┣ auth
 ┃ ┃ ┃ ┃ ┃ ┗ authApi.js
 ┃ ┃ ┃ ┃ ┣ books
 ┃ ┃ ┃ ┃ ┃ ┗ booksApi.js
 ┃ ┃ ┃ ┃ ┣ cart
 ┃ ┃ ┃ ┃ ┃ ┗ cartSlice.js
 ┃ ┃ ┃ ┃ ┣ orders
 ┃ ┃ ┃ ┃ ┃ ┗ ordersApi.js
 ┃ ┃ ┃ ┃ ┣ payments
 ┃ ┃ ┃ ┃ ┃ ┗ paymentsApi.js
 ┃ ┃ ┃ ┃ ┣ reviews
 ┃ ┃ ┃ ┃ ┃ ┗ reviewsApi.js
 ┃ ┃ ┃ ┃ ┣ settings
 ┃ ┃ ┃ ┃ ┃ ┗ settingsApi.js
 ┃ ┃ ┃ ┃ ┣ subscriptions
 ┃ ┃ ┃ ┃ ┃ ┗ subscriptionsApi.js
 ┃ ┃ ┃ ┃ ┣ users
 ┃ ┃ ┃ ┃ ┃ ┗ usersApi.js
 ┃ ┃ ┃ ┃ ┣ vouchers
 ┃ ┃ ┃ ┃ ┃ ┗ vouchersApi.js
 ┃ ┃ ┃ ┃ ┗ wishlist
 ┃ ┃ ┃ ┃ ┃ ┗ wishlistApi.js
 ┃ ┃ ┃ ┗ store.js
 ┃ ┃ ┣ routers
 ┃ ┃ ┃ ┣ AdminRoute.jsx
 ┃ ┃ ┃ ┣ PrivateRoute.jsx
 ┃ ┃ ┃ ┗ router.jsx
 ┃ ┃ ┣ utils
 ┃ ┃ ┃ ┣ baseURL.js
 ┃ ┃ ┃ ┣ exportUtils.js
 ┃ ┃ ┃ ┗ getImgUrl.js
 ┃ ┃ ┣ App.css
 ┃ ┃ ┣ App.jsx
 ┃ ┃ ┣ index.css
 ┃ ┃ ┗ main.jsx
 ┃ ┣ .env.local
 ┃ ┣ .gitignore
 ┃ ┣ eslint.config.js
 ┃ ┣ index.html
 ┃ ┣ package-lock.json
 ┃ ┣ package.json
 ┃ ┣ postcss.config.js
 ┃ ┣ README.md
 ┃ ┣ tailwind.config.js
 ┃ ┗ vite.config.js
 ┣ vnpay-demo
 ┃ ┗ vnpay_nodejs
 ┃ ┃ ┣ bin
 ┃ ┃ ┃ ┗ www
 ┃ ┃ ┣ config
 ┃ ┃ ┃ ┗ default.json
 ┃ ┃ ┣ nbproject
 ┃ ┃ ┃ ┣ private
 ┃ ┃ ┃ ┃ ┣ private.properties
 ┃ ┃ ┃ ┃ ┗ private.xml
 ┃ ┃ ┃ ┣ project.properties
 ┃ ┃ ┃ ┗ project.xml
 ┃ ┃ ┣ public
 ┃ ┃ ┃ ┗ stylesheets
 ┃ ┃ ┃ ┃ ┣ bootstrap.min.css
 ┃ ┃ ┃ ┃ ┣ jumbotron-narrow.css
 ┃ ┃ ┃ ┃ ┗ style.css
 ┃ ┃ ┣ routes
 ┃ ┃ ┃ ┗ order.js
 ┃ ┃ ┣ views
 ┃ ┃ ┃ ┣ error.jade
 ┃ ┃ ┃ ┣ ipn_success.jade
 ┃ ┃ ┃ ┣ layout.jade
 ┃ ┃ ┃ ┣ order.jade
 ┃ ┃ ┃ ┣ orderlist.jade
 ┃ ┃ ┃ ┣ querydr.jade
 ┃ ┃ ┃ ┣ refund.jade
 ┃ ┃ ┃ ┗ success.jade
 ┃ ┃ ┣ app.js
 ┃ ┃ ┣ package-lock.json
 ┃ ┃ ┣ package.json
 ┃ ┃ ┗ readme.txt
 ┗ book-store.fig