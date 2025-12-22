import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMapPin, HiOutlinePlus } from 'react-icons/hi2';

import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { useCreateVnpayPaymentUrlMutation } from '../../redux/features/payments/paymentsApi';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { useGetAddressesQuery } from '../../redux/features/addresses/addressesApi';

const CheckoutPage = () => {
    // All hooks must be called before any conditional returns
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Voucher from localStorage (read-only, for confirmation display)
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [shippingDiscount, setShippingDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default COD
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useSavedAddress, setUseSavedAddress] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    
    const {
        register,
        handleSubmit,
        setValue,
    } = useForm();

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const [createVnpayPaymentUrl, { isLoading: isCreatingPaymentUrl }] = useCreateVnpayPaymentUrlMutation();

    // Fetch addresses
    const { data: addresses = [], isLoading: isLoadingAddresses } = useGetAddressesQuery();
    
    // Load voucher from localStorage (read-only, for confirmation display)
    useEffect(() => {
        const savedVoucher = localStorage.getItem('appliedVoucher');
        if (savedVoucher) {
            try {
                const voucher = JSON.parse(savedVoucher);
                setAppliedVoucher({ code: voucher.code });
                setDiscountAmount(voucher.discount || 0);
                setShippingDiscount(voucher.shippingDiscount || 0);
            } catch (e) {
                // Error loading voucher - silent fail, user can still checkout
                if (import.meta.env.DEV) {
                  console.error('Error loading voucher:', e);
                }
            }
        }
    }, []);

    // Check admin after all hooks are called
    const isAdmin = currentUser?.role === "ADMIN";
    if (isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    // Tính tổng tiền có tính quantity
    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    // Tổng số lượng sách
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    
    // Tính total price với discount
    // Note: Shipping fee sẽ được tính ở backend, ở đây chỉ hiển thị ước tính
    const estimatedShippingFee = 0; // Backend sẽ tính shipping fee
    const totalPrice = (subtotal - discountAmount + estimatedShippingFee).toFixed(2);

    // Auto-fill form khi chọn địa chỉ
    useEffect(() => {
        if (selectedAddressId && useSavedAddress) {
            const address = addresses.find(addr => addr._id === selectedAddressId);
            if (address) {
                setValue('name', address.fullName);
                setValue('phone', address.phone);
                setValue('address', address.line1);
                setValue('city', address.city);
                setValue('state', address.state || '');
                setValue('country', address.country);
                setValue('zipcode', address.zipcode || '');
            }
        }
    }, [selectedAddressId, useSavedAddress, addresses, setValue]);

    // Auto-select default address nếu có
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                // Use setTimeout to avoid setState in effect warning
                setTimeout(() => {
                    setSelectedAddressId(defaultAddress._id);
                    setUseSavedAddress(true);
                }, 0);
            }
        }
    }, [addresses, selectedAddressId]);
    
    const onSubmit = async (data) => {
        // Tạo mảng productIds với quantity (mỗi sách xuất hiện quantity lần)
        const productIdsWithQuantity = cartItems.map(item => ({
            bookId: Number(item._id), // Ensure it's a number
            quantity: Number(item.quantity) || 1
        }));
     
        // Nếu dùng saved address, lấy country từ address
        const selectedAddress = useSavedAddress && selectedAddressId 
            ? addresses.find(addr => addr._id === selectedAddressId)
            : null;
        
        const newOrder = {
            name: data.name,
            email: currentUser?.email,
            address: {
                city: data.city || selectedAddress?.city || '',
                country: data.country || selectedAddress?.country || 'Vietnam', // Default to Vietnam
                state: data.state || selectedAddress?.state || '',
                zipcode: data.zipcode || selectedAddress?.zipcode || ''
            },
            phone: data.phone || selectedAddress?.phone || '',
            productIds: productIdsWithQuantity,
            paymentMethod: paymentMethod, // COD hoặc VNPAY
            voucherCode: appliedVoucher?.code || null, // Gửi voucher code lên backend
            // shippingFee sẽ được tính ở backend (không cần gửi từ frontend)
            addressId: useSavedAddress ? selectedAddressId : null, // Link tới address nếu dùng saved address
        };
        
        try {
            const orderResult = await createOrder(newOrder).unwrap();
            const orderId = orderResult.orderId;
            
            // Nếu là VNPay, tạo payment URL và redirect
            if (paymentMethod === 'VNPAY') {
                // Convert USD to VND (assuming 1 USD = 25000 VND for demo)
                // In production, you should get real exchange rate
                const usdToVndRate = 25000;
                const amountInVND = Math.round(parseFloat(totalPrice) * usdToVndRate);
                
                const paymentResult = await createVnpayPaymentUrl({
                    orderId,
                    amount: amountInVND
                }).unwrap();
                
                // ✅ FIX: KHÔNG clear cart khi redirect đến VNPay
                // Chỉ clear cart khi payment thành công (trong PaymentSuccess.jsx)
                // Nếu user hủy thanh toán, cart vẫn còn để user có thể thử lại
                
                // Redirect to VNPay
                window.location.href = paymentResult.paymentUrl;
                return;
            }
            
            // For COD: clear cart and show success
            dispatch(clearCart());
            localStorage.removeItem('appliedVoucher');
            
            Swal.fire({
                title: "Order Confirmed!",
                text: "Your order has been placed successfully!",
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "View Orders"
              });
            navigate("/orders");
        } catch (error) {
            // Error already displayed to user via Swal
            if (import.meta.env.DEV) {
              console.error("Error placing order:", error);
              console.error("Error response:", error.response?.data);
            }
            
            // Hiển thị error message chi tiết hơn
            const errorMessage = error.response?.data?.message 
                || error.message 
                || "Failed to place your order. Please try again.";
            
            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    };

    if(isLoading || isLoadingAddresses) return <div className="min-h-screen flex items-center justify-center">Loading....</div>
    
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-600 mb-2">Order Summary</h2>
                            
                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow p-4 mb-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-${discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Fee</span>
                                        <span className="text-gray-900">Will be calculated at checkout</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span className="text-red-600">${totalPrice}</span>
                                    </div>
                                </div>
                                
                                {/* Applied Voucher Display (Read-only) */}
                                {appliedVoucher && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-green-800 text-sm">Voucher Applied</p>
                                            <p className="text-xs text-green-600">Code: {appliedVoucher.code}</p>
                                            <p className="text-xs text-green-600">Discount: ${discountAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-gray-500 mb-6">
                                Items: {totalItems} ({cartItems.length} {cartItems.length === 1 ? 'product' : 'different products'})
                            </p>
                        </div>
                        
                        {/* Applied Voucher Display (Read-only confirmation) */}
                        {appliedVoucher && (
                            <div className="bg-white rounded shadow-lg p-4 md:p-6 mb-6">
                                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Applied Promotion
                                </h3>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-green-800 text-sm">Voucher Applied</p>
                                        <p className="text-xs text-green-600">Code: {appliedVoucher.code}</p>
                                        <p className="text-xs text-green-600">Discount: ${discountAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">To change voucher, please go back to cart page.</p>
                            </div>
                        )}
                        
                        {/* Payment Method Selection */}
                        <div className="bg-white rounded shadow-lg p-4 md:p-6 mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                                        <p className="text-sm text-gray-500">Pay with cash when you receive your order</p>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </label>

                                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={paymentMethod === 'VNPAY'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <span className="font-medium text-gray-900">VNPay</span>
                                        <p className="text-sm text-gray-500">Pay online with VNPay (ATM, Credit Card, E-Wallet)</p>
                                    </div>
                                    {paymentMethod === 'VNPAY' && (
                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Saved Addresses Section */}
                        {addresses.length > 0 && (
                            <div className="bg-white rounded shadow-lg p-4 md:p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                        <HiMapPin className="w-5 h-5 text-indigo-600" />
                                        Saved Addresses
                                    </h3>
                                    <Link
                                        to="/addresses"
                                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" />
                                        Manage Addresses
                                    </Link>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useSavedAddress}
                                            onChange={(e) => {
                                                setUseSavedAddress(e.target.checked);
                                                if (!e.target.checked) {
                                                    setSelectedAddressId(null);
                                                } else if (addresses.length > 0 && !selectedAddressId) {
                                                    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                                                    setSelectedAddressId(defaultAddr._id);
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Use saved address</span>
                                    </label>
                        </div>

                                {useSavedAddress && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                onClick={() => setSelectedAddressId(address._id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedAddressId === address._id
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {address.isDefault && (
                                                            <span className="inline-block px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full mb-2">
                                                                Default
                                                            </span>
                                                        )}
                                                        <p className="font-semibold text-gray-800">{address.fullName}</p>
                                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{address.line1}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {[address.city, address.state, address.country].filter(Boolean).join(', ')}
                                                            {address.zipcode && ` ${address.zipcode}`}
                                                        </p>
                                                    </div>
                                                    {selectedAddressId === address._id && (
                                                        <div className="text-indigo-600">
                                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Address Form */}
                            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                                    <div className="text-gray-600">
                                        <p className="font-medium text-lg">
                                            {useSavedAddress ? 'Delivery Address' : 'Personal Details'}
                                        </p>
                                        <p>
                                            {useSavedAddress 
                                                ? 'Using saved address above' 
                                                : 'Please fill out all the fields.'}
                                        </p>
                                        {addresses.length === 0 && (
                                            <Link
                                                to="/addresses"
                                                className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-flex items-center gap-1"
                                            >
                                                <HiOutlinePlus className="w-4 h-4" />
                                                Add address for faster checkout
                                            </Link>
                                        )}
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                            <div className="md:col-span-5">
                                                <label htmlFor="full_name">Full Name</label>
                                                <input
                                                    {...register("name", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="name" 
                                                    id="name" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                            </div>

                                            <div className="md:col-span-5">
                                                <label html="email">Email Address</label>
                                                <input

                                                    type="text" name="email" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                    disabled
                                                    defaultValue={currentUser?.email}
                                                    placeholder="email@domain.com" />
                                            </div>
                                            <div className="md:col-span-5">
                                                <label html="phone">Phone Number</label>
                                                <input
                                                    {...register("phone", { required: !useSavedAddress })}
                                                    type="tel" 
                                                    name="phone" 
                                                    id="phone" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="+123 456 7890" />
                                            </div>

                                            <div className="md:col-span-3">
                                                <label htmlFor="address">Address / Street</label>
                                                <input
                                                    {...register("address", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="address" 
                                                    id="address" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="city">City</label>
                                                <input
                                                    {...register("city", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="city" 
                                                    id="city" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="country">Country / region</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("country", { required: !useSavedAddress })}
                                                        name="country" 
                                                        id="country" 
                                                        disabled={useSavedAddress}
                                                        placeholder="Country" 
                                                        className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="state">State / province</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("state", { required: false })}
                                                        name="state" 
                                                        id="state" 
                                                        disabled={useSavedAddress}
                                                        placeholder="State" 
                                                        className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-1">
                                                <label htmlFor="zipcode">Zipcode</label>
                                                <input
                                                    {...register("zipcode", { required: false })}
                                                    type="text" 
                                                    name="zipcode" 
                                                    id="zipcode" 
                                                    disabled={useSavedAddress}
                                                    className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-5 mt-3">
                                                <div className="inline-flex items-center">
                                                    <input
                                                        onChange={(e) => setIsChecked(e.target.checked)}
                                                        type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                    <label htmlFor="billing_same" className="ml-2 ">I agree to the <Link className='underline underline-offset-2 text-blue-600'>Terms & Conditions</Link> and <Link className='underline underline-offset-2 text-blue-600'>Shipping Policy.</Link></label>
                                                </div>
                                            </div>

                                            <div className="md:col-span-5 text-right">
                                                <div className="inline-flex items-end">
                                                    <button
                                                        disabled={!isChecked || isLoading || isCreatingPaymentUrl}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {isLoading || isCreatingPaymentUrl 
                                                            ? (paymentMethod === 'VNPAY' ? 'Redirecting to VNPay...' : 'Placing Order...') 
                                                            : 'Confirm Payment'}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        


                    </div>

                </div>
            </div>
            
        </section>
    )
}

export default CheckoutPage