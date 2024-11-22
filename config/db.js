const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const connectDB = async () => {
  try {
    const dbName = "grouplist"; // Database name
    const dbURI = process.env.MONGO_URI;

    // Connect to MongoDB Atlas
    const connection = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName, // Specify the database name here
    });
    console.log(`Connected to MongoDB Atlas database: ${dbName}`);

    // Debugging: Verify connection and collections
    const db = connection.connection.db;

    // Check if users collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some((col) => col.name === "users");
    if (!collectionExists) {
      console.log("Creating users collection...");
      await db.createCollection("users");
      console.log("Users collection created.");
    }

    // Check if an admin user exists
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("Creating default admin user...");

      // Default admin password
      const plainPassword = "jeet1997";
      const saltRounds = 10;

      // Generate hashed password
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      console.log(
        "Generated hashed password for default admin:",
        hashedPassword
      );

      // Create admin user
      const admin = new User({
        username: "wbchse",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save({ validateBeforeSave: false });
      console.log("Default admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("MongoDB Atlas connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
