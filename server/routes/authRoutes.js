const express = require("express");
const router = express.Router();
const {
  register,
  verifyOtp,
  login,
  getMe,
  updateProfileImage,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/profile-image", auth, updateProfileImage);
router.get("/me", auth, getMe);

module.exports = router;
