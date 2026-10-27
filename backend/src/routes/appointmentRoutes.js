const express = require("express");

const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getLawyerAppointments,
  confirmAppointment,
  completeAppointment,
  rejectAppointment,
  getBookingEligibility,
} = require("../controllers/appointmentController");

const {
  validateBookAppointment,
  validateAppointmentId,
} = require("../validators/appointmentValidator");

const validateRequest = require("../middleware/validationMiddleware");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==================== CLIENT ROUTES ====================

// Check client booking eligibility
router.get(
  "/eligibility",
  protect,
  authorize("client"),
  getBookingEligibility
);

// Book appointment
router.post(
  "/",
  protect,
  authorize("client"),
  validateBookAppointment,
  validateRequest,
  bookAppointment
);

// Get logged-in client's appointments
router.get(
  "/my",
  protect,
  authorize("client"),
  getMyAppointments
);

// Cancel appointment
router.patch(
  "/:appointmentId/cancel",
  protect,
  authorize("client"),
  validateAppointmentId,
  validateRequest,
  cancelAppointment
);

// ==================== LAWYER ROUTES ====================

// Get logged-in lawyer's appointments
router.get(
  "/lawyer/my",
  protect,
  authorize("lawyer"),
  getLawyerAppointments
);

router.get(
  "/lawyer",
  protect,
  authorize("lawyer"),
  getLawyerAppointments
);

// Confirm appointment
router.patch(
  "/:appointmentId/confirm",
  protect,
  authorize("lawyer"),
  validateAppointmentId,
  validateRequest,
  confirmAppointment
);


// complete appointemet


router.patch(
  "/:appointmentId/complete",
  protect,
  authorize("lawyer"),
  validateAppointmentId,
  validateRequest,
  completeAppointment
);




// Reject appointment
router.patch(
  "/:appointmentId/reject",
  protect,
  authorize("lawyer"),
  validateAppointmentId,
  validateRequest,
  rejectAppointment
);

// ==================== VIDEO CONSULTATION ====================

const { getVideoAccess, endConsultationCall } = require("../controllers/appointmentController");

// Access video consultation room (Client, Lawyer, Admin)
router.get(
  "/:appointmentId/video-access",
  protect,
  validateAppointmentId,
  validateRequest,
  getVideoAccess
);

// End consultation call (Client, Lawyer, Admin)
router.post(
  "/:appointmentId/end-call",
  protect,
  validateAppointmentId,
  validateRequest,
  endConsultationCall
);

module.exports = router;
