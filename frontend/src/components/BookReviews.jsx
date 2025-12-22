import React, { useState } from 'react'
import { HiStar, HiOutlineStar, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import { useGetBookReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } from '../redux/features/reviews/reviewsApi'
import Swal from 'sweetalert2'

// Star Rating Component
const StarRating = ({ rating, onRatingChange, interactive = false, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => interactive && onRatingChange?.(star)}
                    className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                    disabled={!interactive}
                >
                    {star <= rating ? (
                        <HiStar className={`${sizeClass} text-yellow-400`} />
                    ) : (
                        <HiOutlineStar className={`${sizeClass} text-gray-300`} />
                    )}
                </button>
            ))}
        </div>
    );
};

// Review Form Component
const ReviewForm = ({ bookId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [createReview, { isLoading }] = useCreateReviewMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            Swal.fire({
                title: "Rating Required",
                text: "Please select a rating",
                icon: "warning",
                confirmButtonText: "OK"
            });
            return;
        }

        try {
            await createReview({ bookId, rating, comment }).unwrap();
            setRating(0);
            setComment('');
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Review submitted!",
                showConfirmButton: false,
                timer: 1500
            });
            onSuccess?.();
        } catch (error) {
            if (error.data?.message === "You have already reviewed this book") {
                Swal.fire({
                    title: "Already Reviewed",
                    text: "You have already reviewed this book",
                    icon: "info",
                    confirmButtonText: "OK"
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to submit review",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Write a Review</h4>
            
            <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Your Rating *</label>
                <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
            </div>

            <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Your Review (optional)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || rating === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

// Single Review Item Component
const ReviewItem = ({ review, currentUserId, bookId }) => {
    const [deleteReview] = useDeleteReviewMutation();
    const isOwner = currentUserId === review.userId;

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Delete Review?",
            text: "Are you sure you want to delete your review?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                await deleteReview({ reviewId: review.id, bookId }).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Review deleted",
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch {
                Swal.fire({
                    title: "Error",
                    text: "Failed to delete review",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        }
    };

    return (
        <div className="border-b border-gray-200 py-4 last:border-0">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                            {review.userName?.charAt(0)?.toUpperCase() || review.userEmail?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">
                            {review.userName || review.userEmail?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete review"
                        >
                            <HiOutlineTrash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            
            {review.comment && (
                <p className="mt-3 text-gray-600 pl-13">{review.comment}</p>
            )}
        </div>
    );
};

// Main BookReviews Component
const BookReviews = ({ bookId }) => {
    const { currentUser } = useAuth();
    const { data, isLoading, isError } = useGetBookReviewsQuery(bookId);

    // Kiểm tra xem user đã review chưa
    const hasUserReviewed = data?.reviews?.some(r => r.userId === currentUser?.id);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (isError) {
        return <p className="text-red-500">Error loading reviews</p>;
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
                {data?.totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(data.averageRating)} />
                        <span className="text-lg font-medium text-gray-700">
                            {data.averageRating}
                        </span>
                        <span className="text-gray-500">
                            ({data.totalReviews} {data.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                )}
            </div>

            {/* Review Form - chỉ hiện khi user đăng nhập và chưa review */}
            {currentUser && !hasUserReviewed && (
                <ReviewForm bookId={bookId} />
            )}

            {/* Hiển thị thông báo nếu chưa đăng nhập */}
            {!currentUser && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-gray-600">
                        Please <a href="/login" className="text-indigo-600 hover:underline">login</a> to write a review
                    </p>
                </div>
            )}

            {/* Hiển thị thông báo nếu đã review */}
            {currentUser && hasUserReviewed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                    <p className="text-green-700">You have already reviewed this book</p>
                </div>
            )}

            {/* Reviews List */}
            {data?.reviews?.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg">
                    {data?.reviews?.map((review) => (
                        <ReviewItem 
                            key={review.id} 
                            review={review} 
                            currentUserId={currentUser?.id}
                            bookId={bookId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookReviews;


