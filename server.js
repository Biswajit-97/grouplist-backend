require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xssClean = require("xss-clean");
const { check, validationResult } = require("express-validator");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const { protect } = require("./middleware/auth");
const exmrRoutes = require("./routes/exmrRoutes"); // EXMR Routes
const heRoutes = require("./routes/heRoutes"); // User Routes

// Initialize express app
const app = express();

// Database connection
connectDB();

// Middleware for general protection
app.use(helmet()); // Set various HTTP headers for security
app.use(xssClean()); // Prevent XSS attacks
app.use(cors()); // Cross-Origin Resource Sharing (you can customize the allowed origins)
app.use(bodyParser.json()); // Body parser to handle JSON payloads
app.use(morgan("dev")); // HTTP request logging
app.use(express.json()); // Parse JSON requests

// Rate limiting to prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later",
});
app.use(limiter); // Apply rate limiter to all API routes

// Auth Routes (Login, Register)
app.use("/api/auth", authRoutes);

// User Routes (Profile, Get Users, etc.)
app.use("/api/users", protect, userRoutes);

// grouplist Routes
app.use("/api/hes", heRoutes); // Routes for Head Examiner
app.use("/api/exmrs", exmrRoutes); // Routes for Examiner

// Validation middleware for user inputs (using username)
const validateUserInput = [
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 6 })
    .withMessage("Username should be at least 6 characters long"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long"),
];

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Grouplist Management System API!");
});

// Handle errors for validation
app.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
