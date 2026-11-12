const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1, // Amount is stored in paise
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "refund_pending",
      ],
      default: "created",
      required: true,
    },

    failureReason: {
      type: String,
      default: "",
      maxlength: 500,
    },

    refundId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    orderInProgress: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ client: 1, createdAt: -1 });

// Ensure only one active 'created' payment order can exist per appointment across instances
paymentSchema.index(
  { appointment: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "created" },
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
