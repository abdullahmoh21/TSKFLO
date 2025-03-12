// src/features/socket/SocketInitializer.js
import React, { useEffect, useRef } from "react";
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
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (currentUserId && token && !hasInitialized.current) {
      hasInitialized.current = true;
      const socket = initializeSocket(token);

      socket.on("connect", () => {
        dispatch(setConnected(true));
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from WebSocket server:", reason);
        dispatch(setConnected(false));

        // If the disconnection was not initiated by the client, attempt to reconnect
        if (reason === "io server disconnect" || reason === "transport close") {
          socket.connect();
        }
      });

      return () => {
        // We'll handle disconnection separately
      };
    } else if (!currentUserId && hasInitialized.current) {
      // User logged out, disconnect socket
      disconnectSocket();
      hasInitialized.current = false;
    }
  }, [currentUserId, token, dispatch]);

  return null;
};

export default SocketInitializer;
