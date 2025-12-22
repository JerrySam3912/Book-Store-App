import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../../../utils/rtkQueryBaseQuery";

// ✅ FIX: Dùng baseQuery wrapper để handle banned account errors
const baseQuery = createBaseQuery("/orders");

const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // POST /api/orders
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ["Orders"],
    }),

    // GET /api/orders/email/:email
    getOrderByEmail: builder.query({
      query: (email) => `/email/${email}`,
      providesTags: ["Orders"],
    }),

    // GET /api/orders (ADMIN) - Get all orders with filters
    getAllOrders: builder.query({
      query: (params = {}) => {
        const { status, paymentStatus, page, limit, search } = params;
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);
        if (paymentStatus) queryParams.append("paymentStatus", paymentStatus);
        if (page) queryParams.append("page", page);
        if (limit) queryParams.append("limit", limit);
        if (search) queryParams.append("search", search);
        return `/?${queryParams.toString()}`;
      },
      providesTags: ["Orders"],
    }),

    // GET /api/orders/:id (ADMIN)
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Orders"],
    }),

    // PATCH /api/orders/:id/status (ADMIN)
    updateOrderStatus: builder.mutation({
      query: ({ id, status, paymentStatus }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status, paymentStatus },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetOrderByEmailQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;

export default ordersApi;
