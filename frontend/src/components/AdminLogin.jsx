// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const AdminLogin = () => {
//   const [message, setMessage] = useState("");
//   const { register, handleSubmit } = useForm();
//   const navigate = useNavigate();
//   const { loginAdmin } = useAuth();

//   const onSubmit = async (data) => {
//     setMessage("");
//     try {
//       // data: { email, password }
//       const user = await loginAdmin(data.email, data.password);

//       if (user.role !== "ADMIN") {
//         setMessage("This account is not an admin.");
//         return;
//       }

//       alert("Admin login successful!");
//       navigate("/dashboard");
//     } catch (error) {
//       console.error(error);
//       setMessage("Invalid email or password.");
//     }
//   };

//   return (
//     <div className="h-screen flex justify-center items-center ">
//       <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//         <h2 className="text-xl font-semibold mb-4">Admin Dashboard Login</h2>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="mb-4">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="email"
//             >
//               Admin Email
//             </label>
//             <input
//               {...register("email", { required: true })}
//               type="email"
//               id="email"
//               placeholder="admin@example.com"
//               className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
//             />
//           </div>
//           <div className="mb-4">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="password"
//             >
//               Password
//             </label>
//             <input
//               {...register("password", { required: true })}
//               type="password"
//               id="password"
//               placeholder="Password"
//               className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
//             />
//           </div>
//           {message && (
//             <p className="text-red-500 text-xs italic mb-3">{message}</p>
//           )}
//           <div className="w-full">
//             <button className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none">
//               Login
//             </button>
//           </div>
//         </form>

//         <p className="mt-5 text-center text-gray-500 text-xs">
//           ©2025 Book Store. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;

// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const AdminLogin = () => {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const onSubmit = async (data) => {
    setMessage("");

    try {
      await loginAdmin(data.email, data.password);
      Swal.fire({
        icon: "success",
        title: "Admin Login Success!",
        text: "Welcome to Admin Dashboard",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard"); // admin dashboard
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Admin login failed";
      const statusCode = err?.response?.status;

      // Check if account is banned (403 status và message chứa "banned")
      const isBannedAccount = statusCode === 403 && (
        errorMessage.toLowerCase().includes("banned") || 
        errorMessage.toLowerCase().includes("ban")
      );

      setMessage(errorMessage);

      // Hiển thị thông báo đặc biệt cho banned admin account
      if (isBannedAccount) {
        Swal.fire({
          icon: "warning",
          title: "Admin Account Banned",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #d33;">
                Your admin account has been banned.
              </p>
              <p style="margin-bottom: 5px; color: #666;">
                ${errorMessage}
              </p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                Please contact the system administrator to resolve this issue.
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
          title: "Admin Login Failed",
          text: errorMessage,
          confirmButtonText: "OK",
        });
      }

      // Error already handled and displayed to user
      if (import.meta.env.DEV) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        {message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-center text-red-600 text-sm font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              {...register("email", { required: true })}
              id="email"
              type="email"
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              className="block mb-1 text-sm font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <input
              {...register("password", { required: true })}
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded mt-4 hover:opacity-90"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
