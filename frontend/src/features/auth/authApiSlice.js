import { apiSlice } from "../../app/api/apiSlice";
import { logOut, setCredentials } from "./authSlice";

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
        credentials: 'include', // This is important for cookies
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
        url: "/auth/refresh",
        method: "GET",
        credentials: 'include', // This is important for cookies
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Refresh token response:", data);
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
        } catch (err) {
          console.error("Error refreshing token:", err);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApiSlice;
