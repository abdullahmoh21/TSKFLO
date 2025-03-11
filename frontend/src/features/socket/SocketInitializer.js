// src/features/socket/SocketInitializer.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setConnected } from "./socketSlice";
import { selectCurrentUserId, selectCurrentToken } from "../auth/authSlice";
import {
  initializeSocket,
  disconnectSocket,
} from "../../services/socketService";

const SocketInitializer = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const token = useSelector(selectCurrentToken);
  useEffect(() => {
    if (currentUserId && token) {
      const socket = initializeSocket(token);

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        dispatch(setConnected(true));
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from WebSocket server:", reason);
        dispatch(setConnected(false));
      });

      return () => {
        // Don't disconnect when component unmounts
        // Only the logout action should disconnect the socket
      };
    } else if (!currentUserId) {
      // User logged out, disconnect socket
      disconnectSocket();
    }
  }, [currentUserId, token, dispatch]);

  return null;
};

export default SocketInitializer;
