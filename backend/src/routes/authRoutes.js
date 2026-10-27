const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  requestEmailOtp,
  verifyEmailOtp,
  requestPhoneOtp,
  verifyPhoneOtp,
  getVerificationStatus,
  getCurrentUser,
  updateProfile,
  updateClientAddress,
  updateClientIdentity,
  getProfileCompletionStatus,
  changePassword,
} = require("../controllers/authController");

const validate = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  registerValidator,
  loginValidator,
  otpValidator,
  clientProfileValidator,
  identityValidator,
} = require("../validators/authValidator");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const remainingMs = resetTime
      ? Math.max(0, new Date(resetTime).getTime() - Date.now())
      : options.windowMs;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const retryAfterSeconds = Math.ceil(remainingMs / 1000);

    const timeMsg =
      remainingMinutes > 1
        ? `${remainingMinutes} minutes`
        : `${Math.max(1, retryAfterSeconds)} seconds`;

    return res.status(options.statusCode || 429).json({
      success: false,
      message: `Too many login attempts, please try again later. Try again in ${timeMsg}.`,
      retryAfter: retryAfterSeconds,
    });
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification requests, please try again after 15 minutes.",
  },
});

// ==========================================
// Authentication Routes
// ==========================================

router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginLimiter, loginValidator, validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ==========================================
// Contact Verification Routes (Email & Mobile)
// ==========================================

// Email OTP
router.post("/verify-email/request", otpLimiter, requestEmailOtp);
router.post(
  "/verify-email/confirm",
  otpLimiter,
  otpValidator,
  validate,
  verifyEmailOtp
);

// Mobile OTP
router.post("/verify-phone/request", otpLimiter, requestPhoneOtp);
router.post(
  "/verify-phone/confirm",
  otpLimiter,
  otpValidator,
  validate,
  verifyPhoneOtp
);

// Verification Status
router.get("/verification-status", getVerificationStatus);

// ==========================================
// Profile and Settings Routes
// ==========================================

router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Client Address Profile & Identity Gate
router.get("/profile-completion", protect, getProfileCompletionStatus);
router.put(
  "/client-profile",
  protect,
  clientProfileValidator,
  validate,
  updateClientAddress
);
router.post(
  "/client-identity",
  protect,
  identityValidator,
  validate,
  updateClientIdentity
);

module.exports = router;