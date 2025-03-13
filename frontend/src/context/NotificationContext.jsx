import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { getSocket } from "../services/socketService";
import { useSelector } from "react-redux";
import {
  selectCurrentToken,
  selectCurrentUserId,
} from "../features/auth/authSlice";
import { useGetAllConversationsQuery } from "../features/messages/messageApiSlice";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const token = useSelector(selectCurrentToken);
  const currentUserId = useSelector(selectCurrentUserId);
  const socket = getSocket();
  const location = useLocation();
  const { data: conversations } = useGetAllConversationsQuery(undefined, {
    skip: !token,
  });

  // Use a ref to track if we've already set up the socket listener
  const socketInitialized = useRef(false);

  // Reset unread count
  const resetUnreadMessages = () => {
    setUnreadMessages(0);
    setUnreadConversations(new Set());
  };

  // Mark a specific conversation as read
  const markConversationAsRead = (conversationId) => {
    setUnreadConversations((prev) => {
      const updated = new Set(prev);
      updated.delete(conversationId);
      return updated;
    });

    if (
      unreadConversations.size === 1 &&
      unreadConversations.has(conversationId)
    ) {
      setUnreadMessages(0);
    }
  };

  // Track if a conversation has unread messages
  const hasUnreadMessages = (conversationId) => {
    return unreadConversations.has(conversationId);
  };

  useEffect(() => {
    // Only set up the socket listener if we have both socket and user ID
    // and we haven't already initialized the socket
    if (!socket || !currentUserId || socketInitialized.current) return;

    socketInitialized.current = true;

    // Listen for new messages and update notification state
    const handleNewMessage = (message) => {
      console.log("New message received in notification context:", message);

      // dont show toasts if were already on /messaging or if user was sender
      if (
        message.sender._id !== currentUserId &&
        location.pathname !== "/messaging"
      ) {
        setUnreadMessages((prevCount) => prevCount + 1);
        setUnreadConversations((prev) => {
          const updated = new Set(prev);
          updated.add(message.conversation);
          return updated;
        });

        // Show toast notification with more prominent styling
        toast.info(<div>New message from {message.sender.name}</div>, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "notification-toast",
        });
      }
    };

    socket.on("messageCreated", handleNewMessage);

    return () => {
      socket.off("messageCreated", handleNewMessage);
      socketInitialized.current = false;
    };
  }, [socket, currentUserId, location.pathname]);

  useEffect(() => {
    if (socket && token && conversations) {
      // Join all conversation rooms at app initialization
      conversations.forEach((conversation) => {
        console.log(`joined room for conversation: ${conversation._id}`);
        socket.emit("joinConversation", conversation._id);
      });
    }

    // No cleanup function that leaves rooms
  }, [socket, token, conversations]);

  const value = {
    unreadMessages,
    unreadConversations,
    hasUnreadMessages,
    markConversationAsRead,
    resetUnreadMessages,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
