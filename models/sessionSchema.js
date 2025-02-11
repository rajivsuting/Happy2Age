const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cohort: {
    type: Schema.Types.ObjectId,
    ref: "Cohort",
    required: true,
  },
  activity: [
    {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
  ],

  date: {
    type: Date,
    required: true,
  },
});

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
