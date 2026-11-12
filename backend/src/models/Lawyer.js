
const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Advocate"
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: ""
    },

    describeUs: {
      type: String,
      trim: true,
      maxlength: 10000,
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

    secondarySpecializations: {
      type: [String],
      default: []
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
      cityState: {
        type: String,
        trim: true,
        default: ""
      },
      year: {
        type: Number,
        min: 1950,
        max: 2100
      },
      certifications: {
        type: String,
        trim: true,
        default: ""
      }
    }],

    internships: [{
      institution: {
        type: String,
        trim: true,
        default: ""
      },
      organization: {
        type: String,
        trim: true,
        default: ""
      },
      role: {
        type: String,
        trim: true,
        default: ""
      },
      duration: {
        type: String,
        trim: true,
        default: ""
      },
      practiceArea: {
        type: String,
        trim: true,
        default: ""
      },
      responsibilities: {
        type: String,
        trim: true,
        default: ""
      },
      description: {
        type: String,
        trim: true,
        default: ""
      }
    }],

    experiences: [{
      organization: {
        type: String,
        trim: true,
        default: ""
      },
      designation: {
        type: String,
        trim: true,
        default: ""
      },
      employmentType: {
        type: String,
        trim: true,
        default: "Full-Time"
      },
      startDate: {
        type: String,
        trim: true,
        default: ""
      },
      endDate: {
        type: String,
        trim: true,
        default: ""
      },
      practiceAreas: {
        type: String,
        trim: true,
        default: ""
      },
      responsibilities: {
        type: String,
        trim: true,
        default: ""
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

    state: {
      type: String,
      trim: true,
      default: ""
    },

    officeAddress: {
      type: String,
      trim: true,
      default: ""
    },

    district: {
      type: String,
      trim: true,
      default: ""
    },

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    hidePhone: {
      type: Boolean,
      default: false
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "additional_info_required",
        "suspended"
      ],
      default: "pending"
    },

    decisionReason: {
      type: String,
      trim: true,
      default: ""
    },

    internalNotes: {
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

    verificationHistory: [
      {
        status: { type: String, required: true },
        decisionReason: { type: String, default: "" },
        internalNotes: { type: String, default: "" },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        reviewedAt: { type: Date, default: Date.now }
      }
    ],

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

    consultationDuration: {
      type: Number,
      enum: [15, 30, 45, 60],
      default: 30
    },

    consultationModes: {
      type: [String],
      default: ["video", "in_person"]
    },

    courtLevels: {
      type: [String],
      enum: ["District Court", "High Court", "Supreme Court", "Tribunal"],
      default: ["District Court", "High Court"]
    },

    practiceCourts: {
      type: [String],
      default: []
    },

    jurisdictions: {
      type: [String],
      default: []
    },

    achievements: {
      type: String,
      trim: true,
      default: ""
    },

    awards: [
      {
        name: {
          type: String,
          trim: true,
          default: ""
        },
        organization: {
          type: String,
          trim: true,
          default: ""
        },
        year: {
          type: Number,
          min: 1900,
          max: 2100
        },
        description: {
          type: String,
          trim: true,
          default: ""
        }
      }
    ],

    website: {
      type: String,
      trim: true,
      default: ""
    },

    memberships: {
      type: String,
      trim: true,
      default: ""
    },

    publications: {
      type: String,
      trim: true,
      default: ""
    },

    isDraft: {
      type: Boolean,
      default: false
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
