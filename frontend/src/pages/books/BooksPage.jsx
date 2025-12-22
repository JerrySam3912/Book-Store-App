import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HiOutlineMagnifyingGlass, HiOutlineAdjustmentsHorizontal, HiOutlineXMark, HiOutlineHeart, HiHeart, HiFire } from 'react-icons/hi2'
import { FiShoppingCart } from 'react-icons/fi'
import { useFetchAllBooksQuery, useFetchCategoriesQuery } from '../../redux/features/books/booksApi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { useAuth } from '../../context/AuthContext'
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../../redux/features/wishlist/wishlistApi'
import { getImgUrl } from '../../utils/getImgUrl'
import { BookGridSkeleton } from '../../components/LoadingSkeleton'
import Swal from 'sweetalert2'

// Grid Book Card Component - Optimized for grid layout
const GridBookCard = ({ book, isInWishlist, onToggleWishlist, onAddToCart, isAdmin = false }) => {
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <Link to={`/books/${book._id}`}>
                    <img
                        src={getImgUrl(book?.coverImage)}
                        alt={book?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
                {/* Trending Badge */}
                {book?.trending && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 z-10 shadow-lg">
                        <HiFire className="w-3 h-3" />
                        <span>TRENDING</span>
                    </div>
                )}
                {/* Wishlist Button - hidden for admin */}
                {!isAdmin && (
                    <button
                        onClick={() => onToggleWishlist(book)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                        {isInWishlist ? (
                            <HiHeart className="w-5 h-5 text-red-500" />
                        ) : (
                            <HiOutlineHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                        )}
                    </button>
                )}
                {/* Quick Add to Cart - shows on hover - hidden for admin */}
                {!isAdmin && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onAddToCart(book)}
                            className="w-full py-2 bg-white text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </button>
                    </div>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4">
                <Link to={`/books/${book._id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                        {book?.title}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {book?.description}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-indigo-600">${book?.newPrice}</span>
                        {book?.oldPrice > book?.newPrice && (
                            <span className="text-sm text-gray-400 line-through">${book?.oldPrice}</span>
                        )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                        {book?.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange }) => {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={`px-4 py-2 rounded-md ${
                    hasPrevPage 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors`}
            >
                Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-md ${
                            page === currentPage
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } transition-colors`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`px-4 py-2 rounded-md ${
                    hasNextPage 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors`}
            >
                Next
            </button>
        </div>
    );
};

const BooksPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === "ADMIN";

    // Get params from URL
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'newest';

    // Local state for search input
    const [searchInput, setSearchInput] = useState(search);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch data
    const { data, isLoading, isError } = useFetchAllBooksQuery({
        search,
        category,
        page,
        limit: 12,
        sort,
    });

    const { data: categories = [] } = useFetchCategoriesQuery();

    // Wishlist hooks
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !currentUser || isAdmin, // Chỉ fetch khi user đã login và không phải admin
    });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    // Check if book is in wishlist
    const isBookInWishlist = (bookId) => {
        return wishlistData?.some(item => item.book._id === bookId);
    };

    // Handle add to cart
    const handleAddToCart = (book) => {
        dispatch(addToCart(book));
    };

    // Handle wishlist toggle
    const handleToggleWishlist = async (book) => {
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
            if (isBookInWishlist(book._id)) {
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
    };

    // Update URL params
    const updateParams = (newParams) => {
        const params = new URLSearchParams(searchParams);
        
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 if search/category/sort changes
        if (newParams.search !== undefined || newParams.category !== undefined || newParams.sort !== undefined) {
            params.set('page', '1');
        }

        setSearchParams(params);
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        updateParams({ search: searchInput });
    };

    // Handle category change
    const handleCategoryChange = (newCategory) => {
        updateParams({ category: newCategory === 'all' ? '' : newCategory });
    };

    // Handle sort change
    const handleSortChange = (newSort) => {
        updateParams({ sort: newSort });
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchInput('');
        setSearchParams({});
    };

    // Check if any filter is active
    const hasActiveFilters = search || category || sort !== 'newest';

    if (isLoading) return <BookGridSkeleton count={12} />;
    if (isError) return <div className="text-center py-10 text-red-500">Error loading books</div>;

    const { books = [], pagination = {} } = data || {};

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Books</h1>
                <p className="text-gray-600">
                    {pagination.totalBooks 
                        ? `Found ${pagination.totalBooks} books`
                        : 'Explore our collection'}
                </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search books by title, description, author..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        updateParams({ search: '' });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <HiOutlineXMark className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Filter Toggle Button (Mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
                        Filters
                    </button>

                    {/* Category Filter (Desktop) */}
                    <select
                        value={category || 'all'}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="hidden md:block px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat} className="capitalize">
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Sort Filter (Desktop) */}
                    <select
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="hidden md:block px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="title">Title: A-Z</option>
                    </select>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                    <div className="md:hidden mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                        <select
                            value={category || 'all'}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat} className="capitalize">
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="title">Title: A-Z</option>
                        </select>
                    </div>
                )}

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        
                        {search && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                Search: "{search}"
                                <button onClick={() => { setSearchInput(''); updateParams({ search: '' }); }}>
                                    <HiOutlineXMark className="w-4 h-4" />
                                </button>
                            </span>
                        )}
                        
                        {category && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                                {category}
                                <button onClick={() => updateParams({ category: '' })}>
                                    <HiOutlineXMark className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {sort !== 'newest' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                Sort: {sort.replace('_', ' ')}
                                <button onClick={() => updateParams({ sort: 'newest' })}>
                                    <HiOutlineXMark className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-600 hover:text-red-700 ml-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Results */}
            {books.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <HiOutlineMagnifyingGlass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No books found</h3>
                    <p className="text-gray-500 mb-4">
                        Try adjusting your search or filter criteria
                    </p>
                    <button
                        onClick={clearFilters}
                        className="btn-primary px-6 py-2"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Books Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {books.map((book) => (
                            <GridBookCard 
                                key={book._id} 
                                book={book}
                                isInWishlist={isBookInWishlist(book._id)}
                                onToggleWishlist={handleToggleWishlist}
                                onAddToCart={handleAddToCart}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination 
                        pagination={pagination} 
                        onPageChange={handlePageChange}
                    />

                    {/* Results info */}
                    <div className="text-center text-gray-500 text-sm mt-4">
                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalBooks)} of {pagination.totalBooks} books
                    </div>
                </>
            )}
        </div>
    );
};

export default BooksPage;

