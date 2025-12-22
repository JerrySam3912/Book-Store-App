import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { HiXCircle } from 'react-icons/hi2';
import Swal from 'sweetalert2';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed';
  const code = searchParams.get('code');

  useEffect(() => {
    // Show error message
    Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: reason === 'checksum_failed' 
        ? 'Payment verification failed. Please contact support.'
        : reason === 'order_not_found'
        ? 'Order not found. Please contact support.'
        : reason === 'server_error'
        ? 'Server error occurred. Please try again later.'
        : `Payment failed. ${code ? `Error code: ${code}` : ''}`,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }, [reason, code]);

  const getErrorMessage = () => {
    if (reason === 'checksum_failed') {
      return 'Payment verification failed. Please contact support if the payment was deducted from your account.';
    }
    if (reason === 'order_not_found') {
      return 'Order not found. Please contact support.';
    }
    if (reason === 'server_error') {
      return 'A server error occurred. Please try again later.';
    }
    return 'Payment was cancelled or failed. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <HiXCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-2">
          {orderId && `Order #${orderId}`}
        </p>
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>
        {code && (
          <p className="text-sm text-gray-500 mb-4">
            Error Code: {code}
          </p>
        )}
        <div className="space-y-3">
          {orderId && (
            <Link
              to="/orders"
              className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              View My Orders
            </Link>
          )}
          <Link
            to="/"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
