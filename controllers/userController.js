const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user (Admin only)
const registerUser = async (req, res) => {
  const { username, password, role, region } = req.body;

  try {
    // Verify that only admin can register users
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can register new users" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword); // Log the hashed password
    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      region: role === "user" ? region : undefined, // Region only for users
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Admins don't require a region, so check if they are an admin
    if (user.role === "admin" && !user.region) {
      // Admin should not need region field
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).json({ message: "Login successful", token });
    }

    // For users, ensure the region exists and include it in the JWT payload
    const token = jwt.sign(
      { id: user._id, role: user.role, region: user.region },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

// Get users by region (Admin can view all, regional users only their region)
const getUsersByRegion = async (req, res) => {
  try {
    let users;
    if (req.user.role === "admin") {
      // Admin can fetch all users
      users = await User.find().select("-password");
    } else {
      // Regional users can fetch only users from their region
      users = await User.find({ region: req.user.region }).select("-password");
    }

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Logout user
const logoutUser = (req, res) => {
  // Clear the JWT token stored in cookies
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUsersByRegion,
  logoutUser,
};
