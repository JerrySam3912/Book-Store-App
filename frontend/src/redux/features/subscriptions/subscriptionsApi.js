// src/redux/features/subscriptions/subscriptionsApi.js
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

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery,
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    subscribe: builder.mutation({
      query: ({ email, name }) => ({
        url: '/subscriptions',
        method: 'POST',
        body: { email, name },
      }),
      invalidatesTags: ['Subscription'],
    }),
    unsubscribe: builder.mutation({
      query: (email) => ({
        url: '/subscriptions/unsubscribe',
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Subscription'],
    }),
    checkSubscription: builder.query({
      query: (email) => `/subscriptions/check?email=${email}`,
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useCheckSubscriptionQuery,
} = subscriptionsApi;

export default subscriptionsApi;

