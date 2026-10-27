
const mongoose = require("mongoose");

const verificationChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    purpose: {
      type: String,
      enum: ["email_verification", "phone_verification"],
      required: true
    },

    destination: {
      type: String,
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      select: false
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1
    },

    resendCount: {
      type: Number,
      default: 0,
      min: 0
    },

    lastSentAt: {
      type: Date,
      default: Date.now
    },

    consumedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

verificationChallengeSchema.index({
  user: 1,
  purpose: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "VerificationChallenge",
  verificationChallengeSchema
);
