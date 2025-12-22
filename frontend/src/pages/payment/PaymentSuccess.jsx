import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiCheckCircle } from 'react-icons/hi2';
import Swal from 'sweetalert2';
import { clearCart } from '../../redux/features/cart/cartSlice';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear cart and voucher on successful payment
    // This ensures cart is cleared even if it wasn't cleared before redirect to VNPay
    dispatch(clearCart());
    localStorage.removeItem('appliedVoucher');
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Payment Successful!',
      text: `Your order #${orderId} has been paid successfully.`,
      confirmButtonText: 'View Orders',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/orders');
      }
    });
  }, [orderId, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <HiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your order #{orderId} has been paid successfully. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
