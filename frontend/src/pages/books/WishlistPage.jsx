import React from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineHeart, HiHeart, HiOutlineTrash } from 'react-icons/hi2'
import { FiShoppingCart } from 'react-icons/fi'
import { useDispatch } from 'react-redux'

import { getImgUrl } from '../../utils/getImgUrl'
import { useAuth } from '../../context/AuthContext'
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../redux/features/wishlist/wishlistApi'
import { addToCart } from '../../redux/features/cart/cartSlice'
import Loading from '../../components/Loading'
import Swal from 'sweetalert2'

const WishlistPage = () => {
    const { currentUser } = useAuth();
    const dispatch = useDispatch();
    
    const { data: wishlistItems, isLoading, isError } = useGetWishlistQuery(undefined, {
        skip: !currentUser,
    });
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const handleRemoveFromWishlist = async (bookId) => {
        try {
            await removeFromWishlist(bookId).unwrap();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Removed from Wishlist",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Error removing from wishlist:", error);
        }
    }

    // Removed unused handleAddToCart function

    const handleMoveToCart = async (item) => {
        dispatch(addToCart(item.book));
        await removeFromWishlist(item.book._id).unwrap();
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <HiOutlineHeart className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your Wishlist</h2>
                <p className="text-gray-500 mb-4">Please login to view your wishlist</p>
                <Link to="/login" className="btn-primary px-6 py-2">
                    Login
                </Link>
            </div>
        );
    }

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-500">Error loading wishlist. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <HiHeart className="w-8 h-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
                {wishlistItems?.length > 0 && (
                    <span className="text-gray-500">({wishlistItems.length} items)</span>
                )}
            </div>

            {wishlistItems?.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <HiOutlineHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">Start adding books you love!</p>
                    <Link to="/" className="btn-primary px-6 py-2">
                        Browse Books
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {wishlistItems.map((item) => (
                        <div 
                            key={item.wishlistId} 
                            className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            {/* Book Image */}
                            <div className="w-24 h-32 flex-shrink-0">
                                <Link to={`/books/${item.book._id}`}>
                                    <img
                                        src={getImgUrl(item.book.coverImage)}
                                        alt={item.book.title}
                                        className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform"
                                    />
                                </Link>
                            </div>

                            {/* Book Info */}
                            <div className="flex-1">
                                <Link to={`/books/${item.book._id}`}>
                                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                                        {item.book.title}
                                    </h3>
                                </Link>
                                <p className="text-sm text-gray-500 mt-1 capitalize">
                                    {item.book.category}
                                </p>
                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                    {item.book.description}
                                </p>
                                <div className="mt-2">
                                    <span className="text-lg font-bold text-indigo-600">
                                        ${item.book.newPrice}
                                    </span>
                                    {item.book.oldPrice > item.book.newPrice && (
                                        <span className="text-sm text-gray-400 line-through ml-2">
                                            ${item.book.oldPrice}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 justify-end">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                >
                                    <FiShoppingCart className="w-4 h-4" />
                                    <span className="hidden sm:inline">Move to Cart</span>
                                </button>
                                <button
                                    onClick={() => handleRemoveFromWishlist(item.book._id)}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors text-sm"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default WishlistPage


