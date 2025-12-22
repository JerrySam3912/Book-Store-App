import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { HiOutlineHeart, HiHeart, HiFire } from 'react-icons/hi2'
import { getImgUrl } from '../../utils/getImgUrl'

import { Link } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { useAuth } from '../../context/AuthContext'
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../../redux/features/wishlist/wishlistApi'
import Swal from 'sweetalert2'

const BookCard = ({ book }) => {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === "ADMIN";
    
    // Wishlist hooks
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !currentUser || isAdmin, // Chỉ fetch khi user đã login và không phải admin
    });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    // Kiểm tra sách có trong wishlist không
    const isInWishlist = wishlistData?.some(item => item.book._id === book._id);

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    }

    const handleToggleWishlist = async () => {
        if (!currentUser) {
            Swal.fire({
                title: "Login Required",
                text: "Please login to add items to wishlist",
                icon: "info",
                confirmButtonText: "OK"
            });
            return;
        }

        try {
            if (isInWishlist) {
                await removeFromWishlist(book._id).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Removed from Wishlist",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await addToWishlist(book._id).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Added to Wishlist",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    }

    return (
        <div className="rounded-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:h-72 sm:justify-center gap-4">
                <div className="sm:h-72 sm:flex-shrink-0 border rounded-md relative">
                    <Link to={`/books/${book._id}`}>
                        <img
                            src={`${getImgUrl(book?.coverImage)}`}
                            alt={book?.title}
                            className="w-full bg-cover p-2 rounded-md cursor-pointer hover:scale-105 transition-all duration-200"
                        />
                    </Link>
                    {/* Trending Badge */}
                    {book?.trending && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 z-10 shadow-lg animate-pulse">
                            <HiFire className="w-3 h-3" />
                            <span>TRENDING</span>
                        </div>
                    )}
                    {/* Wishlist button - hidden for admin */}
                    {!isAdmin && (
                        <button
                            onClick={handleToggleWishlist}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            {isInWishlist ? (
                                <HiHeart className="w-5 h-5 text-red-500" />
                            ) : (
                                <HiOutlineHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                            )}
                        </button>
                    )}
                </div>

                <div>
                    <Link to={`/books/${book._id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-3">
                            {book?.title}
                        </h3>
                    </Link>
                    <p className="text-gray-600 mb-5">
                        {book?.description?.length > 80 ? `${book.description.slice(0, 80)}...` : book?.description}
                    </p>
                    <p className="font-medium mb-5">
                        ${book?.newPrice} <span className="line-through font-normal ml-2">$ {book?.oldPrice}</span>
                    </p>
                    {/* Add to Cart button - hidden for admin */}
                    {!isAdmin && (
                        <button
                            onClick={() => handleAddToCart(book)}
                            className="btn-primary px-6 space-x-1 flex items-center gap-1"
                        >
                            <FiShoppingCart />
                            <span>Add to Cart</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookCard