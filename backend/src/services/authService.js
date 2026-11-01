const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");
const {
  normalizeEmail,
  normalizeIndianMobile,
  encryptSensitive,
  maskAadhaar,
  maskPAN,
  isValidPinCode,
  isValidAadhaar,
  isValidPAN,
} = require("../utils/cryptoUtils");
const {
  calculateProfileCompleteness,
  calculateIdentityStatus,
} = require("./eligibilityService");

/**
 * Registers a new user (Client or Lawyer).
 * Validates, normalizes email and Indian phone number, and disallows admin role.
 */
const registerUserService = async ({
  name,
  email,
  password,
  phone,
  role = "client",
}) => {
  // Prevent self-registration as admin
  const assignedRole = role === "lawyer" ? "lawyer" : "client";

  const cleanName = name.trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizeIndianMobile(phone);

  if (!normalizedEmail) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedPhone) {
    const error = new Error("A valid 10-digit Indian mobile number is required");
    error.statusCode = 400;
    throw error;
  }

  // Check email uniqueness
  const existingEmailUser = await User.findOne({ email: normalizedEmail });
  if (existingEmailUser) {
    const error = new Error("An account with this email address already exists");
    error.statusCode = 409;
    throw error;
  }

  // Check phone uniqueness
  const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
  if (existingPhoneUser) {
    const error = new Error("An account with this mobile number already exists");
    error.statusCode = 409;
    throw error;
  }

  // Create user account
  const user = await User.create({
    name: cleanName,
    email: normalizedEmail,
    password, // Handled by pre-save bcrypt hook in User.js
    phone: normalizedPhone,
    role: assignedRole,
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    isActive: true,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: true,
    phoneVerified: true,
    message: "Registration successful! You can now log in.",
  };
};

/**
 * Logins an existing user.
 * Issues sessions directly without requiring OTP verification.
 */
const loginUserService = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account has been deactivated or suspended");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate tokens for verified users
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      isVerified: Boolean(user.isVerified),
    },
  };
};

/**
 * Retrieves public/authenticated profile details without sensitive encrypted fields.
 */
const getUserProfileService = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -__v -aadhaarEncrypted -panEncrypted")
    .lean();

  if (!user || !user.isActive) {
    const error = new Error("User account not found or inactive");
    error.statusCode = 404;
    throw error;
  }

  const completeness = calculateProfileCompleteness(user);
  const identityStatus = calculateIdentityStatus(user);

  return {
    ...user,
    completeness,
    identityStatus,
  };
};

/**
 * Updates basic profile info (name, phone, profileImage, about, gender, dob) and address fields.
 */
const updateUserProfileService = async (userId, data) => {
  const allowedUpdates = [
    "name",
    "phone",
    "profileImage",
    "about",
    "gender",
    "dob",
    "state",
    "district",
    "subDistrict",
    "locality",
    "cityVillage",
    "pincode",
    "addressLine",
  ];
  const updates = {};

  for (const field of allowedUpdates) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  delete updates.role;
  delete updates.email;
  delete updates.password;

  if (updates.about !== undefined) {
    updates.about = typeof updates.about === "string" ? updates.about.trim().slice(0, 1000) : "";
  }

  if (updates.gender !== undefined) {
    const validGenders = ["male", "female", "other", "prefer_not_to_say", null, ""];
    if (!validGenders.includes(updates.gender)) {
      updates.gender = null;
    }
  }

  if (updates.dob !== undefined) {
    if (updates.dob) {
      const parsedDate = new Date(updates.dob);
      updates.dob = isNaN(parsedDate.getTime()) ? null : parsedDate;
    } else {
      updates.dob = null;
    }
  }

  if (updates.phone) {
    const normalized = normalizeIndianMobile(updates.phone);
    if (!normalized) {
      const error = new Error("Please enter a valid 10-digit Indian mobile number");
      error.statusCode = 400;
      throw error;
    }
    updates.phone = normalized;
  }

  if (updates.state !== undefined) {
    updates.state = typeof updates.state === "string" && updates.state.trim() ? updates.state.trim() : null;
  }
  if (updates.district !== undefined) {
    updates.district = typeof updates.district === "string" && updates.district.trim() ? updates.district.trim() : null;
  }
  if (updates.subDistrict !== undefined) {
    updates.subDistrict = typeof updates.subDistrict === "string" && updates.subDistrict.trim() ? updates.subDistrict.trim() : null;
  }
  if (updates.locality !== undefined) {
    updates.locality = typeof updates.locality === "string" && updates.locality.trim() ? updates.locality.trim() : null;
  }
  if (updates.cityVillage !== undefined) {
    updates.cityVillage = typeof updates.cityVillage === "string" && updates.cityVillage.trim() ? updates.cityVillage.trim() : null;
  }
  if (updates.addressLine !== undefined) {
    updates.addressLine = typeof updates.addressLine === "string" && updates.addressLine.trim() ? updates.addressLine.trim() : null;
  }
  if (updates.pincode !== undefined) {
    if (updates.pincode && typeof updates.pincode === "string" && updates.pincode.trim()) {
      const pin = updates.pincode.trim();
      if (!isValidPinCode(pin)) {
        const error = new Error("Please enter a valid 6-digit Indian PIN code");
        error.statusCode = 400;
        throw error;
      }
      updates.pincode = pin;
    } else {
      updates.pincode = null;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -__v -aadhaarEncrypted -panEncrypted");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const completeness = calculateProfileCompleteness(user);
  const identityStatus = calculateIdentityStatus(user);

  return {
    ...user.toObject(),
    completeness,
    identityStatus,
  };
};

/**
 * Updates client address fields and validates Indian PIN code.
 */
const updateClientAddressService = async (userId, data) => {
  const {
    state,
    district,
    subDistrict,
    locality,
    cityVillage,
    pincode,
    addressLine,
  } = data;

  if (pincode && !isValidPinCode(pincode)) {
    const error = new Error("Please enter a valid 6-digit Indian PIN code");
    error.statusCode = 400;
    throw error;
  }

  const updates = {};
  if (state !== undefined) updates.state = state ? state.trim() : null;
  if (district !== undefined) updates.district = district ? district.trim() : null;
  if (subDistrict !== undefined) updates.subDistrict = subDistrict ? subDistrict.trim() : null;
  if (locality !== undefined) updates.locality = locality ? locality.trim() : null;
  if (cityVillage !== undefined) updates.cityVillage = cityVillage ? cityVillage.trim() : null;
  if (pincode !== undefined) updates.pincode = pincode ? String(pincode).trim() : null;
  if (addressLine !== undefined) updates.addressLine = addressLine ? addressLine.trim() : null;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -__v -aadhaarEncrypted -panEncrypted");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const completeness = calculateProfileCompleteness(user);

  return {
    user,
    completeness,
  };
};

/**
 * Securely stores client Aadhaar and PAN details with AES-256-GCM encryption at rest.
 * Never stores or returns raw values.
 */
const updateClientIdentityService = async (userId, { aadhaar, pan }) => {
  if (!isValidAadhaar(aadhaar)) {
    const error = new Error(
      "Invalid Aadhaar number format. Must be a 12-digit number."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!isValidPAN(pan)) {
    const error = new Error(
      "Invalid PAN format. Must be 10 alphanumeric characters (e.g. ABCDE1234F)."
    );
    error.statusCode = 400;
    throw error;
  }

  const cleanAadhaar = aadhaar.replace(/[\s\-]/g, "");
  const cleanPan = pan.trim().toUpperCase();

  const aadhaarMasked = maskAadhaar(cleanAadhaar);
  const aadhaarEncrypted = encryptSensitive(cleanAadhaar);

  const panMasked = maskPAN(cleanPan);
  const panEncrypted = encryptSensitive(cleanPan);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        aadhaarMasked,
        aadhaarEncrypted,
        aadhaarVerified: false,
        panMasked,
        panEncrypted,
        panVerified: false,
      },
    },
    { new: true }
  ).select("-password -__v -aadhaarEncrypted -panEncrypted");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    message: "Identity details saved and encrypted securely.",
    identityStatus: calculateIdentityStatus(user),
    user: {
      aadhaarMasked,
      panMasked,
      aadhaarVerified: user.aadhaarVerified,
      panVerified: user.panVerified,
    },
  };
};

const changePasswordService = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    const error = new Error("Current and new password are required");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
  updateClientAddressService,
  updateClientIdentityService,
  changePasswordService,
};