const express = require("express");
const router = express.Router();

const {
  getAdminMetrics,
  getAdminUsers,
  toggleUserStatus,
  getAdminAppointments,
  getAdminPayments,
  processRefund
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes strictly require admin role
router.use(protect, authorize("admin"));

router.get("/metrics", getAdminMetrics);
router.get("/users", getAdminUsers);
router.patch("/users/:userId/status", toggleUserStatus);
router.get("/appointments", getAdminAppointments);
router.get("/payments", getAdminPayments);
router.post("/payments/:paymentId/refund", processRefund);

module.exports = router;
