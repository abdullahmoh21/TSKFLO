import { apiSlice } from "../../app/api/apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params = {}) => {
        // Convert parameters to URL query string format
        const queryParams = new URLSearchParams();

        // Add pagination parameters
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        // Add filter parameters
        if (params.status) queryParams.append("status", params.status);
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.taskRelation)
          queryParams.append("taskRelation", params.taskRelation);
        if (params.hideCompleted)
          queryParams.append("hideCompleted", params.hideCompleted);

        // Return the URL with query parameters
        return `tasks?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result && result.tasks
          ? [
              ...result.tasks.map(({ _id }) => ({ type: "Task", id: _id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    // Add a new query for fetching task metrics
    getTaskMetrics: builder.query({
      query: () => "tasks/metrics",
      providesTags: ["TaskMetrics"],
    }),

    createTask: builder.mutation({
      query: (taskData) => ({
        url: "tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }, "TaskMetrics"],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "TaskMetrics",
      ],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }, "TaskMetrics"],
    }),
    getUsers: builder.query({
      query: () => "users",
      providesTags: ["Users"],
    }),
    addAssignee: builder.mutation({
      query: ({ taskId, assigneeId }) => ({
        url: `tasks/${taskId}/assignees`,
        method: "PATCH",
        body: { assigneeId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),
    removeAssignee: builder.mutation({
      query: ({ taskId, assigneeId }) => ({
        url: `tasks/${taskId}/assignees`,
        method: "DELETE",
        body: { assigneeId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskMetricsQuery, // Export the new hook
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useAddAssigneeMutation,
  useRemoveAssigneeMutation,
} = taskApiSlice;
