import { apiSlice } from "../../app/api/apiSlice";
import { logOut, setCredentials, setUserData } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        // Validation
        if (!credentials.email || !credentials.password) {
          throw new Error("Both email and password fields are required");
        }

        return {
          url: "/auth",
          method: "POST",
          body: { ...credentials },
        };
      },
    }),
    register: builder.mutation({
      query: (initialUserData) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          ...initialUserData,
        },
      }),
      invalidatesTags: [{ type: "User" }],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: 'include',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log("Logout API response in slice:", result);
          // Clear the auth state
          dispatch(logOut());
          // Reset all api state (clear cache/queries)
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 0);
        } catch (err) {
          console.error("Error in logout mutation:", err);
        }
      },
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "auth/refresh",
        method: "GET",
        credentials: 'include', // This is important for cookies
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Refresh token response:", data);
          if (data && data.accessToken) {
            dispatch(setCredentials({ accessToken: data.accessToken }));
            return true;
          } else {
            console.log("No access token in refresh response");
            return false;
          }
        } catch (err) {
          console.error("Error refreshing token:", err);
          // Handle token refresh failure - only log out if it's a 401/403 error
          if (err?.error?.status === 401 || err?.error?.status === 403) {
            console.log("Refresh token expired, logging out");
            dispatch(logOut());
          }
          return false;
        }
      },
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: 'users',
        method: 'GET',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserData(data));
        } catch (err) {
          console.log('Error fetching user data:', err);
        }
      },
      providesTags: ['UserProfile'],
    }),
    // New endpoint to get all users for task assignment
    getUsers: builder.query({
      query: () => ({
        url: 'users/all',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetUserProfileQuery,
  useGetUsersQuery,
} = authApiSlice;
