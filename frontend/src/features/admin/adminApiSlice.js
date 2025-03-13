import { apiSlice } from "../../app/api/apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminTasks: builder.query({
      query: (params = { page: 1, limit: 10 }) => ({
        url: "/admin/tasks",
        method: "GET",
        credentials: "include",
        params: params,
      }),
      providesTags: ["AdminTasks"],
      transformResponse: (response) => {
        console.log("Tasks Response:", response);
        if (!response) return { tasks: [], pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 } };
        
        // Return both the tasks and pagination info
        if (response.tasks) {
          return {
            tasks: response.tasks,
            pagination: {
              totalTasks: response.totalTasks || 0,
              currentPage: response.currentPage || 1,
              totalPages: response.totalPages || 1
            }
          };
        }
        
        if (Array.isArray(response)) {
          return { 
            tasks: response,
            pagination: { totalTasks: response.length, currentPage: 1, totalPages: 1 }
          };
        }
        
        return { 
          tasks: [],
          pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 }
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
        url: "/admin/users",
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
    updateAdminUser: builder.mutation({
      query: ({ userId, ...update }) => ({
        url: `/admin/users/${userId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers"],
      transformResponse: (response) => {
        console.log("Update User Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Update User Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to update user",
        };
      },
    }),
    deleteAdminUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers"],
      transformResponse: (response) => {
        console.log("Delete User Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Delete User Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to delete user",
        };
      },
    }),
    deleteAdminTask: builder.mutation({
      query: (taskId) => ({
        url: `/admin/tasks/${taskId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks"],
    }),
    updateAdminTask: builder.mutation({
      query: ({ taskId, ...update }) => ({
        url: `/admin/tasks/${taskId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks"],
    }),
    createAdminTask: builder.mutation({
      query: (task) => ({
        url: "/admin/tasks",
        method: "POST",
        body: task,
        credentials: "include",
        responseHandler: (response) => {
          // Handle both JSON and text responses
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json().catch(() => ({}));
          }
          return response.text().then(text => ({ message: text }));
        },
      }),
      transformResponse: (response) => {
        console.log("Create Task Response:", response);
        // If the response is just "OK" or other text, create a success object
        if (typeof response === 'string' || response.message === "OK") {
          return { success: true, message: "Task created successfully" };
        }
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
        url: `/admin/tasks/${taskId}/lock`,
        method: "PATCH",
        body: { locked },
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
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminApiSlice;
