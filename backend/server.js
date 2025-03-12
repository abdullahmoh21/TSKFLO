const mongoose = require("mongoose");
const connectDB = require("./utils/connectDB");
const logger = require("./logs/logger");
const app = require("./app");

require("dotenv").config();

// start server and DB connection only when not in test mode
let server;
if (process.env.NODE_ENV !== "test") {
  connectDB();
  server = app.listen(process.env.PORT || 3200, () => {
    console.log(`Server running on port ${process.env.PORT || 3200}`);
  });
}

mongoose.connection.on("error", (err) => {
  logger.error(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);
  if (server) {
    server.close();
  }
});

module.exports = server;
