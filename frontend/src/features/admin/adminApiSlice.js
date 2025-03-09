import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3200/admin",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      console.log("Request Headers:", Object.fromEntries(headers.entries()));
      return headers;
    },
  }),
  tagTypes: ["AdminTasks", "AdminUsers"],
  endpoints: (builder) => ({
    getAdminTasks: builder.query({
      query: () => ({
        url: "/tasks",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminTasks"],
      transformResponse: (response) => {
        console.log("Tasks Response:", response);
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.tasks) return response.tasks;
        if (response.data) return response.data;
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("Tasks Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to fetch tasks",
        };
      },
    }),
    getAdminUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminUsers"],
      transformResponse: (response) => {
        console.log("Users Response:", response);
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response.users) return response.users;
        if (response.data) return response.data;
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("Users Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to fetch users",
        };
      },
    }),
    deleteAdminTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks"],
    }),
    updateAdminTask: builder.mutation({
      query: ({ taskId, ...update }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks"],
    }),
    createAdminTask: builder.mutation({
      query: (task) => ({
        url: "/tasks",
        method: "POST",
        body: task,
        credentials: "include",
      }),
      transformResponse: (response) => {
        console.log("Create Task Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Create Task Error:", response);
        if (response.status === 400) {
          console.error("Validation error details:", response.data);
        }
        return response;
      },
      invalidatesTags: ["AdminTasks"],
    }),
    lockAdminTask: builder.mutation({
      query: ({ taskId, locked }) => ({
        url: locked ? `/tasks/${taskId}/unlock` : `/tasks/${taskId}/lock`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks"],
    }),
  }),
});

export const {
  useGetAdminTasksQuery,
  useGetAdminUsersQuery,
  useDeleteAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useCreateAdminTaskMutation,
  useLockAdminTaskMutation,
} = adminApiSlice;
