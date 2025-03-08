// socketAuthMiddleware.js
const jwt = require("jsonwebtoken");
const logger = require("../logs/logger");

function socketAuthMiddleware(socket, next) {
  // Retrieve the token from handshake.auth or handshake.headers
  const token = socket.handshake.auth?.token || socket.handshake.headers?.token;

  if (!token) {
    logger.warn("Socket connection attempt without token.");
    return next(new Error("Authentication error: No token provided"));
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      logger.warn("Invalid token for socket connection:", err);
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.user = decoded.user;
    next(); // proceed with the connection
  });
}

module.exports = socketAuthMiddleware;
