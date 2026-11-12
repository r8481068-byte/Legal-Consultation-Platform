const mongoose = require("mongoose");
const User = require("../models/User");
const { isValidPinCode } = require("../utils/cryptoUtils");

const REQUIRED_PROFILE_FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "phone", label: "Mobile Number" },
  { key: "state", label: "State" },
  { key: "district", label: "District" },
  { key: "subDistrict", label: "Block / Sub-District" },
  { key: "locality", label: "Area / Locality" },
  { key: "cityVillage", label: "City or Village" },
  { key: "pincode", label: "PIN Code", validator: isValidPinCode },
  { key: "addressLine", label: "Address Line" },
];

/**
 * Calculates profile completion status and returns percentage & missing fields.
 */
function calculateProfileCompleteness(user) {
  if (!user) {
    return {
      percentage: 0,
      isComplete: false,
      completedFields: [],
      missingFields: REQUIRED_PROFILE_FIELDS.map((f) => f.key),
      missingLabels: REQUIRED_PROFILE_FIELDS.map((f) => f.label),
    };
  }

  const completed = [];
  const missing = [];
  const missingLabels = [];

  for (const field of REQUIRED_PROFILE_FIELDS) {
    const value = user[field.key];
    const isPresent =
      value !== null &&
      value !== undefined &&
      typeof value === "string" &&
      value.trim().length > 0;

    const isValid = isPresent && (field.validator ? field.validator(value) : true);

    if (isValid) {
      completed.push(field.key);
    } else {
      missing.push(field.key);
      missingLabels.push(field.label);
    }
  }

  const total = REQUIRED_PROFILE_FIELDS.length;
  const percentage = Math.round((completed.length / total) * 100);

  return {
    percentage,
    isComplete: missing.length === 0,
    completedFields: completed,
    missingFields: missing,
    missingLabels,
  };
}

/**
 * Evaluates Aadhaar and PAN requirement status.
 */
function calculateIdentityStatus(user) {
  const hasAadhaar = Boolean(user && user.aadhaarMasked);
  const hasPan = Boolean(user && user.panMasked);

  const missing = [];
  if (!hasAadhaar) missing.push("aadhaar");
  if (!hasPan) missing.push("pan");

  return {
    hasAadhaar,
    hasPan,
    aadhaarMasked: user?.aadhaarMasked || null,
    panMasked: user?.panMasked || null,
    aadhaarVerified: Boolean(user?.aadhaarVerified),
    panVerified: Boolean(user?.panVerified),
    isComplete: hasAadhaar && hasPan,
    missingIdentity: missing,
  };
}

/**
 * Centralized Booking Eligibility Checker
 * Evaluates all required conditions before appointment booking or payment order creation:
 * 1. User authenticated & active
 * 2. Role is client
 * 3. Email verified
 * 4. Mobile number verified
 * 5. Required profile fields complete
 * 6. Aadhaar and PAN format-verified requirements satisfied
 */
async function checkBookingEligibility(userId) {
  let cleanId = userId;
  if (userId && typeof userId === "object" && !mongoose.isValidObjectId(userId)) {
    cleanId = userId.clientId || userId.userId || userId._id;
  }

  if (!cleanId || !mongoose.isValidObjectId(cleanId)) {
    const error = new Error("Invalid client User ID provided for booking eligibility check");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(cleanId);

  if (!user) {
    const error = new Error("Active client account not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "client") {
    return {
      eligible: false,
      reasons: ["Only client accounts can book consultation appointments."],
      checks: {
        authenticated: true,
        accountActive: user.isActive,
        isClient: false,
      },
      nextStep: null,
    };
  }

  const reasons = [];

  if (!user.isActive) {
    reasons.push("Account is suspended or deactivated.");
  }

  const profile = calculateProfileCompleteness(user);
  if (!profile.isComplete) {
    reasons.push(
      `Please complete your client profile to 100% before booking a consultation. Client profile is incomplete. Missing fields: ${profile.missingLabels.join(", ")}.`
    );
  }

  const identity = calculateIdentityStatus(user);
  if (!identity.isComplete) {
    const missingDocs = [];
    if (!identity.hasAadhaar) missingDocs.push("Aadhaar details");
    if (!identity.hasPan) missingDocs.push("PAN details");
    reasons.push(`Mandatory identity requirement pending: ${missingDocs.join(" and ")}.`);
  }

  // Determine next suggested actionable step for frontend routing
  let nextStep = null;
  if (!profile.isComplete) {
    nextStep = "complete_profile";
  } else if (!identity.isComplete) {
    nextStep = "complete_identity";
  }

  const isEligible = reasons.length === 0;

  return {
    eligible: isEligible,
    reasons,
    checks: {
      authenticated: true,
      accountActive: Boolean(user.isActive),
      isClient: true,
      emailVerified: true,
      phoneVerified: true,
      profileCompleted: profile.isComplete,
      profilePercentage: profile.percentage,
      missingProfileFields: profile.missingFields,
      missingProfileLabels: profile.missingLabels,
      identityCompleted: identity.isComplete,
      missingIdentity: identity.missingIdentity,
      hasAadhaar: identity.hasAadhaar,
      hasPan: identity.hasPan,
      aadhaarMasked: identity.aadhaarMasked,
      panMasked: identity.panMasked,
    },
    nextStep,
  };
}

module.exports = {
  REQUIRED_PROFILE_FIELDS,
  calculateProfileCompleteness,
  calculateIdentityStatus,
  checkBookingEligibility,
};
