const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    refreshTokenHash: {
      type: String,
    },
    refreshTokenExp: {
      type: Date,
    },
    resetPasswordEncryptedToken: {
      type: String,
    },
    resetPasswordExp: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
