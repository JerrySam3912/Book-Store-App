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
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';


const Recommened = () => {
    // Fetch recommended books (newest books)
    const { data } = useFetchAllBooksQuery({ limit: 10, sort: 'newest' });
    
    // Lấy books từ response
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
        </div>
    )
}

export default Recommened