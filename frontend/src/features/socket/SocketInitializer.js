// src/features/socket/SocketInitializer.js
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setConnected, clearJoinedConversations } from "./socketSlice";
import { selectCurrentUserId, selectCurrentToken } from "../auth/authSlice";
import {
  initializeSocket,
  disconnectSocket,
} from "../../services/socketService";
import { useRefreshMutation } from "../auth/authApiSlice";

const SocketInitializer = () => {
  const dispatch = useDispatch();
  const [refresh, { isError }] = useRefreshMutation();
  const currentUserId = useSelector(selectCurrentUserId);
  const token = useSelector(selectCurrentToken);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (currentUserId && token && !hasInitialized.current) {
      hasInitialized.current = true;
      const socket = initializeSocket(token);

      socket.on("connect", () => {
        dispatch(setConnected(true));
      });

      socket.on("connect_error", (error) => {
        if (error.message.includes("Authentication error: Invalid token")) {
          refresh();
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from WebSocket server:", reason);
        dispatch(setConnected(false));
        dispatch(clearJoinedConversations()); // Clear joined conversations on disconnect
      });
    } else if (!currentUserId && hasInitialized.current) {
      // User logged out, disconnect socket
      disconnectSocket();
      dispatch(clearJoinedConversations()); // Clear joined conversations when logging out
      hasInitialized.current = false;
    }
  }, [currentUserId, token, dispatch, refresh]);

  return null;
};

export default SocketInitializer;
