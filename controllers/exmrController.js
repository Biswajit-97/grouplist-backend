const EXMR = require("../models/Exmr");
const HE = require("../models/He");
/**
 * Add a new EXMR
 */
const addEXMR = async (req, res) => {
  try {
    const { exmr_code, he_code, subject_code, region, name } = req.body;

    // Ensure the EXMR doesn't already exist for the same context
    const existingEXMR = await EXMR.findOne({
      exmr_code,
      he_code,
      subject_code,
      region,
    });

    if (existingEXMR) {
      return res
        .status(400)
        .json({
          message:
            "EXMR with this code already exists for the specified context.",
        });
    }

    // Create the new EXMR
    const newEXMR = new EXMR({
      exmr_code,
      he_code,
      subject_code,
      region,
      name,
    });

    await newEXMR.save();

    res.status(201).json({ message: "EXMR added successfully", exmr: newEXMR });
  } catch (error) {
    console.error("Error adding EXMR:", error.message);
    res.status(500).json({
      message: "Error adding EXMR",
      error: error.message,
    });
  }
};

/**
 * Update an existing EXMR
 */
const updateEXMR = async (req, res) => {
  try {
    const { exmr_code } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required to update" });
    }

    const updatedEXMR = await EXMR.findOneAndUpdate(
      { exmr_code },
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedEXMR) {
      return res.status(404).json({ message: "EXMR not found" });
    }

    res
      .status(200)
      .json({ message: "EXMR updated successfully", data: updatedEXMR });
  } catch (error) {
    console.error("Error updating EXMR:", error.message);
    res
      .status(500)
      .json({ message: "Error updating EXMR", error: error.message });
  }
};

/**
 * Delete an EXMR
 */
const deleteEXMR = async (req, res) => {
  try {
    const { exmr_code } = req.params;

    const deletedEXMR = await EXMR.findOneAndDelete({ exmr_code });
    if (!deletedEXMR) {
      return res.status(404).json({ message: "EXMR not found" });
    }

    res
      .status(200)
      .json({ message: "EXMR deleted successfully", data: deletedEXMR });
  } catch (error) {
    console.error("Error deleting EXMR:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting EXMR", error: error.message });
  }
};

/**
 * Search for EXMRs by HE code and/or subject code
 */
const searchEXMR = async (req, res) => {
  try {
    const { he_code, subject_code } = req.query;

    const query = {};
    if (he_code) query.he_code = he_code;
    if (subject_code) query.subject_code = subject_code;

    const results = await EXMR.find(query).sort({ exmr_code: 1 });

    if (!results.length) {
      return res.status(404).json({ message: "No EXMRs found" });
    }

    res.status(200).json({ message: "EXMR search results", data: results });
  } catch (error) {
    console.error("Error searching EXMRs:", error.message);
    res
      .status(500)
      .json({ message: "Error searching EXMRs", error: error.message });
  }
};

/**
 * Transfer an EXMR to a different HE
 */
const transferEXMR = async (req, res) => {
  try {
    const { exmr_code } = req.params;
    const { new_he_code } = req.body;

    // Validate new HE exists
    const heExists = await HE.findOne({ he_code: new_he_code });
    if (!heExists) {
      return res.status(404).json({ message: "New HE not found" });
    }

    // Generate new EXMR code based on the new HE
    const lastEXMR = await EXMR.findOne({ he_code: new_he_code }).sort({
      exmr_code: -1,
    });
    const newExmrCode = lastEXMR
      ? `${new_he_code}${(parseInt(lastEXMR.exmr_code.slice(-2), 10) + 1)
          .toString()
          .padStart(2, "0")}`
      : `${new_he_code}01`;

    // Transfer EXMR to new HE
    const transferredEXMR = await EXMR.findOneAndUpdate(
      { exmr_code },
      { he_code: new_he_code, exmr_code: newExmrCode },
      { new: true, runValidators: true }
    );

    if (!transferredEXMR) {
      return res.status(404).json({ message: "EXMR not found" });
    }

    res.status(200).json({
      message: "EXMR transferred successfully",
      data: transferredEXMR,
    });
  } catch (error) {
    console.error("Error transferring EXMR:", error.message);
    res
      .status(500)
      .json({ message: "Error transferring EXMR", error: error.message });
  }
};

module.exports = {
  addEXMR,
  updateEXMR,
  deleteEXMR,
  searchEXMR,
  transferEXMR,
};
