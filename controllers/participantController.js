const Participant = require("../models/participantSchema");
const { validateData } = require("../validator/validator");
const logger = require("../log/logger");

const createParticipant = async (req, res) => {
  try {
    const errors = validateData(req.body);
    if (errors) {
      return res.status(400).json({ success: false, errors });
    }

    const participantData = req.body;
    const email = participantData.email;
    const existingParticipant = await Participant.findOne({ email });

    if (existingParticipant) {
      return res
        .status(409)
        .json({ success: false, error: "User with this email already exists" });
    }

    const newParticipant = new Participant(participantData);
    const savedParticipant = await newParticipant.save();
    res.status(201).json({
      success: true,
      message: "Participant added successfully",
      data: savedParticipant,
    });
  } catch (error) {
    if (error.message.includes("User with this email already exists")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    logger.error("Error creating participant:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getAllParticipants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const participants = await Participant.find().skip(skip).limit(limit);
    const totalParticipants = await Participant.countDocuments();
    const totalPages = Math.ceil(totalParticipants / limit);

    if (participants.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No participants found" });
    }

    res.status(200).json({
      success: true,
      message: participants,
      currentPage: page,
      totalPages,
      totalParticipants,
    });
  } catch (error) {
    logger.error("Error fetching participants:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const searchParticipantsByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid name parameter" });
    }

    const participants = await Participant.find({
      name: { $regex: new RegExp(name, "i") },
    });

    if (participants.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No participants found" });
    }

    res.status(200).json({ success: true, message: participants });
  } catch (error) {
    logger.error("Error searching participants by name:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const participantData = req.body;

    const existingParticipant = await Participant.findById(id);

    if (!existingParticipant) {
      return res
        .status(404)
        .json({ success: false, error: "Participant not found" });
    }

    const updatedParticipant = await Participant.findByIdAndUpdate(
      id,
      participantData,
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedParticipant });
  } catch (error) {
    logger.error("Error updating participant:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  createParticipant,
  getAllParticipants,
  searchParticipantsByName,
  updateParticipant,
};
