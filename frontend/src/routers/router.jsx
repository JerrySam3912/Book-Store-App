import { createBrowserRouter } from "react-router-dom";
import App from "../App";

// pages
import Home from "../pages/home/Home";
import BooksPage from "../pages/books/BooksPage";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import SingleBook from "../pages/books/SingleBook";
import OrderPage from "../pages/books/OrderPage";
import WishlistPage from "../pages/books/WishlistPage";
import AddressesPage from "../pages/addresses/AddressesPage";
import ProfilePage from "../pages/user/ProfilePage";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import PaymentFailed from "../pages/payment/PaymentFailed";

// auth
import Login from "../components/Login";
import Register from "../components/Register";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import AdminLogin from "../components/AdminLogin";
// ❌ Bỏ dòng import AuthProvide ở đây đi vì không dùng nữa

// dashboard
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";
import ManageOrders from "../pages/dashboard/manageOrders/ManageOrders";
import ManageUsers from "../pages/dashboard/manageUsers/ManageUsers";
// Analytics merged into Dashboard - no longer needed as separate route
import SettingsPage from "../pages/dashboard/settings/SettingsPage";

// routes wrapper
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/books", element: <BooksPage /> },
      { path: "/cart", element: <CartPage /> },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <PrivateRoute>
            <OrderPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <PrivateRoute>
            <WishlistPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/addresses",
        element: (
          <PrivateRoute>
            <AddressesPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/books/:id",
        element: <SingleBook />,
      },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/payment/success", element: <PaymentSuccess /> },
      { path: "/payment/failed", element: <PaymentFailed /> },
      // User Dashboard route removed - redundant with Order History in Profile
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      // Admin dashboard
      {
        path: "/dashboard",
        element: (
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        ),
        children: [
          { path: "", element: <Dashboard /> },
          { path: "manage-books", element: <ManageBooks /> },
          { path: "manage-orders", element: <ManageOrders /> },
          { path: "manage-users", element: <ManageUsers /> },
          // Analytics merged into Dashboard main page with tabs
          { path: "settings", element: <SettingsPage /> },
          { path: "add-new-book", element: <AddBook /> },
          { path: "edit-book/:id", element: <UpdateBook /> },
        ],
      },
    ],
  },
  // Route /admin: Không cần bọc AuthProvide nữa (vì main.jsx sẽ bọc)
  {
    path: "/admin",
    element: <AdminLogin />
  },
]);

export default router;