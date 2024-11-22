const mongoose = require("mongoose");

const exmrSchema = new mongoose.Schema({
  exmr_code: {
    type: String,
    required: true,
    unique: true,
    match: /^HE-\d{3}\d{2}$/, // Format: HE-XXXYY (matches parent HE code)
  },
  name: { type: String, required: true },
  subject_code: { type: String, required: true },
  he_code: {
    type: String,
    required: true,
    match: /^HE-\d{3}$/, // Linked HE Code
  },
  region: {
    type: String,
    enum: ["KRO", "MRO", "BRO", "NBRO"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

// Create a compound unique index for `he_code`, `subject_code`, and `region`
exmrSchema.index(
  { exmr_code: 1, he_code: 1, subject_code: 1, region: 1 },
  { unique: true }
);

module.exports = mongoose.model("EXMR", exmrSchema);
