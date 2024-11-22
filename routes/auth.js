const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getUsersByRegion,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Public route: Login
router.post("/login", loginUser);

// Public route: Logout
router.post("/logout", logoutUser);

// Protected route: Register new user (Admin only)
router.post("/register", protect, adminOnly, registerUser);

// Protected route: Get user profile
router.get("/profile", protect, getUserProfile);

// Protected route: Get users by region
router.get("/users", protect, getUsersByRegion);

module.exports = router;
