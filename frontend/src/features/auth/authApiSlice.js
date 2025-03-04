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
    Logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(queryFulfilled);
          dispatch(logOut()); //token = null
          dispatch(apiSlice.util.resetApiState());
        } catch (err) {
          console.log(err);
        }
      },
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(data);
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
        } catch (err) {
          console.log(err);
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
