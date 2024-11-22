const HE = require("../models/He");
const EXMR = require("../models/Exmr");

/**
 * Middleware to restrict HE operations based on user region
 */

/**
 * Middleware to create a new HE, ensuring no duplicates for the same `region` and `subject_code`.
 */
const createNewHE = async (req, res, next) => {
  try {
    const { role, region } = req.user; // User details from the token
    const { he_code, subject_code, name } = req.body;

    // Admins bypass region restrictions
    if (role === "admin") {
      return next();
    }

    // Assign the user's region to the HE data
    req.body.region = region;

    // Check if the HE code already exists for the same `region` and `subject_code`
    const existingHE = await HE.findOne({ he_code, region, subject_code });
    if (existingHE) {
      return res.status(400).json({
        message: `HE with code ${he_code}, subject ${subject_code}, and region ${region} already exists.`,
      });
    }

    // Proceed to create the HE
    next();
  } catch (error) {
    console.error("Error in creating new HE:", error.message);
    res.status(500).json({
      message: "Error in creating new HE",
      error: error.message,
    });
  }
};

/**
 * Middleware to validate access or update permissions for an HE.
 */
const validateExistingHE = async (req, res, next) => {
  try {
    const { role, region } = req.user; // User details from the token
    const { he_code, subject_code } = req.body;

    // Admins bypass region restrictions
    if (role === "admin") {
      return next();
    }

    // Fetch the HE and validate its existence
    const he = await HE.findOne({ he_code, subject_code });
    if (!he) {
      return res.status(404).json({
        message: "HE not found. Cannot validate region.",
      });
    }

    // Ensure the HE's region matches the user's region
    if (he.region !== region) {
      return res.status(403).json({
        message: "Access denied. You can only access HEs in your region.",
      });
    }

    // If validation passes, proceed
    next();
  } catch (error) {
    console.error("Error in accessing existing HE:", error.message);
    res.status(500).json({
      message: "Error in accessing existing HE",
      error: error.message,
    });
  }
};

/**
 * Middleware to restrict EXMR operations based on user region and generate EXMR code automatically.
 */
const generateEXMRCode = async (req, res, next) => {
  try {
    const { he_code, subject_code } = req.body;

    // Fetch HE by he_code and subject_code
    const he = await HE.findOne({ he_code, subject_code });
    if (!he) {
      return res.status(404).json({
        message: "HE not found for the specified subject.",
      });
    }

    // Ensure the provided subject matches the HE's subject_code
    if (he.subject_code !== subject_code) {
      return res.status(400).json({
        message: "The subject does not match the HE's assigned subject.",
      });
    }

    // Fetch the region from the HE
    const region = he.region;

    // Fetch the last EXMR for the HE, subject, and region combination
    const lastEXMR = await EXMR.findOne({ he_code, subject_code, region }).sort(
      {
        exmr_code: -1,
      }
    );

    let newEXMRCode;
    if (lastEXMR) {
      // Extract and increment the last running number
      const lastNumber = parseInt(lastEXMR.exmr_code.slice(-2)); // Last two digits
      newEXMRCode = `${he_code}${(lastNumber + 1).toString().padStart(2, "0")}`;
    } else {
      // Start with '01' if no EXMR exists
      newEXMRCode = `${he_code}01`;
    }

    // Assign generated EXMR code and region to the request body
    req.body.exmr_code = newEXMRCode;
    req.body.region = region;

    next();
  } catch (error) {
    console.error("Error generating EXMR code:", error.message);
    res.status(500).json({
      message: "Error generating EXMR code",
      error: error.message,
    });
  }
};

/**
 * Middleware to verify that the user belongs to the same region as the HE and EXMR.
 */
const verifyOperationRegion = async (req, res, next) => {
  try {
    const { exmr_code } = req.params; // EXMR code for identifying the EXMR
    const userRegion = req.user.region; // Region from authenticated user

    // Fetch the EXMR
    const exmr = await EXMR.findOne({ exmr_code });
    if (!exmr) {
      return res.status(404).json({ message: "EXMR not found" });
    }

    // Fetch the HE related to the EXMR
    const he = await HE.findOne({ he_code: exmr.he_code });
    if (!he) {
      return res.status(404).json({ message: "Associated HE not found" });
    }

    // Verify that the user's region matches the HE and EXMR regions
    if (userRegion !== he.region || userRegion !== exmr.region) {
      return res.status(403).json({ message: "Unauthorized: Region mismatch" });
    }

    next();
  } catch (error) {
    console.error("Error verifying operation region:", error.message);
    res.status(500).json({
      message: "Error verifying operation region",
      error: error.message,
    });
  }
};

module.exports = {
  createNewHE,
  validateExistingHE,
  generateEXMRCode,
  verifyOperationRegion,
};
