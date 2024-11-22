const express = require("express");
const {
  getUserProfile,
  getUsersByRegion,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Route for fetching user profile
router.get("/profile", protect, getUserProfile); // Protected route

// Route for fetching users by region
router.get("/users", protect, getUsersByRegion); // Protected route

module.exports = router;
