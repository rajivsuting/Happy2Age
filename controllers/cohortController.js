const Cohort = require("../models/cohortSchema");
const Participant = require("../models/participantSchema");
const { validateParticipantData } = require("../validator/validator");
const logger = require("../log/logger");
const { default: mongoose } = require("mongoose");

const createCohort = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        error:
          "Name and participants are required fields, and participants must be an array",
      });
    }

    const invalidParticipants = [];
    for (const participantId of participants) {
      const participant = await Participant.findById(participantId);
      if (!participant) {
        invalidParticipants.push(participantId);
      }
    }

    if (invalidParticipants.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Participants not found: ${invalidParticipants.join(", ")}`,
      });
    }

    const cohort = await Cohort.create({ name, participants });

    res.status(201).json({
      success: true,
      message: "Cohort added successfully",
      data: cohort,
    });
  } catch (error) {
    logger.error("Error creating cohort:", error);

    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getAllCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find()
      .populate("participants")
      .populate("sessions")
      .lean();

    if (cohorts.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No cohorts found" });
    }

    logger.info(`Retrieved ${cohorts.length} cohorts successfully`);

    res.status(200).json({ success: true, message: cohorts });
  } catch (error) {
    logger.error("Error fetching cohorts:", error);

    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format" });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const updateCohort = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, participants } = req.body;

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res
        .status(404)
        .json({ success: false, error: "Cohort not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (participants !== undefined) updateData.participants = participants;

    const updatedCohort = await Cohort.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedCohort });
  } catch (error) {
    console.error("Error updating cohort:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const deleteCohort = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid cohort ID" });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({ success: false, error: "Cohort not found" });
    }

    await Cohort.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Cohort deleted successfully" });
  } catch (error) {
    console.error("Error deleting cohort:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { createCohort, getAllCohorts, updateCohort, deleteCohort };
