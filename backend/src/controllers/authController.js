const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

const {
    generateAccessToken
} = require("../utils/token");

const {
  registerUserService,
  loginUserService
} = require("../services/authService");


// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res, next) => {
  try {
    const user = await registerUserService(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
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
      ...result
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
        message: "Refresh token is required"
      });
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshToken
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {

      await RefreshToken.deleteOne({
        _id: storedToken._id
      });

      return res.status(401).json({
        success: false,
        message: "Refresh token expired"
      });
    }

    // Find user
    const user = await User.findById(storedToken.user);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is not active"
      });
    }

    // Generate new access token
    const {
      generateAccessToken
    } = require("../utils/token");

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken
    });

  } catch (error) {

    console.error("Refresh token error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
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
        message: "Refresh token is required"
      });
    }

    await RefreshToken.deleteOne({
      token: refreshToken
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {

    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({
      email
    });

    /*
     Security:
     Don't reveal whether an email
     exists in the database.
    */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If the email exists, a password reset link has been sent"
      });
    }

    // Generate secure random reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Token expires after 15 minutes
    user.resetPasswordToken = resetToken;

    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    /*
     Development only.
     Later this token will be sent through email.
    */

    console.log(
      "Password reset token:",
      resetToken
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset instructions generated"
    });

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {

    const {
      token,
      password
    } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Token and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters"
      });
    }

    // Find user with valid and non-expired token
    const user = await User.findOne({
      resetPasswordToken: token,

      resetPasswordExpires: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset token"
      });
    }

    // Update password
    user.password = password;

    // Remove reset token after successful reset
    user.resetPasswordToken = null;

    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful"
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { getUserProfileService } = require("../services/authService");
    const user = await getUserProfileService(req.user.userId);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { updateUserProfileService } = require("../services/authService");
    const user = await updateUserProfileService(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { changePasswordService } = require("../services/authService");
    const result = await changePasswordService(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// EXPORTS

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword
};