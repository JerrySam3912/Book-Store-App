import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    localStorage.removeItem('user'); // Xóa nếu data rác
  }

  // Logic bảo mật: Phải có Token VÀ User tồn tại VÀ Role là ADMIN
  if (!token || !user || user.role !== 'ADMIN') {
    // Nếu không phải admin, đá về trang login admin
    return <Navigate to="/admin" replace />;
  }

  return children ? children : <Outlet />;
}

export default AdminRoute;