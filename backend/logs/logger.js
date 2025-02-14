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
  colors: {
    error: "red",
    warn: "yellow",
    info: "magenta",
    debug: "blue",
    success: "green",
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
    // Console transport with custom format
    new winston.transports.Console({
      level: "success",
      format: winston.format.combine(winston.format.colorize()),
    }),
    // Error log file transport
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
});

// Add colors to console output
winston.addColors(customLevels.colors);

module.exports = logger;
