const winston = require("winston");
const path = require("path");

// Define custom logging levels including 'http'
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    success: 4,
  },
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: "success",
      format: winston.format.combine(
        winston.format.printf(
          ({ level, message }) => `[${level.toUpperCase()}] ${message}`
        )
      ),
    }),

    // Error log file transport
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
});

module.exports = logger;
