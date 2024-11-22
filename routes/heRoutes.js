const express = require("express");
const {
  createNewHE,
  validateExistingHE,
} = require("../middleware/regionMiddleware");
const {
  addHE,
  updateHE,
  deleteHE,
  searchHE,
} = require("../controllers/heController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Add a new HE
router.post("/add", protect, createNewHE, addHE);

// Update an existing HE
router.put("/:he_code/update", protect, validateExistingHE, updateHE);

// Delete an HE (Admins bypass region restrictions)
router.delete("/:he_code/delete", protect, validateExistingHE, deleteHE);

// Search for HEs
router.get("/search", protect, searchHE);

module.exports = router;
