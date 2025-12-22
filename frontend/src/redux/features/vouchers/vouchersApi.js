import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/vouchers`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

export const vouchersApi = createApi({
    reducerPath: 'vouchersApi',
    baseQuery,
    tagTypes: ['Vouchers'],
    endpoints: (builder) => ({
        // Lấy danh sách voucher có sẵn
        getAvailableVouchers: builder.query({
            query: () => '/',
            providesTags: ['Vouchers']
        }),
        
        // Validate voucher code
        validateVoucher: builder.mutation({
            query: ({ code, orderTotal, itemCount, bookCategories }) => ({
                url: '/validate',
                method: 'POST',
                body: { code, orderTotal, itemCount, bookCategories }
            })
        })
    })
})

export const {
    useGetAvailableVouchersQuery,
    useValidateVoucherMutation
} = vouchersApi

export default vouchersApi
