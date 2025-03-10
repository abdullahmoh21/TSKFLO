import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3200/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (page = 1) => ({
        url: "/user/all",
        method: "GET",
        params: { page },
        credentials: "include",
      }),
      transformResponse: (response) => {
        console.log("Users Response:", response);
        if (!response) return { users: [], totalPages: 0 };
        if (Array.isArray(response)) return { users: response, totalPages: 1 };
        if (response.users) return response;
        return { users: [], totalPages: 0 };
      },
    }),
  }),
});

export const { useGetAllUsersQuery } = userApiSlice;
