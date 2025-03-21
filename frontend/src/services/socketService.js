import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) return socket;

  // If we have a socket but it's disconnected, try to reconnect
  if (socket) {
    socket.connect();
    return socket;
  }

  // Create new socket connection
  socket = io("http://localhost:3200", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 50,
    reconnectionDelay: 1000,
    auth: {
      token,
    },
  });

  // Add debugging listeners
  socket.on("connect", () => {
    console.log("Socket connected with id:", socket.id);
  });

  socket.on("newMessage", (data) => {
    console.log("Socket message received:", data);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};
