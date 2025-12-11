// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseURL"; // 🔥 đi lên 1 cấp rồi vào utils

const AuthContext = createContext();

// Hook để sử dụng auth context
export const useAuth = () => useContext(AuthContext);

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
    setCurrentUser(null);
  };

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
