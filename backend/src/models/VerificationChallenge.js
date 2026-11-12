const mongoose = require("mongoose");

const verificationChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["email_verification", "phone_verification"],
      default: "email_verification",
      required: true,
    },

    destination: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    resendCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    pendingRegistration: {
      name: {
        type: String,
        trim: true,
        default: null,
      },
      phone: {
        type: String,
        trim: true,
        default: null,
      },
      role: {
        type: String,
        enum: ["client", "lawyer"],
        default: "client",
      },
      passwordEncrypted: {
        type: String,
        default: null,
        select: false,
      },
      lawyerData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

verificationChallengeSchema.index({
  destination: 1,
  purpose: 1,
  consumedAt: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "VerificationChallenge",
  verificationChallengeSchema
);
