const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:80',
        'http://localhost',
        'http://127.0.0.1:63417',  // Browser preview
        undefined  // Allow requests with no origin (like mobile apps or curl requests)
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));
app.use("/user", require("./endpoints/userEndpoints"));
app.use("/tasks", require("./endpoints/tasksEndpoints"));
app.use("/admin", require("./endpoints/adminEndpoints"));
app.use("/conversations", require("./endpoints/conversationsEndpoints"));

app.use(require("./middleware/formatJoiErrors")); // formats Joi validation errors into JSON
app.use(require("./middleware/errorHandler")); // catches any unhandled error

module.exports = app;
