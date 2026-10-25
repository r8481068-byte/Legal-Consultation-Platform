
const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    specialization: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one specialization is required"
      }
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 70
    },

    education: [{
      degree: {
        type: String,
        required: true,
        trim: true
      },
      institution: {
        type: String,
        required: true,
        trim: true
      },
      year: {
        type: Number,
        min: 1950,
        max: 2100
      }
    }],

    barCouncilId: {
      type: String,
      required: true,
      trim: true
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },

    languages: {
      type: [String],
      default: ["English"]
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "additional_info_required"],
      default: "pending"
    },

    decisionReason: {
      type: String,
      trim: true,
      default: ""
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    stateOfEnrolment: {
      type: String,
      trim: true,
      default: ""
    },

    lawCollege: {
      type: String,
      trim: true,
      default: ""
    },

    graduationYear: {
      type: Number,
      default: null
    },

    consultationModes: {
      type: [String],
      default: ["video", "in_person"]
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },

    verificationDocuments: [
      {
        title: { type: String, default: "Bar Council Certificate" },
        url: { type: String, required: true },
        documentType: {
          type: String,
          enum: ["bar_certificate", "identity_proof", "degree_certificate", "supporting_doc", "other"],
          default: "bar_certificate"
        },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

lawyerSchema.index({
  specialization: 1,
  city: 1,
  consultationFee: 1
});

const Lawyer = mongoose.model("Lawyer", lawyerSchema);

module.exports = Lawyer;
