const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "document"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    attachment: {
      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        default: null,
      },
      title: { type: String, default: "" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      fileSize: { type: Number, default: 0 },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ appointment: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
