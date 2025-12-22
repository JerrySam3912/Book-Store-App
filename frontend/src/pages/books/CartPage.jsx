import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, incrementQuantity, decrementQuantity } from '../../redux/features/cart/cartSlice';
import { HiOutlinePlus, HiOutlineMinus, HiOutlineXMark, HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { useGetAvailableVouchersQuery, useValidateVoucherMutation } from '../../redux/features/vouchers/vouchersApi';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const CartPage = () => {
    // All hooks must be called before any conditional returns
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    
    // Voucher state
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [shippingDiscount, setShippingDiscount] = useState(0);
    const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
    
    // Voucher APIs
    const { data: vouchersData } = useGetAvailableVouchersQuery();
    const [validateVoucher] = useValidateVoucherMutation();

    // Check admin after all hooks are called
    const isAdmin = currentUser?.role === "ADMIN";
    if (isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    // Tính tổng tiền có tính quantity
    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    const totalPrice = (subtotal - discountAmount).toFixed(2);
    
    // Tổng số lượng sách
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    
    // Lấy categories của các sách trong cart
    const bookCategories = [...new Set(cartItems.map(item => item.category))];
    
    const availableVouchers = vouchersData?.vouchers || [];

    const handleRemoveFromCart = (product) => {
        dispatch(removeFromCart(product));
    }

    const handleClearCart = () => {
        dispatch(clearCart());
    }

    const handleIncrement = (product) => {
        dispatch(incrementQuantity(product));
    }

    const handleDecrement = (product) => {
        dispatch(decrementQuantity(product));
    }
    
    // Handle voucher apply
    const handleApplyVoucher = async (code = null) => {
        const codeToApply = code || voucherCode.trim().toUpperCase();
        if (!codeToApply) {
            Swal.fire({
                icon: 'warning',
                title: 'Voucher Code Required',
                text: 'Please enter a voucher code'
            });
            return;
        }
        
        try {
            const result = await validateVoucher({
                code: codeToApply,
                orderTotal: subtotal,
                itemCount: totalItems,
                bookCategories: bookCategories
            }).unwrap();
            
            if (result.valid) {
                setAppliedVoucher(result.voucher);
                setDiscountAmount(result.discount);
                setShippingDiscount(result.shippingDiscount || 0);
                setVoucherCode(''); // Clear input after successful apply
                setShowVoucherDropdown(false); // Close dropdown
                Swal.fire({
                    icon: 'success',
                    title: 'Voucher Applied!',
                    text: `Discount: $${result.discount.toFixed(2)}`
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Voucher',
                    text: result.error || 'This voucher cannot be applied'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.data?.error || 'Failed to validate voucher'
            });
        }
    }
    
    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setDiscountAmount(0);
        setShippingDiscount(0);
        setVoucherCode('');
    }
    
    // Lưu voucher vào localStorage để dùng ở checkout
    useEffect(() => {
        if (appliedVoucher) {
            localStorage.setItem('appliedVoucher', JSON.stringify({
                code: appliedVoucher.code,
                discount: discountAmount,
                shippingDiscount: shippingDiscount
            }));
        } else {
            localStorage.removeItem('appliedVoucher');
        }
    }, [appliedVoucher, discountAmount, shippingDiscount]);

    return (
        <>
            <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div className="text-lg font-medium text-gray-900">
                            Shopping cart 
                            {totalItems > 0 && (
                                <span className="ml-2 text-sm text-gray-500">
                                    ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                                </span>
                            )}
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                            <button
                                type="button"
                                onClick={handleClearCart}
                                className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200"
                            >
                                <span className="">Clear Cart</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flow-root">
                            {cartItems.length > 0 ? (
                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                    {cartItems.map((product) => (
                                        <li key={product?._id} className="flex py-6">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <img
                                                    alt={product?.title}
                                                    src={`${getImgUrl(product?.coverImage)}`}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>

                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                                                        <h3>
                                                            <Link to={`/books/${product?._id}`} className="hover:text-indigo-600">
                                                                {product?.title}
                                                            </Link>
                                                        </h3>
                                                        <p className="sm:ml-4">
                                                            ${(product?.newPrice * (product?.quantity || 1)).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500 capitalize">
                                                        <strong>Category: </strong>{product?.category}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        <strong>Price: </strong>${product?.newPrice} each
                                                    </p>
                                                </div>
                                                <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                                                    {/* Quantity controls */}
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-gray-500">Qty:</strong>
                                                        <div className="flex items-center border rounded-md">
                                                            <button
                                                                onClick={() => handleDecrement(product)}
                                                                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                                                                title="Decrease quantity"
                                                            >
                                                                <HiOutlineMinus className="w-4 h-4" />
                                                            </button>
                                                            <span className="px-3 py-1 border-x font-medium">
                                                                {product?.quantity || 1}
                                                            </span>
                                                            <button
                                                                onClick={() => handleIncrement(product)}
                                                                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                                                                title="Increase quantity"
                                                            >
                                                                <HiOutlinePlus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <button
                                                            onClick={() => handleRemoveFromCart(product)}
                                                            type="button" 
                                                            className="font-medium text-red-600 hover:text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 mb-4">Your cart is empty!</p>
                                    <Link 
                                        to="/" 
                                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Continue Shopping &rarr;
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Voucher/Promotion Section */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Promotions
                            </h3>
                            {availableVouchers.length > 0 && (
                                <button
                                    onClick={() => setShowVoucherDropdown(!showVoucherDropdown)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    See More
                                    {showVoucherDropdown ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                        
                        {/* Applied Voucher Display */}
                        {appliedVoucher && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-800">{appliedVoucher.name}</p>
                                        <p className="text-sm text-green-600">Code: {appliedVoucher.code}</p>
                                        <p className="text-sm text-green-600">Discount: ${discountAmount.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={handleRemoveVoucher}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <HiOutlineXMark className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Manual Voucher Input */}
                        {!appliedVoucher && (
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    placeholder="Enter promotion code / Gift Card"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                />
                                <button
                                    onClick={handleApplyVoucher}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                        
                        {/* Voucher Dropdown Table */}
                        {showVoucherDropdown && availableVouchers.length > 0 && (
                            <div className="mt-4 border border-gray-200 rounded-lg bg-white shadow-lg max-h-96 overflow-y-auto">
                                {/* Discount Codes Section */}
                                <div className="p-4 border-b">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Discount Codes</h4>
                                    <div className="space-y-2">
                                        {availableVouchers
                                            .filter(v => v.type === 'PERCENTAGE' || v.type === 'FIXED_AMOUNT')
                                            .map((voucher) => {
                                                const minOrderAmount = Number(voucher.min_order_amount || 0);
                                                let canApply = subtotal >= minOrderAmount && 
                                                    (!voucher.min_quantity || totalItems >= voucher.min_quantity);
                                                const needMoreAmount = minOrderAmount > subtotal ? minOrderAmount - subtotal : 0;
                                                const needMoreQuantity = voucher.min_quantity && totalItems < voucher.min_quantity ? voucher.min_quantity - totalItems : 0;
                                                
                                                // Check category restriction
                                                let categoryMatch = true;
                                                if (voucher.applicable_categories) {
                                                    try {
                                                        const categories = JSON.parse(voucher.applicable_categories);
                                                        if (Array.isArray(categories) && categories.length > 0) {
                                                            categoryMatch = bookCategories.some(cat => categories.includes(cat.toLowerCase()));
                                                        }
                                                    } catch (e) {
                                                        // Invalid JSON, ignore
                                                    }
                                                }
                                                canApply = canApply && categoryMatch;
                                                
                                                return (
                                                    <div
                                                        key={voucher.id}
                                                        className={`p-3 border-2 rounded-lg ${
                                                            canApply ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                                                                        canApply ? 'bg-orange-500' : 'bg-gray-400'
                                                                    }`}>
                                                                        <span className="text-white font-bold text-sm">%</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{voucher.name}</p>
                                                                        <p className="text-xs text-gray-500">Code: {voucher.code}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                                                                {voucher.min_order_amount > 0 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Order from ${Number(voucher.min_order_amount || 0).toFixed(2)}
                                                                    </p>
                                                                )}
                                                                {voucher.min_quantity && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Buy {voucher.min_quantity} or more items
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Expiry: {new Date(voucher.valid_to).toLocaleDateString()}
                                                                </p>
                                                                {!canApply && (
                                                                    <div className="mt-2">
                                                                        {needMoreAmount > 0 && (
                                                                            <div className="mb-1">
                                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, minOrderAmount > 0 ? (subtotal / minOrderAmount) * 100 : 0)}%` }}></div>
                                                                                </div>
                                                                                <p className="text-sm text-orange-600 mt-1">
                                                                                    Buy more ${needMoreAmount.toFixed(2)} to apply
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {needMoreQuantity > 0 && (
                                                                            <p className="text-sm text-orange-600">
                                                                                Add {needMoreQuantity} more item(s) to apply
                                                                            </p>
                                                                        )}
                                                                        {!categoryMatch && (
                                                                            <p className="text-sm text-orange-600">
                                                                                This voucher is not applicable to your cart items
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                {canApply && !appliedVoucher ? (
                                                                    <button
                                                                        onClick={() => handleApplyVoucher(voucher.code)}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        disabled
                                                                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm whitespace-nowrap"
                                                                    >
                                                                        {needMoreAmount > 0 || needMoreQuantity > 0 ? 'Buy More' : 'Not Eligible'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                                
                                {/* Shipping Codes Section */}
                                <div className="p-4">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Shipping Codes</h4>
                                    <div className="space-y-2">
                                        {availableVouchers
                                            .filter(v => v.type === 'FREE_SHIP')
                                            .map((voucher) => {
                                                const minOrderAmount = Number(voucher.min_order_amount || 0);
                                                const canApply = subtotal >= minOrderAmount;
                                                const needMore = minOrderAmount > subtotal ? minOrderAmount - subtotal : 0;
                                                
                                                return (
                                                    <div
                                                        key={voucher.id}
                                                        className={`p-3 border-2 rounded-lg ${
                                                            canApply ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                                                                        canApply ? 'bg-blue-500' : 'bg-gray-400'
                                                                    }`}>
                                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{voucher.name}</p>
                                                                        <p className="text-xs text-gray-500">Code: {voucher.code}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                                                                {minOrderAmount > 0 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Order from ${minOrderAmount.toFixed(2)}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Expiry: {new Date(voucher.valid_to).toLocaleDateString()}
                                                                </p>
                                                                {!canApply && needMore > 0 && (
                                                                    <div className="mt-2">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, minOrderAmount > 0 ? (subtotal / minOrderAmount) * 100 : 0)}%` }}></div>
                                                                        </div>
                                                                        <p className="text-sm text-orange-600">
                                                                            Buy more ${needMore.toFixed(2)} to apply
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                {canApply && !appliedVoucher ? (
                                                                    <button
                                                                        onClick={() => handleApplyVoucher(voucher.code)}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        disabled
                                                                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm whitespace-nowrap"
                                                                    >
                                                                        Buy More
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Eligible Promotions Count */}
                        {!showVoucherDropdown && availableVouchers.length > 0 && (
                            <div className="text-sm text-gray-600">
                                {availableVouchers.filter(v => {
                                    const canApply = subtotal >= v.min_order_amount && 
                                        (!v.min_quantity || totalItems >= v.min_quantity);
                                    let categoryMatch = true;
                                    if (v.applicable_categories) {
                                        try {
                                            const categories = JSON.parse(v.applicable_categories);
                                            if (Array.isArray(categories) && categories.length > 0) {
                                                categoryMatch = bookCategories.some(cat => categories.includes(cat.toLowerCase()));
                                            }
                                        } catch (e) {}
                                    }
                                    return canApply && categoryMatch;
                                }).length} eligible promotions available
                            </div>
                        )}
                    </div>
                )}
                
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-base text-gray-700">
                            <p>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</p>
                            <p>${subtotal.toFixed(2)}</p>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-base text-green-600">
                                <p>Discount</p>
                                <p>-${discountAmount.toFixed(2)}</p>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                            <p>Total</p>
                            <p>${totalPrice}</p>
                        </div>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                        <Link
                            to="/checkout"
                            className={`flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${
                                cartItems.length > 0 
                                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            onClick={(e) => cartItems.length === 0 && e.preventDefault()}
                        >
                            Checkout
                        </Link>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <Link to="/">
                            or
                            <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
                            >
                                Continue Shopping
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CartPage