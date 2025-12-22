// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useResetPasswordMutation } from '../redux/features/auth/authApi';
import Swal from 'sweetalert2';
import { HiArrowLeft, HiLockClosed } from 'react-icons/hi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const newPassword = watch('newPassword');

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-zA-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'red' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'yellow' };
    return { strength, label: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data) => {
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Token',
        text: 'Please use the reset link from your email.',
      });
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      }).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'Your password has been reset. You can now login with your new password.',
        confirmButtonText: 'Go to Login',
      }).then(() => {
        navigate('/login');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error?.data?.message || 'Failed to reset password. The link may have expired.',
      });
    }
  };

  if (!token) {
    return (
      <div className="h-[calc(100vh-120px)] flex justify-center items-center">
        <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
          <div className="text-center">
            <HiLockClosed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              The reset link is missing or invalid. Please request a new password reset.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <HiLockClosed className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Your Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="newPassword"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                  message: 'Password must contain at least one letter and one number',
                },
              })}
              type="password"
              name="newPassword"
              id="newPassword"
              placeholder="Enter new password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow ${
                errors.newPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.color === 'red'
                          ? 'bg-red-500'
                          : passwordStrength.color === 'yellow'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.color === 'red'
                        ? 'text-red-500'
                        : passwordStrength.color === 'yellow'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters with letters and numbers
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match',
              })}
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm new password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;

