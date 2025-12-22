import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/payments`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery,
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // POST /api/payments/vnpay/create-url
    // Create VNPay payment URL
    createVnpayPaymentUrl: builder.mutation({
      query: ({ orderId, amount }) => ({
        url: "/vnpay/create-url",
        method: "POST",
        body: { orderId, amount },
      }),
    }),
  }),
});

export const { useCreateVnpayPaymentUrlMutation } = paymentsApi;

export default paymentsApi;
