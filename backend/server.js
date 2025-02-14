const express = require("express");
require("dotenv").config();
const app = express();
const connectDB = require("./utils/connectDB");
const cookieParser = require("cookie-parser");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", require("./endpoints/authEndpoints"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
