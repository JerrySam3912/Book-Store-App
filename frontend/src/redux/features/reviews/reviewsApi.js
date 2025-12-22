import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/reviews`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery,
  tagTypes: ["Reviews"],
  endpoints: (builder) => ({
    // GET /api/reviews/book/:bookId - Lấy reviews của 1 sách
    getBookReviews: builder.query({
      query: (bookId) => `/book/${bookId}`,
      providesTags: (result, error, bookId) => [{ type: "Reviews", id: bookId }],
    }),

    // POST /api/reviews - Tạo review mới
    createReview: builder.mutation({
      query: ({ bookId, rating, comment }) => ({
        url: "/",
        method: "POST",
        body: { bookId, rating, comment },
      }),
      invalidatesTags: (result, error, { bookId }) => [{ type: "Reviews", id: bookId }],
    }),

    // PUT /api/reviews/:reviewId - Cập nhật review
    updateReview: builder.mutation({
      query: ({ reviewId, rating, comment }) => ({
        url: `/${reviewId}`,
        method: "PUT",
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, { bookId }) => [{ type: "Reviews", id: bookId }],
    }),

    // DELETE /api/reviews/:reviewId - Xóa review
    deleteReview: builder.mutation({
      query: ({ reviewId }) => ({
        url: `/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { bookId }) => [{ type: "Reviews", id: bookId }],
    }),

    // GET /api/reviews/user/:userId - Lấy reviews của 1 user
    getUserReviews: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetBookReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetUserReviewsQuery,
} = reviewsApi;

export default reviewsApi;


