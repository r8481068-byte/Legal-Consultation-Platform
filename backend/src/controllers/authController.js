const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");
const { generateAccessToken } = require("../utils/token");
const {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
  updateClientAddressService,
  updateClientIdentityService,
  changePasswordService,
} = require("../services/authService");
const {
  initiateEmailVerification,
  verifyEmailOtp,
  initiatePhoneVerification,
  verifyPhoneOtp,
  getVerificationStatus,
} = require("../services/verificationService");
const {
  calculateProfileCompleteness,
  calculateIdentityStatus,
} = require("../services/eligibilityService");
const { normalizeEmail } = require("../utils/cryptoUtils");

// Helper to resolve target user ID from auth token or request body
async function resolveUserId(req) {
  if (req.user?.userId || req.user?._id || req.user?.id) {
    return req.user.userId || req.user._id || req.user.id;
  }

  if (req.query?.userId) {
    return req.query.userId;
  }

  if (req.body?.userId) {
    return req.body.userId;
  }

  if (req.body?.email) {
    const user = await User.findOne({
      email: normalizeEmail(req.body.email),
    });
    if (user) return user._id;
  }

  return null;
}

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res, next) => {
  try {
    const result = await registerUserService(req.body);

    return res.status(201).json({
      success: true,
      message: result.message,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res, next) => {
  try {
    const result = await loginUserService(req.body);

    if (result.verificationRequired) {
      return res.status(200).json({
        success: false,
        verificationRequired: true,
        message: result.message,
        user: result.user,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    // Find user
    const user = await User.findById(storedToken.user);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is not active",
      });
    }

    // Security: Unverified accounts cannot bypass verification via refresh
    if (!user.emailVerified || !user.phoneVerified) {
      return res.status(403).json({
        success: false,
        verificationRequired: true,
        message: "Contact verification is required to refresh authentication session",
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// LOGOUT USER
// ==========================================

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// FORGOT & RESET PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset instructions generated",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// CONTACT VERIFICATION ENDPOINTS
// ==========================================

const requestEmailOtp = async (req, res, next) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier or email is required",
      });
    }

    const result = await initiateEmailVerification(targetUserId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtpController = async (req, res, next) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier is required",
      });
    }

    const { otp } = req.body;
    const result = await verifyEmailOtp(targetUserId, otp);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const requestPhoneOtp = async (req, res, next) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier is required",
      });
    }

    const { phone } = req.body;
    const result = await initiatePhoneVerification(targetUserId, phone);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyPhoneOtpController = async (req, res, next) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier is required",
      });
    }

    const { otp } = req.body;
    const result = await verifyPhoneOtp(targetUserId, otp);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getVerificationStatusController = async (req, res, next) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier is required",
      });
    }

    const status = await getVerificationStatus(targetUserId);
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CLIENT PROFILE & IDENTITY ENDPOINTS
// ==========================================

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await getUserProfileService(req.user.userId);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfileService(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateClientAddress = async (req, res, next) => {
  try {
    const result = await updateClientAddressService(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Client address details saved successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const updateClientIdentity = async (req, res, next) => {
  try {
    const result = await updateClientIdentityService(req.user.userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProfileCompletionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileCompleteness = calculateProfileCompleteness(user);
    const identityStatus = calculateIdentityStatus(user);

    return res.status(200).json({
      success: true,
      profileCompleteness,
      identityStatus,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await changePasswordService(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  requestEmailOtp,
  verifyEmailOtp: verifyEmailOtpController,
  requestPhoneOtp,
  verifyPhoneOtp: verifyPhoneOtpController,
  getVerificationStatus: getVerificationStatusController,
  getCurrentUser,
  updateProfile,
  updateClientAddress,
  updateClientIdentity,
  getProfileCompletionStatus,
  changePassword,
};