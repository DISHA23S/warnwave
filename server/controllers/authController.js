const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../utils/sendOTP");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already used" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await sendOTP(email, otp);
    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ msg: "OTP verified" });
  } catch {
    res.status(500).json({ msg: "Error verifying OTP" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch {
    res.status(500).json({ msg: "Login failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json(user);
  } catch {
    res.status(400).json({ msg: "User fetch failed" });
  }
};

// Update profile image
exports.updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;
    if (!profileImage) return res.status(400).json({ msg: "No image provided" });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true, select: "-password -otp" }
    );
    res.json(user);
  } catch {
    res.status(400).json({ msg: "Profile image update failed" });
  }
};
