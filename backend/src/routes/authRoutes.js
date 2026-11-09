const express = require("express");
const rateLimit = require("express-rate-limit");

const {
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
} = require("../controllers/authController");

const validate = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  emailOnlyValidator,
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
  max: process.env.NODE_ENV === "production" ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const remainingMs = resetTime
      ? Math.max(0, new Date(resetTime).getTime() - Date.now())
      : options.windowMs;
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    return res.status(options.statusCode || 429).json({
      success: false,
      message: `Too many OTP verification requests. Please try again after ${remainingMinutes} minutes.`,
    });
  },
});

// ==========================================
// Authentication Routes
// ==========================================

router.post("/register", registerValidator, validate, registerUser);
router.post("/send-email-otp", otpLimiter, emailOnlyValidator, validate, sendEmailOtp);
router.post("/verify-email-otp", otpLimiter, verifyOtpValidator, validate, verifyEmailOtp);
router.post("/resend-email-otp", otpLimiter, emailOnlyValidator, validate, resendEmailOtp);
router.post("/login", loginLimiter, loginValidator, validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

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