import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (socket) return socket;

  socket = io("http://localhost:3200", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: {
      token,
    },
  });

  // Add this event logging code
  const onevent = socket.onevent;
  socket.onevent = function (packet) {
    const args = packet.data || [];
    console.log("Socket received event:", args[0], args.slice(1));
    onevent.call(this, packet); // original call
  };

  socket.onAny((event, ...args) => {
    console.log(`Socket event: ${event}`, args);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
