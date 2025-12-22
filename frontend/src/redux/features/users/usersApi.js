import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/users`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // GET /api/users/profile
    getUserProfile: builder.query({
      query: () => "/profile",
      providesTags: ["User"],
    }),

    // PUT /api/users/profile
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // PATCH /api/users/change-password
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // GET /api/users (ADMIN) - Get all users with filters
    getAllUsers: builder.query({
      query: (params = {}) => {
        const { role, search, page, limit, isActive } = params;
        const queryParams = new URLSearchParams();
        if (role) queryParams.append("role", role);
        if (search) queryParams.append("search", search);
        if (page) queryParams.append("page", page);
        if (limit) queryParams.append("limit", limit);
        if (isActive !== undefined) queryParams.append("isActive", isActive);
        return `/?${queryParams.toString()}`;
      },
      providesTags: ["User"],
    }),

    // GET /api/users/:id (ADMIN)
    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["User"],
    }),

    // PUT /api/users/:id (ADMIN)
    updateUserByAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // PATCH /api/users/:id/status (ADMIN)
    updateUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByAdminMutation,
  useUpdateUserStatusMutation,
} = usersApi;

export default usersApi;

