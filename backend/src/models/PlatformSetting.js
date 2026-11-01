const mongoose = require("mongoose");

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global_config",
    },
    platformFeePercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "LegalConnect is currently undergoing scheduled maintenance. Please check back shortly.",
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    autoApproveReviews: {
      type: Boolean,
      default: true,
    },
    minConsultationFee: {
      type: Number,
      default: 100,
    },
    maxConsultationFee: {
      type: Number,
      default: 50000,
    },
    supportEmail: {
      type: String,
      default: "support@legalconnect.in",
    },
    supportPhone: {
      type: String,
      default: "+91 88266 69309",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSetting", platformSettingSchema);
