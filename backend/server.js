const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");

const connectDB = require("./utils/connectDB");
const logger = require("./utils/logger");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));
app.use("/user", require("./endpoints/userEndpoints"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
