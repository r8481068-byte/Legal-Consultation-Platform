

const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const validate = require("../middleware/validationMiddleware");

const {
    registerValidator,
    loginValidator
} = require("../validators/authValidator");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: process.env.NODE_ENV === "production" ? 5 : 50, // 5 failed attempts in production, 50 in development
    skipSuccessfulRequests: true, // Only count failed attempts to prevent locking out valid logins
    standardHeaders: true, // Returns standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
    legacyHeaders: false, // Disables deprecated X-RateLimit-* headers
    handler: (req, res, next, options) => {
        const resetTime = req.rateLimit?.resetTime;
        const remainingMs = resetTime
            ? Math.max(0, new Date(resetTime).getTime() - Date.now())
            : options.windowMs;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const retryAfterSeconds = Math.ceil(remainingMs / 1000);

        const timeMsg = remainingMinutes > 1
            ? `${remainingMinutes} minutes`
            : `${Math.max(1, retryAfterSeconds)} seconds`;

        return res.status(options.statusCode || 429).json({
            success: false,
            message: `Too many login attempts, please try again later. Try again in ${timeMsg}.`,
            retryAfter: retryAfterSeconds
        });
    }
});

router.post(
    "/register",
    registerValidator,
    validate,
    registerUser
);

router.post(
    "/login",
    loginLimiter,
    loginValidator,
    validate,
    loginUser
);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// Profile and settings routes
const { protect } = require("../middleware/authMiddleware");
const { getCurrentUser, updateProfile, changePassword } = require("../controllers/authController");

router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;