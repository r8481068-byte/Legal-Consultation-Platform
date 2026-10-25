
// const { body, param } = require("express-validator");

// const validateBookAppointment = [
//   body("lawyerId")
//     .isMongoId()
//     .withMessage("A valid lawyer ID is required"),

//   body("scheduledAt")
//     .isISO8601()
//     .withMessage("A valid appointment date is required")
//     .toDate()
//     .custom((value) => {
//       if (new Date(value) <= new Date()) {
//         throw new Error("Appointment date must be in the future");
//       }
//       return true;
//     }),

//   body("consultationType")
//     .isIn(["video", "in-person"])
//     .withMessage("Consultation type must be video or in-person"),

//   body("notes")
//     .optional()
//     .isString()
//     .withMessage("Notes must be text")
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage("Notes cannot exceed 1000 characters"),
// ];

// const validateAppointmentId = [
 
// body("slotId")
//   .isMongoId()
//   .withMessage("A valid availability slot ID is required"),

// ];

// module.exports = {
//   validateBookAppointment,
//   validateAppointmentId,
// };





const { body, param } = require("express-validator");

const validateBookAppointment = [
  body("slotId")
    .isMongoId()
    .withMessage("A valid availability slot ID is required"),

  body("consultationType")
    .isIn(["video", "in-person"])
    .withMessage("Consultation type must be video or in-person"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be text")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

const validateAppointmentId = [
  param("appointmentId")
    .isMongoId()
    .withMessage("A valid appointment ID is required"),
];

module.exports = {
  validateBookAppointment,
  validateAppointmentId,
};
