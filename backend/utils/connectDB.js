const mongoose = require("mongoose");
const logger = require("../logs/logger");

const connectDB = async () => {
  if (process.env.NODE_ENV == "test") {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.success("Mongo connected successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
