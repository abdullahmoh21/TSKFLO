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
    Logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logOut()); //token = null
          dispatch(apiSlice.util.resetApiState());
        } catch (err) {
          console.log(err);
        }
      },
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "auth/refresh",
        method: "GET",
        credentials: 'include',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.accessToken) {
            console.log("Refresh token success:", data);
            dispatch(setCredentials({ accessToken: data.accessToken }));
            return true;
          } else {
            console.log("No access token in refresh response");
            return false;
          }
        } catch (err) {
          console.log("Token refresh failed:", err);
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetUserProfileQuery,
} = authApiSlice;
