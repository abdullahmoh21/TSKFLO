import { apiSlice } from "../../app/api/apiSlice";

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyData: builder.query({
      query: () => ({
        url: "/user",
        method: "GET",
        credentials: "include",
      }),
      providesTags: [{ type: "User" }],
    }),
    updateMyData: builder.mutation({
      query: (updates) => ({
        url: "/user",
        method: "PATCH",
        body: updates,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "User" }],
    }),
    searchUsers: builder.query({
      query: (text) => ({
        url: `/user/search?query=${encodeURIComponent(text)}`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetMyDataQuery,
  useUpdateMyDataMutation,
  useSearchUsersQuery,
} = messageApiSlice;