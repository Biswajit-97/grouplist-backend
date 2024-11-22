const HE = require("../models/He");

/**
 * Add a new HE
 */
const addHE = async (req, res) => {
  try {
    const { he_code, name, subject_code } = req.body;
    const { region } = req.user; // Get the region from the authenticated user

    // Validate input
    if (!he_code || !name || !subject_code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the new HE with the region assigned from the user's token
    const newHE = await HE.create({ he_code, name, subject_code, region });

    res.status(201).json({ message: "HE added successfully", data: newHE });
  } catch (error) {
    res.status(500).json({ message: "Error adding HE", error: error.message });
  }
};

/**
 * Update an existing HE
 */
const updateHE = async (req, res) => {
  try {
    const { he_code } = req.params;
    const { name, subject_code } = req.body;

    // Validate input
    if (!name && !subject_code) {
      return res
        .status(400)
        .json({ message: "At least one field must be updated" });
    }

    // Find and update the HE
    const updatedHE = await HE.findOneAndUpdate(
      { he_code },
      { name, subject_code },
      { new: true, runValidators: true }
    );

    if (!updatedHE) {
      return res.status(404).json({ message: "HE not found" });
    }

    res
      .status(200)
      .json({ message: "HE updated successfully", data: updatedHE });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating HE", error: error.message });
  }
};

/**
 * Delete an HE
 */
const deleteHE = async (req, res) => {
  try {
    const { he_code } = req.params;

    // Find and delete the HE
    const deletedHE = await HE.findOneAndDelete({ he_code });
    if (!deletedHE) {
      return res.status(404).json({ message: "HE not found" });
    }

    res
      .status(200)
      .json({ message: "HE deleted successfully", data: deletedHE });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting HE", error: error.message });
  }
};

/**
 * Search for HEs
 */
const searchHE = async (req, res) => {
  try {
    const { subject_code, he_code } = req.query;

    // Build query based on input
    const query = {};
    if (subject_code) query.subject_code = subject_code;
    if (he_code) query.he_code = he_code;

    // Fetch HEs matching the criteria
    const results = await HE.find(query).sort({
      subject_code: -1,
      he_code: -1,
    });

    if (!results.length) {
      return res.status(404).json({ message: "No HEs found" });
    }

    res.status(200).json({ message: "HE search results", data: results });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching HEs", error: error.message });
  }
};

module.exports = { addHE, updateHE, deleteHE, searchHE };
