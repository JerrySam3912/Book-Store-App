import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/addresses`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

const addressesApi = createApi({
    reducerPath: 'addressesApi',
    baseQuery,
    tagTypes: ['Addresses'],
    endpoints: (builder) => ({
        // Get all addresses của user
        getAddresses: builder.query({
            query: () => "/",
            providesTags: ["Addresses"]
        }),

        // Get 1 address by ID
        getAddressById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Addresses", id }],
        }),

        // Create new address
        createAddress: builder.mutation({
            query: (newAddress) => ({
                url: "/",
                method: "POST",
                body: newAddress
            }),
            invalidatesTags: ["Addresses"]
        }),

        // Update address
        updateAddress: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/${id}`,
                method: "PUT",
                body: rest
            }),
            invalidatesTags: ["Addresses"]
        }),

        // Delete address
        deleteAddress: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Addresses"]
        }),

        // Set default address
        setDefaultAddress: builder.mutation({
            query: (id) => ({
                url: `/${id}/set-default`,
                method: "PATCH"
            }),
            invalidatesTags: ["Addresses"]
        })
    })
})

export const {
    useGetAddressesQuery,
    useGetAddressByIdQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation
} = addressesApi;
export default addressesApi;

