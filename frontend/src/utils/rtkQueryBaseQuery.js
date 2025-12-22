// Shared baseQuery wrapper để handle banned account errors cho RTK Query
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "./baseURL";
import { handleBannedAccountError } from "./rtkQueryErrorHandler";

/**
 * Create baseQuery với error handling cho banned accounts
 */
export const createBaseQuery = (basePath) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api${basePath}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  // Wrap baseQuery để handle banned account errors
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Check nếu error là banned account
    if (result.error) {
      const handled = handleBannedAccountError(result.error);
      if (handled) {
        // Return error nhưng đã handle logout/redirect
        return result;
      }
    }
    
    return result;
  };
};
