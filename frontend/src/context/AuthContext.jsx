// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseURL"; // 🔥 đi lên 1 cấp rồi vào utils
import Swal from "sweetalert2";

const AuthContext = createContext();

// Hook để sử dụng auth context
export const useAuth = () => useContext(AuthContext);

// ✅ FIX: Setup axios interceptor để handle banned account errors (khi user đang dùng app bị ban)
let logoutCallback = null;

export const setupAxiosInterceptor = (logoutFn) => {
  logoutCallback = logoutFn;
  
  // Response interceptor để handle 403 banned account
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // ✅ FIX: Skip interceptor cho login/admin-login requests (để Login.jsx tự handle)
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/admin-login');
      
      // Chỉ handle banned account error cho các request khác (không phải login)
      if (
        !isLoginRequest &&
        error.response?.status === 403 &&
        error.response?.data?.message &&
        (error.response.data.message.toLowerCase().includes("banned") || 
         error.response.data.message.toLowerCase().includes("ban"))
      ) {
        const errorMessage = error.response.data.message;
        
        // Logout user và clear storage
        if (logoutCallback) {
          logoutCallback();
        } else {
          // Fallback: clear storage manually
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("appliedVoucher");
        }
        
        // Show error message với styling đặc biệt
        Swal.fire({
          icon: "warning",
          title: "Account Banned",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #d33;">
                Your account has been banned.
              </p>
              <p style="margin-bottom: 5px; color: #666;">
                ${errorMessage}
              </p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                If you believe this is a mistake, please contact the administrator.
              </p>
            </div>
          `,
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          // Redirect to login
          window.location.href = "/login";
        });
      }
      
      return Promise.reject(error);
    }
  );
};

// Helper function để get initial user from localStorage
const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      return JSON.parse(savedUser);
    }
  } catch (err) {
    console.error("Failed to parse saved user:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return null;
};

// Giữ đúng tên AuthProvide để App.jsx không phải sửa
export const AuthProvide = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);

  // Lấy token + user từ localStorage khi reload
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Use setTimeout to avoid setState in effect warning
    const timer = setTimeout(() => {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Register user thường – Register.jsx gọi registerUser(email, password)
  const registerUser = async (email, password) => {
    const name = email.split("@")[0];

    const res = await axios.post(`${getBaseUrl()}/api/auth/register`, {
      name,
      email,
      password,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  // Login user thường – Login.jsx gọi loginUser(email, password)
  const loginUser = async (email, password) => {
    const res = await axios.post(`${getBaseUrl()}/api/auth/login`, {
      email,
      password,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  // Login admin – AdminLogin.jsx gọi loginAdmin(email, password)
  const loginAdmin = async (email, password) => {
    const res = await axios.post(`${getBaseUrl()}/api/auth/admin-login`, {
      email,
      password,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  // Tạm thời chưa dùng Google login (đỡ đụng Firebase)
  const signInWithGoogle = async () => {
    throw new Error("Google login is not supported in this version");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("appliedVoucher");
    setCurrentUser(null);
  };

  // ✅ FIX: Setup axios interceptor khi component mount
  useEffect(() => {
    setupAxiosInterceptor(logout);
  }, []);

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    loginAdmin,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
