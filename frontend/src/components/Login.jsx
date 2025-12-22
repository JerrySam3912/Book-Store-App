import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Login = () => {
  const [message, setMessage] = useState("");
  const { loginUser } = useAuth(); // ❌ bỏ signInWithGoogle
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Login successful!",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Please provide a valid email and password";
      const statusCode = error?.response?.status;
      
      // Check if account is banned (403 status và message chứa "banned")
      const isBannedAccount = statusCode === 403 && (
        errorMessage.toLowerCase().includes("banned") || 
        errorMessage.toLowerCase().includes("ban")
      );

      setMessage(errorMessage);

      // Hiển thị thông báo đặc biệt cho banned account
      if (isBannedAccount) {
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
        });
      } else {
        // Hiển thị error thông thường cho các lỗi khác
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMessage,
          confirmButtonText: "OK",
        });
      }
      
      // Error already handled by try-catch and displayed to user
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleGoogleSignIn = () => {
    // Không còn dùng Firebase nữa, chỉ báo cho user biết
    alert("Google sign-in is not supported in this version of the project.");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center ">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Please Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              {...register("password", { 
                required: "Password is required"
              })}
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {message && (
            <p className="text-red-500 text-xs italic mb-3">{message}</p>
          )}

          <div className="mb-4">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-700 float-right"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none">
              Login
            </button>
          </div>
        </form>

        <p className="align-baseline font-medium mt-4 text-sm">
          Haven&apos;t an account? Please{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-700"
          >
            Register
          </Link>
        </p>

        {/* google sign in (UI giữ nguyên, chỉ đổi logic) */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex flex-wrap gap-1 items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            <FaGoogle className="mr-2" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-5 text-center text-gray-500 text-xs">
          ©2025 Book Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
