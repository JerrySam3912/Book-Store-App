import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import BookCard from '../books/BookCard';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery, useFetchCategoriesQuery } from '../../redux/features/books/booksApi';

const TopSellers = () => {
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Fetch books với category filter nếu có
    const { data } = useFetchAllBooksQuery({
        category: selectedCategory === "all" ? "" : selectedCategory,
        limit: 20,
    });
    
    // Fetch categories từ API
    const { data: categoriesFromApi = [] } = useFetchCategoriesQuery();

    // Lấy books từ response (API mới trả về { books: [], pagination: {} })
    const books = data?.books || [];
    
    // Tạo array categories với "All" ở đầu
    const categories = ["all", ...categoriesFromApi];

    return (
        <div className='py-10'>
            <div className="flex items-center justify-between mb-6">
                <h2 className='text-3xl font-semibold'>Top Sellers</h2>
                <Link 
                    to="/books" 
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                    View All →
                </Link>
            </div>
            
            {/* category filtering */}
            <div className='mb-8 flex items-center gap-4 flex-wrap'>
                {categories.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                navigation={true}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 40,
                    },
                    1024: {
                        slidesPerView: 2,
                        spaceBetween: 50,
                    },
                    1180: {
                        slidesPerView: 3,
                        spaceBetween: 50,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {books.length > 0 ? (
                    books.map((book, index) => (
                        <SwiperSlide key={book._id || index}>
                            <BookCard book={book} />
                        </SwiperSlide>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No books found in this category
                    </div>
                )}
            </Swiper>
        </div>
    )
}

export default TopSellers