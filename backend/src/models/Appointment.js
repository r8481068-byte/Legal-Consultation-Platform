
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true
    },


    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LawyerAvailability",
      required: false,
      default: null,
    },

    isPreferredTime: {
      type: Boolean,
      default: false,
    },

    isFlexibleTime: {
      type: Boolean,
      default: false,
    },

    preferredDate: {
      type: String,
      default: "",
    },

    preferredTime: {
      type: String,
      default: "",
    },

    scheduledAt: {
      type: Date,
      required: true
    },

    durationMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 120
    },

    consultationType: {
      type: String,
      enum: ["video", "chat", "both", "in-person"],
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "rejected"
      ],
      default: "pending"
    },

    fee: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    meetingRoomId: {
      type: String,
      default: null,
      sparse: true
    },

    callStartedAt: {
      type: Date,
      default: null
    },

    callEndedAt: {
      type: Date,
      default: null
    },

    isReviewed: {
      type: Boolean,
      default: false
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["client", "lawyer", "admin", null],
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ lawyer: 1, scheduledAt: 1 });
appointmentSchema.index({ client: 1, scheduledAt: -1 });

appointmentSchema.index(
  { slot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slot: { $type: "objectId" },
      status: { $in: ["pending", "confirmed"] },
    },
  }
);


const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

module.exports = Appointment;
