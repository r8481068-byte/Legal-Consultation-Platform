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
  calculateProfileCompleteness,
  calculateIdentityStatus,
} = require("../services/eligibilityService");
const { normalizeEmail } = require("../utils/cryptoUtils");

const {
  verifyEmailOtpService,
  resendEmailOtpService,
  createOrUpdateEmailChallenge,
} = require("../services/verificationService");

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
// EMAIL OTP VERIFICATION ENDPOINTS
// ==========================================

const sendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.emailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified. You can log in directly.",
      });
    }

    const result = await createOrUpdateEmailChallenge({
      email: normalizedEmail,
      name: user ? user.name : "User",
      phone: user ? user.phone : "",
      role: user ? user.role : "client",
      existingUserId: user ? user._id : null,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyEmailOtpService({ email, otp });

    return res.status(200).json({
      success: true,
      message: result.message,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await resendEmailOtpService({ email });

    return res.status(200).json({
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
        message: "User account is not active",
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
  sendEmailOtp,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  updateClientAddress,
  updateClientIdentity,
  getProfileCompletionStatus,
  changePassword,
};