
const express = require("express");
const {
  createAvailabilitySlot,
  getAvailableSlots,
} = require("../controllers/availabilityController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validationMiddleware");

const router = express.Router();

// Lawyer creates a 30-minute availability slot.
router.post(
  "/",
  protect,
  authorize("lawyer"),
  body("startAt")
    .isISO8601()
    .withMessage("A valid ISO date is required")
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Slot must be in the future");
      }
      return true;
    }),
  validateRequest,
  createAvailabilitySlot
);

// Lawyer views their own slots (including past / booked)
const { getMySlots, deleteAvailabilitySlot } = require("../controllers/availabilityController");

router.get(
  "/my/slots",
  protect,
  authorize("lawyer"),
  getMySlots
);

// Lawyer deletes an available (unbooked) slot
router.delete(
  "/:slotId",
  protect,
  authorize("lawyer"),
  param("slotId").isMongoId().withMessage("Invalid slot ID"),
  validateRequest,
  deleteAvailabilitySlot
);

// Clients can view an approved lawyer's available slots.
router.get(
  "/:lawyerId",
  param("lawyerId").isMongoId().withMessage("Invalid lawyer ID"),
  validateRequest,
  getAvailableSlots
);

module.exports = router;
