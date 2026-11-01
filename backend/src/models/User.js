const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["client", "lawyer", "admin"],
      default: "client"
    },

    phone: {
      type: String,
      trim: true
    },

    profileImage: {
      type: String,
      default: null
    },

    about: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    gender: {
      type: String,
      trim: true,
      enum: ["male", "female", "other", "prefer_not_to_say", null, ""],
      default: null
    },

    dob: {
      type: Date,
      default: null
    },

    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },

    // Client Profile Details
    state: {
      type: String,
      trim: true,
      default: null
    },
    district: {
      type: String,
      trim: true,
      default: null
    },
    subDistrict: {
      type: String,
      trim: true,
      default: null
    },
    locality: {
      type: String,
      trim: true,
      default: null
    },
    cityVillage: {
      type: String,
      trim: true,
      default: null
    },
    pincode: {
      type: String,
      trim: true,
      default: null
    },
    addressLine: {
      type: String,
      trim: true,
      default: null
    },

    // Sensitive Identity Information (Encrypted at rest, never logged, never returned in plain queries)
    aadhaarMasked: {
      type: String,
      default: null
    },
    aadhaarEncrypted: {
      type: String,
      default: null,
      select: false
    },
    aadhaarVerified: {
      type: Boolean,
      default: false
    },
    panMasked: {
      type: String,
      default: null
    },
    panEncrypted: {
      type: String,
      default: null,
      select: false
    },
    panVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },
    blockReason: {
      type: String,
      trim: true,
      default: null
    },
    blockedAt: {
      type: Date,
      default: null
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    unblockedAt: {
      type: Date,
      default: null
    },
    unblockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);

module.exports = User;