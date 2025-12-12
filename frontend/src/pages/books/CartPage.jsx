import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, incrementQuantity, decrementQuantity } from '../../redux/features/cart/cartSlice';
import { HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi2';

const CartPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    // Tính tổng tiền có tính quantity
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0).toFixed(2);
    
    // Tổng số lượng sách
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

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

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</p>
                        <p>${totalPrice ? totalPrice : 0}</p>
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