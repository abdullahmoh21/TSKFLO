const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./utils/connectDB");
const logger = require("./logs/logger");
const errorHandler = require("./middleware/errorHandler");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));
app.use("/user", require("./endpoints/userEndpoints"));
app.use("/tasks", require("./endpoints/taskEndpoints"));

app.use(require("./middleware/formatJoiErrors")); // formats Joi validation errors into JSON
app.use(errorHandler); // catches any unhandled error

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(process.env.PORT || 3200, () => {
    console.log(`Server running on port ${process.env.PORT || 3200}`);
  });
}

mongoose.connection.on("error", (err) => {
  logger.error(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);
  if (server) {
    server.close();
  }
});

module.exports = app;
