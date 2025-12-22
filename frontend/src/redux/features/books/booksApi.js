import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/books`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery,
    tagTypes: ['Books'],
    endpoints: (builder) => ({
        // Fetch books với search, filter, pagination
        fetchAllBooks: builder.query({
            query: ({ search = "", category = "", page = 1, limit = 12, sort = "newest" } = {}) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (category) params.append('category', category);
                params.append('page', page);
                params.append('limit', limit);
                params.append('sort', sort);
                return `/?${params.toString()}`;
            },
            providesTags: ["Books"],
            // Transform response để hỗ trợ cả format cũ và mới
            transformResponse: (response) => {
                // Nếu response là array (format cũ), wrap nó
                if (Array.isArray(response)) {
                    return {
                        books: response,
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalBooks: response.length,
                            limit: response.length,
                            hasNextPage: false,
                            hasPrevPage: false,
                        }
                    };
                }
                return response;
            }
        }),
        
        // Fetch categories
        fetchCategories: builder.query({
            query: () => "/categories",
            providesTags: ["Categories"]
        }),
        
        fetchBookById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Books", id }],
        }),

        // ✅ Hybrid Recommendation API
        fetchRecommendedBooks: builder.query({
            query: () => "/recommended",
            providesTags: ["Books"],
            // Token sẽ được tự động thêm vào header nếu có trong localStorage
        }),
        
        addBook: builder.mutation({
            query: (newBook) => ({
                url: `/create-book`,
                method: "POST",
                body: newBook
            }),
            invalidatesTags: ["Books"]
        }),
        
        updateBook: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/edit/${id}`,
                method: "PUT",
                body: rest,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ["Books"]
        }),
        
        deleteBook: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Books"]
        })
    })
})

export const {
    useFetchAllBooksQuery,
    useFetchCategoriesQuery,
    useFetchBookByIdQuery,
    useFetchRecommendedBooksQuery,
    useAddBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation
} = booksApi;
export default booksApi;