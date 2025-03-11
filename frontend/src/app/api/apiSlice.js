import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3200", // production: change to domain
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Check localStorage for token on initial load
  const state = api.getState();
  if (!state.auth.token) {
    const persistedToken = localStorage.getItem('token');
    if (persistedToken) {
      api.dispatch(setCredentials({ accessToken: persistedToken }));
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 and 403 status codes for token expiration
  if (result?.error?.status === 401 || result?.error?.status === 403) {
    console.log("Token expired, attempting refresh...");

    // Send refresh token to get new access token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

    if (refreshResult?.data?.accessToken) {
      console.log("Token refresh successful");
      
      // Store the new token
      const accessToken = refreshResult.data.accessToken;
      api.dispatch(setCredentials({ accessToken }));
      
      // Save to localStorage
      localStorage.setItem('token', accessToken);

      // Retry original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh token failed - logging out");
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Log the user out on failed refresh
      api.dispatch(logOut());
      
      // Update error message for better UX
      if (result.error) {
        result.error.data = result.error.data || {};
        result.error.data.message = "Your session has expired. Please login again.";
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task", "User"],
  endpoints: (builder) => ({}),
});
