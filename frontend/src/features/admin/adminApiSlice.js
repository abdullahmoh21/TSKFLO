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
  tagTypes: ["AdminTasks", "AdminUsers", "Metrics"],
  endpoints: (builder) => ({
    getAdminTasks: builder.query({
      query: (params = {}) => ({
        url: "/tasks",
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 8,
        },
        credentials: "include",
      }),
      providesTags: ["AdminTasks"],
      transformResponse: (response) => {
        console.log("Tasks Response:", response);
        if (!response)
          return {
            tasks: [],
            pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 },
          };

        // If response contains tasks and pagination metadata (from backend)
        if (response.tasks) {
          return {
            tasks: response.tasks,
            pagination: {
              totalTasks: response.totalTasks || 0,
              currentPage: response.currentPage || 1,
              totalPages: response.totalPages || 1,
            },
          };
        }

        // For backward compatibility if the response is an array
        if (Array.isArray(response)) {
          return {
            tasks: response,
            pagination: {
              totalTasks: response.length,
              currentPage: 1,
              totalPages: 1,
            },
          };
        }

        // For other response formats
        if (response.data) {
          return {
            tasks: response.data,
            pagination: {
              totalTasks: response.data.length,
              currentPage: 1,
              totalPages: 1,
            },
          };
        }

        return {
          tasks: [],
          pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 },
        };
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
    searchUsers: builder.query({
      query: (text) => ({
        url: `/users?search=${encodeURIComponent(text)}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        console.log("Search Users Response:", response);
        // Handle the response based on the structure
        if (!response) return { users: [] };
        if (response.users) return response;

        // If the response is an array, wrap it in a users property
        if (Array.isArray(response)) {
          return { users: response };
        }

        return { users: [] };
      },
    }),
    deleteAdminTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    updateAdminTask: builder.mutation({
      query: ({ taskId, ...update }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...update }) => ({
        url: `/users/${userId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers", "Metrics"],
    }),
    inviteUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    createAdminTask: builder.mutation({
      query: (task) => ({
        url: "/tasks",
        method: "POST",
        body: task,
        credentials: "include",
        responseHandler: (response) => {
          // For this specific endpoint, don't try to parse as JSON if it's just "OK"
          if (response.status === 200) {
            return { success: true, message: "Task created successfully" };
          }
          return response.json().catch(() => {
            return { success: true, message: "Task created successfully" };
          });
        },
      }),
      transformErrorResponse: (response) => {
        console.error("Create Task Error:", response);
        if (response.status === 400) {
          console.error("Validation error details:", response.data);
        }
        return response;
      },
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    lockAdminTask: builder.mutation({
      query: ({ taskId, locked }) => ({
        url: locked ? `/tasks/${taskId}/unlock` : `/tasks/${taskId}/lock`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    getMetrics: builder.query({
      query: (text) => ({
        url: `/metrics`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Metrics"],
    }),
  }),
});

export const {
  useGetAdminTasksQuery,
  useGetAdminUsersQuery,
  useSearchUsersQuery,
  useDeleteAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useInviteUserMutation,
  useLockAdminTaskMutation,
  useCreateAdminTaskMutation,
  useGetMetricsQuery,
} = adminApiSlice;
