const express = require("express");
const router = express.Router();

const {
  createReview,
  getMyReviews,
  getLawyerReviews,
  getAppointmentReviewStatus,
  adminGetReviews,
  adminModerateReview
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public route: fetch reviews for a lawyer
router.get("/lawyer/:lawyerId", getLawyerReviews);

// Client-only routes
router.post("/", protect, authorize("client"), createReview);
router.get("/my", protect, authorize("client"), getMyReviews);
router.get("/appointment/:appointmentId/status", protect, authorize("client"), getAppointmentReviewStatus);

// Admin-only moderation routes
router.get("/admin/all", protect, authorize("admin"), adminGetReviews);
router.patch("/admin/:reviewId/moderate", protect, authorize("admin"), adminModerateReview);

module.exports = router;
