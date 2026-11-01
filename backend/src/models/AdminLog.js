const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        "CLIENT_BLOCK",
        "CLIENT_UNBLOCK",
        "LAWYER_BLOCK",
        "LAWYER_UNBLOCK",
        "LAWYER_VERIFY_APPROVE",
        "LAWYER_VERIFY_REJECT",
        "LAWYER_VERIFY_STATUS_CHANGE",
        "LAWYER_VERIFY_NOTE_ADDED",
        "APPOINTMENT_CANCEL",
        "PAYMENT_REFUND",
        "REVIEW_MODERATE",
        "COMPLAINT_STATUS_CHANGE",
        "COMPLAINT_RESPONSE_ADDED",
        "BROADCAST_NOTIFICATION",
        "SETTINGS_UPDATE",
        "PASSWORD_CHANGE",
        "PROFILE_UPDATE",
        "REPORT_EXPORT",
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: [
        "User",
        "Client",
        "Lawyer",
        "Appointment",
        "Payment",
        "Review",
        "Complaint",
        "Notification",
        "Settings",
        "Report",
        "System",
      ],
      index: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AdminLog", adminLogSchema);
