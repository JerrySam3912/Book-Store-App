// src/redux/features/analytics/analyticsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query({
      query: () => '/admin/analytics/summary',
      providesTags: ['Analytics'],
    }),
    getSalesByCategory: builder.query({
      query: () => '/admin/analytics/sales-by-category',
      providesTags: ['Analytics'],
    }),
    getRevenueTrends: builder.query({
      query: () => '/admin/analytics/revenue-trends',
      providesTags: ['Analytics'],
    }),
    getUserGrowth: builder.query({
      query: () => '/admin/analytics/user-growth',
      providesTags: ['Analytics'],
    }),
    getOrderStatusDistribution: builder.query({
      query: () => '/admin/analytics/order-status-distribution',
      providesTags: ['Analytics'],
    }),
    getTopCustomers: builder.query({
      query: (limit = 10) => `/admin/analytics/top-customers?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    getTopSellingBooks: builder.query({
      query: (limit = 10) => `/admin/analytics/top-selling-books?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetAnalyticsSummaryQuery,
  useGetSalesByCategoryQuery,
  useGetRevenueTrendsQuery,
  useGetUserGrowthQuery,
  useGetOrderStatusDistributionQuery,
  useGetTopCustomersQuery,
  useGetTopSellingBooksQuery,
} = analyticsApi;

export default analyticsApi;

