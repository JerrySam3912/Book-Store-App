import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/wishlist`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced baseQuery để handle 401 errors gracefully
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Check token trước khi gọi API
  const token = localStorage.getItem("token");
  if (!token) {
    // Không có token, không gọi API (user chưa login)
    // Return empty result để tránh 401 error
    return { data: undefined };
  }
  
  let result = await baseQuery(args, api, extraOptions);
  
  // Nếu vẫn có lỗi 401 (token expired hoặc invalid), return empty result
  if (result.error && result.error.status === 401) {
    return { data: undefined };
  }
  
  return result;
};

const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    // GET /api/wishlist - Lấy danh sách wishlist
    getWishlist: builder.query({
      query: () => "/",
      providesTags: ["Wishlist"],
    }),

    // POST /api/wishlist - Thêm sách vào wishlist
    addToWishlist: builder.mutation({
      query: (bookId) => ({
        url: "/",
        method: "POST",
        body: { bookId },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // DELETE /api/wishlist/:bookId - Xóa sách khỏi wishlist
    removeFromWishlist: builder.mutation({
      query: (bookId) => ({
        url: `/${bookId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // GET /api/wishlist/check/:bookId - Kiểm tra sách có trong wishlist không
    checkWishlist: builder.query({
      query: (bookId) => `/check/${bookId}`,
      providesTags: (result, error, bookId) => [
        { type: "Wishlist", id: bookId },
      ],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCheckWishlistQuery,
} = wishlistApi;

export default wishlistApi;


