
const {
  createPaymentOrderService,
  verifyPaymentService,
} = require("../services/paymentService");

// Create Razorpay order
const createPaymentOrder = async (req, res, next) => {
  try {
    const clientId = req.user?._id || req.user?.id;

    if (!clientId) {
      const error = new Error(
        "User ID missing from authentication middleware"
      );
      error.statusCode = 401;
      throw error;
    }

    const result = await createPaymentOrderService(
      clientId,
      req.body.appointmentId
    );

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay payment
const verifyPayment = async (req, res, next) => {
  try {
    const clientId = req.user?._id || req.user?.id;

    if (!clientId) {
      const error = new Error(
        "User ID missing from authentication middleware"
      );
      error.statusCode = 401;
      throw error;
    }

    const result = await verifyPaymentService(
      clientId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        paymentId: result.paymentId,
        status: result.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const { handleRazorpayWebhookService } = require("../services/paymentService");
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await handleRazorpayWebhookService(rawBody, signature);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getPaymentReceipt = async (req, res, next) => {
  try {
    const { getPaymentReceiptService } = require("../services/paymentService");
    const payment = await getPaymentReceiptService(
      req.user.userId,
      req.user.role,
      req.params.paymentId
    );

    return res.status(200).json({
      success: true,
      receipt: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentReceipt
};

