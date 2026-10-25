
const mongoose = require("mongoose");

const lawyerAvailabilitySchema = new mongoose.Schema(
  {
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
    },
  },
  { timestamps: true }
);

// A lawyer cannot have two slots with the same start time.
lawyerAvailabilitySchema.index(
  { lawyer: 1, startAt: 1 },
  { unique: true }
);

lawyerAvailabilitySchema.index({ lawyer: 1, status: 1, startAt: 1 });

module.exports = mongoose.model(
  "LawyerAvailability",
  lawyerAvailabilitySchema
);
