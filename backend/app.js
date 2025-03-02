const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));
app.use("/user", require("./endpoints/userEndpoints"));
app.use("/tasks", require("./endpoints/taskEndpoints"));
app.use("/admin", require("./endpoints/adminEndpoints"));

app.use(require("./middleware/formatJoiErrors")); // formats Joi validation errors into JSON
app.use(require("./middleware/errorHandler")); // catches any unhandled error

module.exports = app;
