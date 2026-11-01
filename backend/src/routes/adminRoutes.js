const express = require("express");
const router = express.Router();

const {
  getAdminMetrics,
  getAdminAnalytics,
  getAdminRecentActivity,
  getAdminClients,
  getAdminClientDetail,
  toggleClientBlock,
  getAdminLawyers,
  getAdminLawyerDetail,
  toggleLawyerBlock,
  getAdminVerifications,
  updateLawyerVerification,
  getAdminAppointments,
  getAdminAppointmentDetail,
  cancelAdminAppointment,
  getAdminReviews,
  moderateAdminReview,
  getAdminPayments,
  getAdminPaymentDetail,
  processRefund,
  getAdminComplaints,
  getAdminComplaintDetail,
  updateAdminComplaint,
  createComplaint,
  getAdminNotifications,
  broadcastNotification,
  getAdminReports,
  getAdminActivityLogs,
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  updatePlatformSettings,
  getAdminUsers,
  toggleUserStatus
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes strictly require authentication and admin role
router.use(protect, authorize("admin"));

// 1. Dashboard
router.get("/metrics", getAdminMetrics);
router.get("/analytics", getAdminAnalytics);
router.get("/recent-activity", getAdminRecentActivity);

// 2. Clients
router.get("/clients", getAdminClients);
router.get("/clients/:clientId", getAdminClientDetail);
router.patch("/clients/:clientId/block", toggleClientBlock);

// 3. Lawyers
router.get("/lawyers", getAdminLawyers);
router.get("/lawyers/:lawyerId", getAdminLawyerDetail);
router.patch("/lawyers/:lawyerId/block", toggleLawyerBlock);
router.patch("/lawyers/:lawyerId/verification", updateLawyerVerification);

// 4. Verification Management
router.get("/verifications", getAdminVerifications);
router.patch("/verifications/:lawyerId", updateLawyerVerification);

// 5. Appointments
router.get("/appointments", getAdminAppointments);
router.get("/appointments/:appointmentId", getAdminAppointmentDetail);
router.patch("/appointments/:appointmentId/cancel", cancelAdminAppointment);

// 6. Reviews
router.get("/reviews", getAdminReviews);
router.patch("/reviews/:reviewId/moderate", moderateAdminReview);

// 7. Payments & Refunds
router.get("/payments", getAdminPayments);
router.get("/payments/:paymentId", getAdminPaymentDetail);
router.post("/payments/:paymentId/refund", processRefund);

// 8. Complaints
router.get("/complaints", getAdminComplaints);
router.post("/complaints", createComplaint);
router.get("/complaints/:complaintId", getAdminComplaintDetail);
router.patch("/complaints/:complaintId", updateAdminComplaint);

// 9. Notifications
router.get("/notifications", getAdminNotifications);
router.post("/notifications/broadcast", broadcastNotification);

// 10. Reports
router.get("/reports", getAdminReports);

// 11. Activity Logs
router.get("/activity-logs", getAdminActivityLogs);

// 12. Settings
router.get("/settings", getAdminSettings);
router.put("/settings/profile", updateAdminProfile);
router.put("/settings/password", changeAdminPassword);
router.put("/settings/platform", updatePlatformSettings);

// Backward-compatible routes
router.get("/users", getAdminUsers);
router.patch("/users/:userId/status", toggleUserStatus);

module.exports = router;
