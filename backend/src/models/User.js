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

    isVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
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