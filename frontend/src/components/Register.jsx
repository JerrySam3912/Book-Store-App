import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Register = () => {
  const [message, setMessage] = useState("");
  const { registerUser } = useAuth(); // ❌ bỏ signInWithGoogle
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser(data.email, data.password);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User registered successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Please provide a valid email and password";
      setMessage(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
      });
      // Error already handled and displayed to user
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-zA-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    
    if (strength <= 2) return { strength, label: "Weak", color: "red" };
    if (strength <= 3) return { strength, label: "Medium", color: "yellow" };
    return { strength, label: "Strong", color: "green" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleGoogleSignIn = () => {
    // Không còn dùng Firebase nữa, chỉ báo cho user biết
    alert("Google sign-in is not supported in this version of the project.");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center ">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Please Register</h2>

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
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                },
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                  message: "Password must contain at least one letter and one number"
                }
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
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.color === "red" ? "bg-red-500" :
                        passwordStrength.color === "yellow" ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === "red" ? "text-red-500" :
                    passwordStrength.color === "yellow" ? "text-yellow-500" :
                    "text-green-500"
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters with letters and numbers
                </p>
              </div>
            )}
          </div>

          {message && (
            <p className="text-red-500 text-xs italic mb-3">{message}</p>
          )}

          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none">
              Register
            </button>
          </div>
        </form>

        <p className="align-baseline font-medium mt-4 text-sm">
          Have an account? Please{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Login
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

export default Register;
