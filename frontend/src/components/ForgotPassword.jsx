// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useForgotPasswordMutation } from '../redux/features/auth/authApi';
import Swal from 'sweetalert2';
import { HiArrowLeft, HiMail } from 'react-icons/hi';

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [resetLink, setResetLink] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword(data.email).unwrap();
      setEmailSent(true);
      
      // In development, show token and link
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setResetLink(result.resetLink);
        
        Swal.fire({
          icon: 'info',
          title: 'Reset Token Generated',
          html: `
            <p>In development mode, the reset token is shown below:</p>
            <p class="text-xs mt-2 break-all">${result.resetToken}</p>
            <p class="text-sm mt-4">
              <a href="${result.resetLink}" class="text-blue-500 underline" target="_blank">
                Click here to reset password
              </a>
            </p>
          `,
          confirmButtonText: 'Copy Link',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            navigator.clipboard.writeText(result.resetLink);
            Swal.fire('Copied!', 'Reset link copied to clipboard', 'success');
          }
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
          text: result.message || 'If that email exists, a password reset link has been sent to your email.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.data?.message || 'Failed to send reset email. Please try again.',
      });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <HiArrowLeft className="mr-2" />
          Back to Login
        </Link>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-3">
            <HiMail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {emailSent && !resetToken && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              If that email exists, a password reset link has been sent to your email.
              Please check your inbox and follow the instructions.
            </p>
          </div>
        )}

        {resetToken && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">Development Mode:</p>
            <p className="text-xs text-blue-700 break-all mb-2">
              <strong>Token:</strong> {resetToken}
            </p>
            <a
              href={resetLink}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Click here to reset password
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

