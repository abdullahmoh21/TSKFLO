const mongoose = require("mongoose");
const connectDB = require("./utils/connectDB");
const logger = require("./logs/logger");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const socketVerifyJWT = require("./middleware/socketVerifyJWT"); // <-- ADDED
require("dotenv").config();

let server;
if (process.env.NODE_ENV !== "test") {
  connectDB();
  server = http.createServer(app);

  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.set("socketIo", io);

  //only authenticated users can connect
  io.use(socketVerifyJWT);

  // Now we know any socket that passes the above middleware is *authenticated*
  io.on("connection", (socket) => {
    logger.info(`New authenticated socket: ${JSON.stringify(socket.user)}`);

    socket.on("joinConversation", (conversationId) => {
      // In your next step, you'll check if `socket.user.id` is part of the conversation
      socket.join(conversationId);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      logger.info("User disconnected:", socket.id);
    });
  });

  server.listen(process.env.PORT || 3200, "0.0.0.0", () => {
    logger.info(`Server running on port ${process.env.PORT || 3200}`);
  });
}

mongoose.connection.on("error", (err) => {
  logger.error(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);
  if (server) {
    server.close();
  }
});

module.exports = server;
