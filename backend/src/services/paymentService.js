
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { checkBookingEligibility } = require("./eligibilityService");

const createPaymentOrderService = async (clientId, appointmentId) => {
  // Enforce centralized booking eligibility before initiating payment
  const eligibility = await checkBookingEligibility(clientId);
  if (!eligibility.eligible) {
    const error = new Error(
      `Payment initiation rejected: ${eligibility.reasons.join(" ")}`
    );
    error.statusCode = 403;
    error.code = "BOOKING_INELIGIBLE";
    error.eligibility = eligibility;
    throw error;
  }

  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId)
  .populate({
    path: "lawyer",
    select: "consultationFee verificationStatus isAvailable",
  });

console.log(
  "DEBUG appointment found:",
  appointment ? appointment._id.toString() : null
);
console.log(
  "DEBUG appointment client:",
  appointment?.client?.toString()
);
console.log("DEBUG clientId type:", typeof clientId);

if (!appointment) {
  const error = new Error("Appointment does not exist in database");
  error.statusCode = 404;
  throw error;
}

if (!clientId || appointment.client.toString() !== clientId.toString()) {
  const error = new Error("Appointment does not belong to logged-in client");
  error.statusCode = 403;
  throw error;
}

  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["pending", "confirmed"].includes(appointment.status)) {
    const error = new Error(
      "Payment order can only be created for pending or confirmed appointments"
    );
    error.statusCode = 409;
    throw error;
  }

  if (!appointment.lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    appointment.lawyer.verificationStatus !== "approved" ||
    !appointment.lawyer.isAvailable
  ) {
    const error = new Error("Lawyer is not available for consultation");
    error.statusCode = 409;
    throw error;
  }

  const amount = Math.round(appointment.lawyer.consultationFee * 100);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    const error = new Error("Invalid lawyer consultation fee");
    error.statusCode = 400;
    throw error;
  }

  // If already paid, don't create another payment order.
  const capturedPayment = await Payment.findOne({
    appointment: appointment._id,
    status: "captured",
  });

  if (capturedPayment) {
    const error = new Error("This appointment has already been paid for");
    error.statusCode = 409;
    throw error;
  }

  // Reuse an existing order when the client retries the request.
  let payment = await Payment.findOne({
    appointment: appointment._id,
    client: clientId,
    status: "created",
  });

  if (payment?.razorpayOrderId) {
    return {
      paymentId: payment._id,
      orderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  if (!payment) {
    payment = await Payment.create({
      appointment: appointment._id,
      client: clientId,
      amount,
      currency: "INR",
      status: "created",
    });
  } else {
    // Keep the pending payment amount aligned with the current server fee.
    payment.amount = amount;
    await payment.save();
  }

  try {
    const order = await razorpay.orders.create({
      amount: payment.amount,
      currency: payment.currency,
      receipt: payment._id.toString(),
      notes: {
        appointmentId: appointment._id.toString(),
        clientId: clientId.toString(),
      },
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    return {
      paymentId: payment._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    // Keep the original payment record so a retry can attempt order creation again.
    throw error;
  }
};





// Add this function to your existing paymentService.js
const verifyPaymentService = async (clientId, data) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    const error = new Error("Invalid payment verification details");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findOne({
    client: clientId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!payment) {
    const error = new Error("Payment order not found");
    error.statusCode = 404;
    throw error;
  }

  // Idempotent retry: already verified payment
  if (
    payment.razorpayPaymentId === razorpay_payment_id &&
    ["authorized", "captured"].includes(payment.status)
  ) {
    return {
      paymentId: payment._id,
      status: payment.status,
      message: "Payment has already been verified",
    };
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const received = Buffer.from(razorpay_signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    const error = new Error("Invalid Razorpay payment signature");
    error.statusCode = 400;
    throw error;
  }

  // Verify the payment details directly with Razorpay as well.
  const razorpayPayment = await razorpay.payments.fetch(
    razorpay_payment_id
  );

  if (
    razorpayPayment.order_id !== razorpay_order_id ||
    razorpayPayment.amount !== payment.amount ||
    razorpayPayment.currency !== payment.currency
  ) {
    const error = new Error("Payment details do not match the order");
    error.statusCode = 400;
    throw error;
  }

  if (!["authorized", "captured"].includes(razorpayPayment.status)) {
    const error = new Error(
      `Payment is not successful. Current status: ${razorpayPayment.status}`
    );
    error.statusCode = 409;
    throw error;
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.status =
    razorpayPayment.status === "captured" ? "captured" : "authorized";

  if (payment.status === "captured") {
    payment.paidAt = new Date();
  }

  await payment.save();

  return {
    paymentId: payment._id,
    status: payment.status,
    message: "Payment signature verified successfully",
  };
};

const handleRazorpayWebhookService = async (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    const error = new Error("Webhook secret is not configured on server");
    error.statusCode = 500;
    throw error;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(signature || "", "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    const error = new Error("Invalid Razorpay webhook signature");
    error.statusCode = 400;
    throw error;
  }

  const event = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  const eventType = event.event;

  if (eventType === "payment.captured" || eventType === "order.paid") {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity?.order_id) {
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
      if (payment && payment.status !== "captured") {
        payment.status = "captured";
        payment.razorpayPaymentId = paymentEntity.id;
        payment.paidAt = new Date();
        await payment.save();
      }
    }
  }

  return { received: true };
};

const getPaymentReceiptService = async (userId, userRole, paymentId) => {
  if (!mongoose.isValidObjectId(paymentId)) {
    const error = new Error("Invalid payment ID");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findById(paymentId)
    .populate("client", "name email phone")
    .populate({
      path: "appointment",
      select: "scheduledAt durationMinutes consultationType status lawyer",
      populate: {
        path: "lawyer",
        select: "user city specialization consultationFee",
        populate: { path: "user", select: "name email" }
      }
    })
    .lean();

  if (!payment) {
    const error = new Error("Payment record not found");
    error.statusCode = 404;
    throw error;
  }

  const isClient = payment.client?._id?.toString() === userId.toString();
  const isLawyer = payment.appointment?.lawyer?.user?._id?.toString() === userId.toString();

  if (!isClient && !isLawyer && userRole !== "admin") {
    const error = new Error("Unauthorized to access this receipt");
    error.statusCode = 403;
    throw error;
  }

  return payment;
};

module.exports = { 
  createPaymentOrderService,
  verifyPaymentService,
  handleRazorpayWebhookService,
  getPaymentReceiptService
};

