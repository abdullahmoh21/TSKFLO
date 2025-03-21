import { apiSlice } from "../../app/api/apiSlice";
import { getSocket } from "../../services/socketService";
import { selectCurrentUserId } from "../auth/authSlice";
import { toast } from "react-toastify";

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
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/delete`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),
  }),
});

// Create a middleware that sets up socket listeners when the app starts
export const setupSocketListeners = (store) => {
  onStartListening(store.dispatch, {
    util: apiSlice.util,
    getState: store.getState,
  });
  return (next) => (action) => next(action);
};

const onStartListening = (dispatch, api) => {
  const checkAndSetupSocket = () => {
    const socket = getSocket();
    if (socket) {
      // Clear any existing listeners to prevent duplicates
      socket.off("messageCreated");
      socket.off("conversationCreated");
      socket.off("conversationDeleted");

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

          // Update conversation's lastMessage AND move to top of the list
          dispatch(
            api.util.updateQueryData(
              "getAllConversations",
              undefined,
              (draftConversations) => {
                if (!Array.isArray(draftConversations)) return;

                // Find the conversation
                const index = draftConversations.findIndex(
                  (c) => c._id === conversationId
                );

                if (index > -1) {
                  // Get the conversation object
                  const conversation = draftConversations[index];
                  // Update its lastMessage
                  conversation.lastMessage = message;

                  // Remove conversation from current position
                  draftConversations.splice(index, 1);
                  // Add it to the beginning of the array (top of the list)
                  draftConversations.unshift(conversation);
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

      // Add the conversation deleted handler
      socket.on("conversationDeleted", ({ conversationId, deletedBy }) => {
        console.log("Conversation deleted:", { conversationId, deletedBy });
        const state = api.getState();
        const currentUserId = selectCurrentUserId(state);
        try {
          // Update the cache to remove the deleted conversation
          dispatch(
            api.util.updateQueryData(
              "getAllConversations",
              undefined,
              (draftConversations) => {
                if (!Array.isArray(draftConversations)) return;

                // Find the deleted conversation to get its details before removal
                const deletedConversation = draftConversations.find(
                  (c) => c._id === conversationId
                );

                if (deletedConversation) {
                  // Only show toast if the current user didn't delete the conversation
                  if (deletedBy._id !== currentUserId) {
                    // Determine if it's a group or DM for notification message
                    const isGroup = deletedConversation.groupName;
                    let notificationMessage;

                    if (isGroup) {
                      notificationMessage = `The group ${deletedConversation.groupName} was deleted by ${deletedBy.name}.`;
                    } else {
                      // For DMs, find the other participant's name
                      const otherParticipant =
                        deletedConversation.participants?.find(
                          (p) => p._id !== deletedBy._id
                        );
                      const name = otherParticipant?.name || "Unknown user";
                      notificationMessage = `Your conversation with ${name} has been deleted.`;
                    }

                    // Show toast notification
                    toast.info(notificationMessage, {
                      position: "top-right",
                      autoClose: 5000,
                    });
                  }

                  // Remove the conversation from the array
                  return draftConversations.filter(
                    (c) => c._id !== conversationId
                  );
                }
              }
            )
          );

          // Also invalidate the messages for this conversation
          dispatch(
            api.util.invalidateTags([{ type: "Message", id: conversationId }])
          );
        } catch (err) {
          console.error("Error handling deleted conversation:", err);
          // Invalidate the conversation list on error
          dispatch(
            api.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
          );
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

export const {
  useGetAllConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useDeleteConversationMutation,
} = messageApiSlice;
