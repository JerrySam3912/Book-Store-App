import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { HiOutlineHeart, HiHeart, HiFire } from "react-icons/hi2"
import { useParams } from "react-router-dom"

import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
import { useAuth } from '../../context/AuthContext';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../../redux/features/wishlist/wishlistApi';
import Swal from 'sweetalert2';
import Loading from '../../components/Loading';
import BookReviews from '../../components/BookReviews';

const SingleBook = () => {
    const { id } = useParams();
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id);
    const { currentUser } = useAuth();
    const dispatch = useDispatch();
    const isAdmin = currentUser?.role === "ADMIN";

    // Wishlist hooks
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !currentUser || isAdmin, // Chỉ fetch khi user đã login và không phải admin
    });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    // Kiểm tra sách có trong wishlist không
    const isInWishlist = wishlistData?.some(item => item.book._id === book?._id);

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

    if (isLoading) return <Loading />;
    if (isError) return <div className="text-red-500 text-center py-10">Error loading book info</div>;

    return (
        <div className="max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-white">
            <div className="md:flex">
                {/* Book Image */}
                <div className="md:w-1/3 p-6 bg-gray-50">
                    <div className="relative">
                        <img
                            src={`${getImgUrl(book.coverImage)}`}
                            alt={book.title}
                            className="w-full rounded-lg shadow-md"
                        />
                        {/* Trending Badge */}
                        {book?.trending && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 z-10 shadow-lg">
                                <HiFire className="w-4 h-4" />
                                <span>TRENDING</span>
                            </div>
                        )}
                        {/* Wishlist button overlay - hidden for admin */}
                        {!isAdmin && (
                            <button
                                onClick={handleToggleWishlist}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                {isInWishlist ? (
                                    <HiHeart className="w-6 h-6 text-red-500" />
                                ) : (
                                    <HiOutlineHeart className="w-6 h-6 text-gray-600 hover:text-red-500" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Book Details */}
                <div className="md:w-2/3 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
                        {book?.trending && (
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                                <HiFire className="w-4 h-4" />
                                <span>TRENDING</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 mb-6">
                        <p className="text-gray-700">
                            <strong className="text-gray-900">Author:</strong> {book.author || 'Unknown'}
                        </p>
                        <p className="text-gray-700">
                            <strong className="text-gray-900">Published:</strong> {new Date(book?.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700 capitalize">
                            <strong className="text-gray-900">Category:</strong> 
                            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                {book?.category}
                            </span>
                        </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <span className="text-3xl font-bold text-indigo-600">${book.newPrice}</span>
                        {book.oldPrice > book.newPrice && (
                            <span className="text-xl text-gray-400 line-through ml-3">${book.oldPrice}</span>
                        )}
                        {book.oldPrice > book.newPrice && (
                            <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                Save ${(book.oldPrice - book.newPrice).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{book.description}</p>
                    </div>

                    {/* Action Buttons - hidden for admin */}
                    {!isAdmin && (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleAddToCart(book)} 
                                className="btn-primary px-8 py-3 flex items-center gap-2 text-lg"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                <span>Add to Cart</span>
                            </button>
                            
                            <button
                                onClick={handleToggleWishlist}
                                className={`px-6 py-3 rounded-md border-2 flex items-center gap-2 transition-colors ${
                                    isInWishlist 
                                        ? 'border-red-500 text-red-500 hover:bg-red-50' 
                                        : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                                }`}
                            >
                                {isInWishlist ? (
                                    <>
                                        <HiHeart className="w-5 h-5" />
                                        <span>In Wishlist</span>
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineHeart className="w-5 h-5" />
                                        <span>Add to Wishlist</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                <BookReviews bookId={book._id} />
            </div>
        </div>
    )
}

export default SingleBook