import { apiSlice } from "../../app/api/apiSlice";
import { getSocket } from "../../services/socketService";

const onStartListening = (dispatch, api) => {
  // Check periodically for socket availability
  const checkAndSetupSocket = () => {
    const socket = getSocket();
    if (socket) {
      // Clear any existing listeners to prevent duplicates
      socket.off("messageCreated");
      socket.off("conversationCreated");

      socket.on("messageCreated", (message) => {
        console.log("Socket message received:", message);
        const conversationId = message.conversation;

        try {
          // First try to update the cache directly
          const updated = dispatch(
            api.util.updateQueryData(
              "getMessages",
              conversationId,
              (draftMessages) => {
                // Ensure draftMessages is an array before attempting to update
                if (!Array.isArray(draftMessages)) {
                  console.warn(
                    "draftMessages is not an array, creating new array"
                  );
                  return [message]; // Return a new array with just the new message
                }

                // Check if message already exists to avoid duplicates
                if (!draftMessages.some((m) => m._id === message._id)) {
                  draftMessages.push(message);
                }
              }
            )
          );

          // Check if update was successful
          if (!updated) {
            console.warn(
              "Cache update returned falsy value, forcing invalidation"
            );
            dispatch(
              api.util.invalidateTags([{ type: "Message", id: conversationId }])
            );
          }

          // Also update conversation's lastMessage
          dispatch(
            api.util.updateQueryData(
              "getAllConversations",
              undefined,
              (draftConversations) => {
                if (!Array.isArray(draftConversations)) return;

                const conversation = draftConversations.find(
                  (c) => c._id === conversationId
                );
                if (conversation) {
                  conversation.lastMessage = message;
                }
              }
            )
          );
        } catch (err) {
          console.error("Error handling socket message:", err);
          // Always invalidate on error
          dispatch(
            api.util.invalidateTags([{ type: "Message", id: conversationId }])
          );
        }
      });

      // Conversation created handler
      socket.on("conversationCreated", (conversation) => {
        console.log("New conversation created:", conversation);
        try {
          dispatch(
            api.util.updateQueryData(
              "getAllConversations",
              undefined,
              (draftConversations) => {
                if (
                  draftConversations &&
                  !draftConversations.find((c) => c._id === conversation._id)
                ) {
                  draftConversations.unshift(conversation);
                }
              }
            )
          );
        } catch (err) {
          console.error("Error handling new conversation:", err);
        }
      });

      return true;
    }
    return false;
  };

  // Try immediately
  if (!checkAndSetupSocket()) {
    // If socket not available, retry a few times
    const interval = setInterval(() => {
      if (checkAndSetupSocket()) {
        clearInterval(interval);
      }
    }, 1000);
    // Stop trying after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);
  }
};

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllConversations: builder.query({
      query: () => ({
        url: "/conversations",
        method: "GET",
        credentials: "include",
      }),
      providesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    createConversation: builder.mutation({
      query: (participants) => ({
        url: "/conversations",
        method: "POST",
        body: participants,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    getMessages: builder.query({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
        { type: "Message", id: "LIST" },
      ],
      transformResponse: (response) => {
        return response || []; // Ensure we always have an array
      },
    }),
    createMessage: builder.mutation({
      query: ({ conversationId, messageData }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: messageData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Message", id: conversationId },
      ],
    }),
  }),
});

// Create a middleware that sets up socket listeners when the app starts
export const setupSocketListeners = (store) => {
  // Initialize immediately instead of with a timeout
  onStartListening(store.dispatch, apiSlice);
  return (next) => (action) => next(action);
};

export const {
  useGetAllConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
} = messageApiSlice;
