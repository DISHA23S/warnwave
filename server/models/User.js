const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  profileImage: String,
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model("User", userSchema);
