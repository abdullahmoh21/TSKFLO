const logger = require("../logs/logger");

const errorHandler = (err, req, res, next) => {
  // Use Winston to log the error
  logger.info("Error handler triggered");
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500; // Assuming err can have a statusCode property

  res.status(status);
  res.json({ message: err.message, isError: true });
};

// To prevent the application from crashing
process.on("uncaughtException", function (err) {
  logger.error(`[UNHANDLED EXCEPTION] ${err.name}: ${err.message}`, {
    stack: err.stack,
  });
  if (err.message.includes("EADDRINUSE")) {
    logger.error("Error: Port is already in use. restarting the server");
  }
  // restartServer();
});

process.on("unhandledRejection", (reason, promise) => {
  if (reason instanceof Error) {
    logger.error(`[UNHANDLED PROMISE] ${reason.name}: ${reason.message}`, {
      stack: reason.stack,
    });
  } else {
    logger.error(`[UNHANDLED PROMISE] ${reason}`);
  }
});

module.exports = errorHandler;
