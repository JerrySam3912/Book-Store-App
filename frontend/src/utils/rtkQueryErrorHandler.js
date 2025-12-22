// Utility để handle banned account errors trong RTK Query
import Swal from "sweetalert2";

/**
 * Check if error is about banned account
 */
export const isBannedAccountError = (error) => {
  return (
    error?.status === 403 &&
    error?.data?.message &&
    (error.data.message.includes("banned") || 
     error.data.message.includes("Banned"))
  );
};

/**
 * Handle banned account error - logout và redirect
 */
export const handleBannedAccountError = (error) => {
  if (isBannedAccountError(error)) {
    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("appliedVoucher");
    
    // Show error message
    Swal.fire({
      icon: "error",
      title: "Account Banned",
      text: error.data.message || "Your account has been banned. Please contact administrator.",
      confirmButtonText: "OK",
    }).then(() => {
      // Redirect to login
      window.location.href = "/login";
    });
    
    return true; // Indicate error was handled
  }
  return false; // Error not handled
};
