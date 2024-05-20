const Session = require("../models/sessionSchema");
const mongoose = require("mongoose");
const Cohort = require("../models/cohortSchema");

const createSession = async (req, res) => {
  try {
    const { name, cohort, activity, date } = req.body;

    if (!name || !cohort || !activity || !date) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const newSession = new Session({ name, activity, cohort, date });
    const session = await newSession.save();
    console.log(session);

    const existCohort = await Cohort.findById(cohort);
    console.log(existCohort);

    existCohort.sessions.push(session._id);

    await existCohort.save();

    return res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error creating session:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid page or limit value" });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const sessions = await Session.find()
      .populate({
        path: "cohort",
        model: "Cohort",
        populate: {
          path: "participants",
          model: "Participant",
        },
      })
      .populate({ path: "activity", model: "Activity" })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({ success: true, message: sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);

    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format" });
    }

    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

module.exports = { createSession, getAllSessions };
