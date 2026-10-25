const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // One review per appointment
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    categories: {
      communication: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      clarity: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
    },
    status: {
      type: String,
      enum: ["approved", "hidden", "flagged"],
      default: "approved",
      index: true,
    },
    moderationReason: {
      type: String,
      default: "",
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ lawyer: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
