const express = require("express");
const {
  generateEXMRCode,
  verifyOperationRegion,
} = require("../middleware/regionMiddleware");
const {
  addEXMR,
  updateEXMR,
  deleteEXMR,
  searchEXMR,
  transferEXMR,
} = require("../controllers/exmrController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Routes for EXMR operations

// Add a new EXMR (includes region verification and EXMR code generation)
router.post("/add", protect, generateEXMRCode, addEXMR);

// Update an EXMR (with region verification)
router.put("/:exmr_code/update", protect, verifyOperationRegion, updateEXMR);

// Delete an EXMR (with region verification)
router.delete("/:exmr_code/delete", protect, verifyOperationRegion, deleteEXMR);

// Search for EXMRs
router.get("/search", protect, searchEXMR);

// Transfer an EXMR to a different HE (with region verification)
router.put(
  "/:exmr_code/transfer",
  protect,
  verifyOperationRegion,
  transferEXMR
);

module.exports = router;
