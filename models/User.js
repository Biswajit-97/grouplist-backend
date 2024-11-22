const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true },
  region: {
    type: String,
    enum: ["KRO", "MRO", "BRO", "NBRO"],
    required: function () {
      return this.role === "user";
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Check if password is already hashed
  const hashRegex = /^\$2[aby]\$\d{2}\$/; // Matches bcrypt hashes
  if (hashRegex.test(this.password)) {
    return next(); // Skip rehashing
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
