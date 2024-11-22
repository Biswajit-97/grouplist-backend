const mongoose = require("mongoose");

const heSchema = new mongoose.Schema({
  he_code: {
    type: String,
    required: true,
    unique: true,
    match: /^HE-\d{3}$/, // Format: HE-XXX
  },
  name: { type: String, required: true },
  subject_code: { type: String, required: true },
  region: {
    type: String,
    enum: ["KRO", "MRO", "BRO", "NBRO"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

// Ensure uniqueness for he_code within region and subject_code
heSchema.index({ he_code: 1, region: 1, subject_code: 1 }, { unique: true });

module.exports = mongoose.model("HE", heSchema);
