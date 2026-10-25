
// const express = require("express");
// const router = express.Router();

// const { protect, authorize } = require("../middleware/authMiddleware");
// const {
//   createPaymentOrder,
//    verifyPayment,
// } = require("../controllers/paymentController");
// const {
//   createPaymentOrderValidator,
//   verifyPaymentValidator,
// } = require("../validators/paymentValidator");

// // IMPORTANT: Your middleware is exported directly.
// const validateRequest = require("../middleware/validationMiddleware");



// router.post(
//   "/order",
//   protect,
//   authorize("client"),
//   createPaymentOrderValidator,
//   validateRequest,
//   createPaymentOrder
// );


// router.post(
//   "/verify",
//   protect,
//   authorize("client"),
//   verifyPaymentValidator,
//   validateRequest,
//   verifyPayment
// );

// module.exports = router;




const express = require("express");
const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const {
  createPaymentOrderValidator,
  verifyPaymentValidator,
} = require("../validators/paymentValidator");

// Validation middleware is exported directly.
const validateRequest = require("../middleware/validationMiddleware");

// Create Razorpay order
router.post(
  "/order",
  protect,
  authorize("client"),
  createPaymentOrderValidator,
  validateRequest,
  createPaymentOrder
);

// Verify Razorpay payment signature
router.post(
  "/verify",
  protect,
  authorize("client"),
  verifyPaymentValidator,
  validateRequest,
  verifyPayment
);

// Payment receipt
const { getPaymentReceipt, handleWebhook } = require("../controllers/paymentController");

router.get("/receipt/:paymentId", protect, getPaymentReceipt);

// Razorpay Webhook endpoint
router.post("/webhook", handleWebhook);

module.exports = router;
