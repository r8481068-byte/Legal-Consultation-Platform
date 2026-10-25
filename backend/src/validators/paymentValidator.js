
const { body } = require("express-validator");

const createPaymentOrderValidator = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Invalid appointment ID"),
];

const verifyPaymentValidator = [
  body("razorpay_order_id")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Razorpay order ID is required"),

  body("razorpay_payment_id")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Razorpay payment ID is required"),

  body("razorpay_signature")
    .isString()
    .trim()
    .isHexadecimal()
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid Razorpay signature"),
];


module.exports = {
  createPaymentOrderValidator,
  verifyPaymentValidator,
};
