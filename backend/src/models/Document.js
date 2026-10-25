const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      max: 15 * 1024 * 1024, // 15MB limit
    },
    filePath: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

documentSchema.index({ appointment: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
