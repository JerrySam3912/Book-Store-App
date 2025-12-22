import React from 'react'
import { Link } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../books/BookCard';
import { useFetchRecommendedBooksQuery } from '../../redux/features/books/booksApi';

const Recommened = () => {
    // ✅ Hybrid Recommendation: Backend sẽ tự động:
    // - User chưa login → Trending + High Rating
    // - User đã login, có lịch sử → 70% Category-based + 30% Trending
    // - User đã login, chưa có lịch sử → Trending + High Rating
    const { data, isLoading, isError } = useFetchRecommendedBooksQuery();
    
    const books = data?.books || [];

    return (
        <div className='py-16'>
            <div className="flex items-center justify-between mb-6">
                <h2 className='text-3xl font-semibold'>Recommended for you</h2>
                <Link 
                    to="/books" 
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                    View All →
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">
                    Loading recommended books...
                </div>
            ) : isError ? (
                <div className="text-center py-10 text-red-500">
                    Failed to load recommended books
                </div>
            ) : (
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
                            No books found
                        </div>
                    )}
                </Swiper>
            )}
        </div>
    )
}

export default Recommened