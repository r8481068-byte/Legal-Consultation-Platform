
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { checkBookingEligibility } = require("./eligibilityService");

const inFlightOrderPromises = new Map();

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

  const appointmentKey = appointmentId.toString();

  // Deduplicate simultaneous concurrent requests for the exact same appointment
  if (inFlightOrderPromises.has(appointmentKey)) {
    return await inFlightOrderPromises.get(appointmentKey);
  }

  const orderPromise = (async () => {
    const appointment = await Appointment.findById(appointmentId).populate({
      path: "lawyer",
      select: "consultationFee verificationStatus isAvailable",
    });

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

    // If already paid or refunded, don't create another payment order.
    const settledPayment = await Payment.findOne({
      appointment: appointment._id,
      status: { $in: ["captured", "refund_pending", "refunded"] },
    });

    if (settledPayment) {
      const error = new Error(
        settledPayment.status === "captured"
          ? "This appointment has already been paid for"
          : "Payment order cannot be created for a refunded consultation"
      );
      error.statusCode = 409;
      throw error;
    }

    // Atomically find or initialize a 'created' payment record to avoid race conditions in DB
    let payment = await Payment.findOneAndUpdate(
      {
        appointment: appointment._id,
        client: clientId,
        status: "created",
      },
      {
        $setOnInsert: {
          appointment: appointment._id,
          client: clientId,
          currency: "INR",
          status: "created",
        },
        $set: {
          amount,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Reuse existing Razorpay order if already created
    if (payment?.razorpayOrderId) {
      return {
        paymentId: payment._id,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    }

    // Atomically claim the right to generate the Razorpay order across processes/instances
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const claimed = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        razorpayOrderId: null,
        $or: [
          { orderInProgress: false },
          { orderInProgress: { $exists: false } },
          { updatedAt: { $lt: tenSecondsAgo } }, // 10s lease timeout if a worker crashed
        ],
      },
      {
        $set: { orderInProgress: true },
      },
      { new: true }
    );

    // If another instance claimed the order generation first, wait and poll for it to complete
    if (!claimed) {
      for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise((r) => setTimeout(r, 200));
        const existing = await Payment.findById(payment._id);
        if (existing?.razorpayOrderId) {
          return {
            paymentId: existing._id,
            orderId: existing.razorpayOrderId,
            amount: existing.amount,
            currency: existing.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
          };
        }
      }
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
      payment.orderInProgress = false;
      await payment.save();

      return {
        paymentId: payment._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      // Release lock so subsequent retries can proceed
      try {
        await Payment.updateOne(
          { _id: payment._id, razorpayOrderId: null },
          { $set: { orderInProgress: false } }
        );
      } catch (err) {}

      // Normalize upstream Razorpay gateway errors so they do NOT leak as client HTTP 401
      const isAuthError =
        error.statusCode === 401 ||
        error.error?.description === "Authentication failed" ||
        error.error?.code === "BAD_REQUEST_ERROR";

      const description =
        error.error?.description || error.message || "Failed to create Razorpay payment order";

      const gatewayError = new Error(
        isAuthError
          ? `Payment gateway authentication failed: ${description}. Please verify server Razorpay API credentials.`
          : `Payment gateway error: ${description}`
      );
      gatewayError.statusCode = 502; // Bad Gateway: Upstream provider failure, not client auth
      gatewayError.code = isAuthError
        ? "PAYMENT_GATEWAY_AUTH_FAILED"
        : "PAYMENT_GATEWAY_ERROR";
      gatewayError.details = error.error;
      throw gatewayError;
    }
  })();

  inFlightOrderPromises.set(appointmentKey, orderPromise);

  try {
    return await orderPromise;
  } finally {
    inFlightOrderPromises.delete(appointmentKey);
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

  // State protection: Do not overwrite if already refund_pending or refunded
  if (["refund_pending", "refunded"].includes(payment.status)) {
    return {
      paymentId: payment._id,
      status: payment.status,
      message: "Payment has already been verified and processed for refund",
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
  let razorpayPayment;
  try {
    razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );
  } catch (error) {
    const isAuthError =
      error.statusCode === 401 ||
      error.error?.description === "Authentication failed" ||
      error.error?.code === "BAD_REQUEST_ERROR";
    const description =
      error.error?.description || error.message || "Failed to verify payment with gateway";
    const gatewayError = new Error(
      isAuthError
        ? `Payment gateway verification failed: ${description}. Please check server Razorpay credentials.`
        : `Payment gateway error: ${description}`
    );
    gatewayError.statusCode = 502;
    gatewayError.code = isAuthError
      ? "PAYMENT_GATEWAY_AUTH_FAILED"
      : "PAYMENT_GATEWAY_ERROR";
    gatewayError.details = error.error;
    throw gatewayError;
  }

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
    const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
    if (orderId) {
      const payment = await Payment.findOne({ razorpayOrderId: orderId })
        .populate("client")
        .populate({
          path: "appointment",
          populate: { path: "lawyer", select: "user" },
        });

      if (payment) {
        const wasAlreadyCaptured = payment.status === "captured";

        // Delayed event protection: Do not overwrite if already refund_pending or refunded
        if (!["refund_pending", "refunded"].includes(payment.status)) {
          if (!wasAlreadyCaptured) {
            payment.status = "captured";
            payment.razorpayPaymentId = paymentEntity?.id || payment.razorpayPaymentId;
            payment.paidAt = new Date();
            await payment.save();
          }
        }

        // Notify client and lawyer once on transition to captured (prevents duplicate notification on redeliveries)
        if (!wasAlreadyCaptured) {
          if (payment.client?._id) {
            try {
              await Notification.create({
                recipient: payment.client._id,
                title: "Payment Confirmed",
                message: `Your consultation fee of ₹${Math.round(payment.amount / 100)} has been successfully paid.`,
                type: "payment",
                link: "/my-appointments",
                relatedId: payment._id,
              });
            } catch (nErr) {
              console.error("Webhook payment client notification error:", nErr.message);
            }
          }

          const lawyerUserId = payment.appointment?.lawyer?.user;
          if (lawyerUserId) {
            try {
              await Notification.create({
                recipient: lawyerUserId,
                title: "Consultation Fee Received",
                message: `Consultation fee of ₹${Math.round(payment.amount / 100)} has been received from ${payment.client?.name || "Client"}.`,
                type: "payment",
                link: "/lawyer/dashboard",
                relatedId: payment._id,
              });
            } catch (nErr) {
              console.error("Webhook payment lawyer notification error:", nErr.message);
            }
          }
        }
      }
    }
  } else if (eventType === "payment.failed") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const gatewayPaymentId = paymentEntity?.id;

    if (orderId || gatewayPaymentId) {
      const query = {
        $or: [
          ...(orderId ? [{ razorpayOrderId: orderId }] : []),
          ...(gatewayPaymentId ? [{ razorpayPaymentId: gatewayPaymentId }] : []),
        ],
      };

      const payment = await Payment.findOne(query).populate("client");

      if (payment) {
        // Delayed event protection: A delayed failed event cannot overwrite a captured, refund_pending, or refunded payment
        if (["captured", "refund_pending", "refunded"].includes(payment.status)) {
          return { received: true, status: "ignored_older_than_successful" };
        }

        const reason =
          paymentEntity?.error_description ||
          paymentEntity?.error_reason ||
          "Payment failed at gateway";

        const wasAlreadyFailed = payment.status === "failed";
        // Idempotency: If already marked failed with same failureReason, no-op
        if (wasAlreadyFailed && payment.failureReason === reason) {
          return { received: true, status: "already_processed" };
        }

        payment.status = "failed";
        payment.failureReason = reason;
        if (gatewayPaymentId && !payment.razorpayPaymentId) {
          payment.razorpayPaymentId = gatewayPaymentId;
        }
        await payment.save();

        // Notify client once on failure transition (prevents duplicate notification on redeliveries)
        if (!wasAlreadyFailed && payment.client?._id) {
          try {
            await Notification.create({
              recipient: payment.client._id,
              title: "Payment Failed",
              message: `Your consultation fee payment of ₹${Math.round(payment.amount / 100)} could not be processed. Reason: ${reason}`,
              type: "payment",
              link: "/my-appointments",
              relatedId: payment._id,
            });
          } catch (nErr) {
            console.error("Webhook payment failure notification error:", nErr.message);
          }
        }
      }
    }
  } else if (eventType === "refund.processed" || eventType === "refund.speed_processed") {
    const refundEntity = event.payload?.refund?.entity;
    if (refundEntity?.payment_id) {
      const payment = await Payment.findOne({
        razorpayPaymentId: refundEntity.payment_id
      }).populate("client");

      if (payment) {
        // Idempotency: If already finalized with this exact refund ID, no-op
        if (payment.status === "refunded" && payment.refundId === refundEntity.id) {
          return { received: true, status: "already_processed" };
        }

        // State protection: Do not overwrite unrelated payment states (e.g., 'created', 'failed')
        if (["refund_pending", "captured", "authorized"].includes(payment.status)) {
          const wasAlreadyRefunded = payment.status === "refunded";
          payment.status = "refunded";
          payment.refundId = refundEntity.id;
          payment.failureReason = payment.failureReason || "Refund confirmed and processed by gateway";
          await payment.save();

          // Notify client if not previously sent
          if (!wasAlreadyRefunded && payment.client?._id) {
            try {
              await Notification.create({
                recipient: payment.client._id,
                title: "Refund Issued",
                message: `Your consultation fee of ₹${Math.round(payment.amount / 100)} has been refunded. Reference: ${refundEntity.id}`,
                type: "payment",
                link: "/my-appointments",
                relatedId: payment._id
              });
            } catch (nErr) {
              console.error("Webhook refund notification error:", nErr.message);
            }
          }
        }
      }
    }
  } else if (eventType === "refund.failed") {
    const refundEntity = event.payload?.refund?.entity;
    if (refundEntity?.payment_id) {
      const payment = await Payment.findOne({
        razorpayPaymentId: refundEntity.payment_id
      });

      if (payment) {
        // Idempotency: If already reverted to captured, no-op
        if (payment.status === "captured" && payment.failureReason?.includes("Refund failed at gateway")) {
          return { received: true, status: "already_processed" };
        }

        // Only revert if payment was held in refund_pending
        if (payment.status === "refund_pending") {
          payment.status = "captured";
          payment.failureReason = refundEntity.error_description
            ? `Refund failed at gateway: ${refundEntity.error_description}`
            : "Refund failed at gateway";
          payment.refundId = null;
          await payment.save();
        }
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

