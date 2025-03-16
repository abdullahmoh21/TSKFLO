import { apiSlice } from "../../app/api/apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => "tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Task", id: _id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
      ],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
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
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useAddAssigneeMutation,
  useRemoveAssigneeMutation,
} = taskApiSlice;
