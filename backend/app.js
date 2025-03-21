const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));
app.use("/user", require("./endpoints/userEndpoints"));
app.use("/tasks", require("./endpoints/tasksEndpoints"));
app.use("/admin", require("./endpoints/adminEndpoints"));
app.use("/conversations", require("./endpoints/conversationsEndpoints"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(require("./middleware/formatJoiErrors")); // formats Joi validation errors into JSON
app.use(require("./middleware/errorHandler")); // catches any unhandled error

module.exports = app;
