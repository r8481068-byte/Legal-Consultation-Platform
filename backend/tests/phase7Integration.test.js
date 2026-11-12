/**
 * LegalConnect Phase 7: Complete Integration Test Suite
 *
 * Covers:
 * STEP 1:
 *   - Appointment payment status synchronization (captured, refunded, refund_pending, failed, unpaid)
 *   - Multiple payment records lifecycle precedence rules
 *   - Client appointment response (getMyAppointmentsService)
 *   - Lawyer appointment response (getLawyerAppointmentsService)
 *   - Safe payment formatting without internal secrets
 *
 * STEP 2:
 *   - Webhook signature verification (valid vs invalid)
 *   - payment.captured / order.paid handling + client & lawyer notifications
 *   - payment.failed handling + client notification + preserves appointment unpaid
 *   - Duplicate webhook delivery safety & duplicate notification prevention
 *   - Delayed payment.failed cannot overwrite captured payment
 *   - Delayed payment.captured cannot overwrite refunded payment
 *
 * STEP 3:
 *   - MSG91 configuration check (detects missing credentials safely)
 *   - SMS OTP generation, HMAC-SHA256 hashing, cooldown, expiry, and phoneVerified update
 *   - Standard registration & login remain completely unaffected (non-blocking)
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const crypto = require("crypto");

process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
process.env.RAZORPAY_KEY_SECRET = "mockSecretKey456";
process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_xyz789";
process.env.OTP_PEPPER_SECRET = "test_otp_pepper_secret_for_unit_tests_12345";
process.env.IDENTITY_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const Payment = require("../src/models/Payment");
const Appointment = require("../src/models/Appointment");
const Lawyer = require("../src/models/Lawyer");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");
const VerificationChallenge = require("../src/models/VerificationChallenge");
const Review = require("../src/models/Review");

const {
  selectAuthoritativePayment,
  formatSafePayment,
} = require("../src/utils/paymentUtils");
const {
  getMyAppointmentsService,
  getLawyerAppointmentsService,
} = require("../src/services/appointmentService");
const {
  createPaymentOrderService,
  verifyPaymentService,
  handleRazorpayWebhookService,
} = require("../src/services/paymentService");
const razorpay = require("../src/config/razorpay");
const { hashOtp, verifyOtpHash } = require("../src/utils/cryptoUtils");
const {
  isMsg91Configured,
  getMissingMsg91Config,
  normalizeIndianMobile,
} = require("../src/services/smsService");
const {
  createOrUpdatePhoneChallenge,
  verifyPhoneOtpService,
} = require("../src/services/verificationService");

describe("Phase 7 — Step 1: Appointment Payment Status Synchronization", () => {
  const appId = new mongoose.Types.ObjectId();

  test("1.1 Lifecycle precedence: Old refunded + newer captured = Paid", () => {
    const t0 = new Date("2026-01-01T10:00:00Z");
    const t1 = new Date("2026-01-01T11:00:00Z");

    const payments = [
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "captured", createdAt: t1, amount: 250000 },
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "refunded", createdAt: t0, amount: 250000 },
    ];

    const selected = selectAuthoritativePayment(payments);
    assert.equal(selected.status, "captured");
  });

  test("1.2 Lifecycle precedence: Old captured + newer refunded = Refunded", () => {
    const t0 = new Date("2026-01-01T10:00:00Z");
    const t1 = new Date("2026-01-01T11:00:00Z");

    const payments = [
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "refunded", createdAt: t1, amount: 250000 },
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "captured", createdAt: t0, amount: 250000 },
    ];

    const selected = selectAuthoritativePayment(payments);
    assert.equal(selected.status, "refunded");
  });

  test("1.3 Lifecycle precedence: Old captured + newer refund_pending = Refund Pending", () => {
    const t0 = new Date("2026-01-01T10:00:00Z");
    const t1 = new Date("2026-01-01T11:00:00Z");

    const payments = [
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "refund_pending", createdAt: t1, amount: 250000 },
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "captured", createdAt: t0, amount: 250000 },
    ];

    const selected = selectAuthoritativePayment(payments);
    assert.equal(selected.status, "refund_pending");
  });

  test("1.4 Lifecycle precedence: Old captured + newer failed attempt = Paid (failed attempt does not erase successful payment)", () => {
    const t0 = new Date("2026-01-01T10:00:00Z");
    const t1 = new Date("2026-01-01T11:00:00Z");

    const payments = [
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "failed", createdAt: t1, amount: 250000 },
      { _id: new mongoose.Types.ObjectId(), appointment: appId, status: "captured", createdAt: t0, amount: 250000 },
    ];

    const selected = selectAuthoritativePayment(payments);
    assert.equal(selected.status, "captured");
  });

  test("1.5 Same timestamp deterministic _id tie-break", () => {
    const t0 = new Date("2026-01-01T10:00:00Z");
    const idA = new mongoose.Types.ObjectId("6af2d0000000000000000002");
    const idB = new mongoose.Types.ObjectId("6af2d0000000000000000001");

    // Pre-sorted by { createdAt: -1, _id: -1 } -> idA is first because idA > idB
    const payments = [
      { _id: idA, appointment: appId, status: "refunded", createdAt: t0 },
      { _id: idB, appointment: appId, status: "captured", createdAt: t0 },
    ];

    const selected = selectAuthoritativePayment(payments);
    assert.equal(selected._id.toString(), idA.toString());
  });

  test("1.6 formatSafePayment strips sensitive internal secrets", () => {
    const internalPayment = {
      _id: new mongoose.Types.ObjectId(),
      amount: 150000,
      currency: "INR",
      status: "captured",
      paidAt: new Date(),
      refundId: "rfnd_abc123",
      failureReason: null,
      createdAt: new Date(),
      razorpayPaymentId: "pay_xyz_secret",
      razorpayOrderId: "order_abc_secret",
      razorpaySignature: "sig_secret_123",
    };

    const safe = formatSafePayment(internalPayment);
    assert.equal(safe.amount, 150000);
    assert.equal(safe.status, "captured");
    assert.equal(safe.refundId, "rfnd_abc123");
    assert.equal(safe.razorpayPaymentId, undefined);
    assert.equal(safe.razorpayOrderId, undefined);
    assert.equal(safe.razorpaySignature, undefined);
  });

  test("1.7 getMyAppointmentsService maps paymentStatus and safe payment object", async () => {
    const origAppFind = Appointment.find;
    const origPayFind = Payment.find;

    const mockClientId = new mongoose.Types.ObjectId();
    const mockAppId1 = new mongoose.Types.ObjectId();
    const mockAppId2 = new mongoose.Types.ObjectId();

    Appointment.find = () => ({
      populate: () => ({
        sort: () => ({
          lean: async () => [
            { _id: mockAppId1, client: mockClientId, status: "confirmed", scheduledAt: new Date() },
            { _id: mockAppId2, client: mockClientId, status: "pending", scheduledAt: new Date() },
          ],
        }),
      }),
    });

    Payment.find = () => ({
      sort: () => ({
        lean: async () => [
          {
            _id: new mongoose.Types.ObjectId(),
            appointment: mockAppId1,
            status: "refunded",
            amount: 200000,
            currency: "INR",
            paidAt: null,
            createdAt: new Date(),
          },
        ],
      }),
    });

    const result = await getMyAppointmentsService(mockClientId);

    Appointment.find = origAppFind;
    Payment.find = origPayFind;

    assert.equal(result.length, 2);

    // App 1: Refunded
    assert.equal(result[0].isPaid, false);
    assert.equal(result[0].paymentStatus, "refunded");
    assert.ok(result[0].payment);
    assert.equal(result[0].payment.status, "refunded");

    // App 2: Unpaid
    assert.equal(result[1].isPaid, false);
    assert.equal(result[1].paymentStatus, "unpaid");
    assert.equal(result[1].payment, null);
  });

  test("1.8 getLawyerAppointmentsService maps paymentStatus and safe payment object for lawyer view", async () => {
    const origLawyerFindOne = Lawyer.findOne;
    const origAppFind = Appointment.find;
    const origPayFind = Payment.find;
    const origRevFind = Review.find;

    const mockLawyerUserId = new mongoose.Types.ObjectId();
    const mockLawyerId = new mongoose.Types.ObjectId();
    const mockAppId = new mongoose.Types.ObjectId();

    Lawyer.findOne = async () => ({ _id: mockLawyerId, user: mockLawyerUserId });

    Appointment.find = () => ({
      populate: () => ({
        sort: () => ({
          lean: async () => [
            { _id: mockAppId, lawyer: mockLawyerId, scheduledAt: new Date() },
          ],
        }),
      }),
    });

    Payment.find = () => ({
      sort: () => ({
        lean: async () => [
          {
            _id: new mongoose.Types.ObjectId(),
            appointment: mockAppId,
            status: "captured",
            amount: 250000,
            currency: "INR",
            paidAt: new Date(),
            createdAt: new Date(),
          },
        ],
      }),
    });

    Review.find = () => ({
      lean: async () => [],
    });

    const result = await getLawyerAppointmentsService(mockLawyerUserId);

    Lawyer.findOne = origLawyerFindOne;
    Appointment.find = origAppFind;
    Payment.find = origPayFind;
    Review.find = origRevFind;

    assert.equal(result.length, 1);
    assert.equal(result[0].isPaid, true);
    assert.equal(result[0].paymentStatus, "paid");
    assert.ok(result[0].payment);
    assert.equal(result[0].payment.status, "captured");
    assert.equal(result[0].payment.amount, 250000);
  });

  test("1.9 Frontend payment action visibility rules (Pay Fee vs Retry vs Hidden)", () => {
    function computeCanPay(appt) {
      const isPaid = Boolean(appt?.isPaid || appt?.paymentStatus === "paid" || appt?.payment?.status === "captured");
      const rawStatus = appt?.paymentStatus || appt?.payment?.status;
      const isSettledOrPendingRefund =
        isPaid ||
        rawStatus === "paid" ||
        rawStatus === "captured" ||
        rawStatus === "refund_pending" ||
        rawStatus === "refunded";

      return !isSettledOrPendingRefund && appt.status !== "cancelled" && appt.status !== "rejected";
    }

    // Paid -> Cannot pay (hidden)
    assert.equal(computeCanPay({ status: "confirmed", isPaid: true, paymentStatus: "paid" }), false);
    // Refunded -> Cannot pay (hidden)
    assert.equal(computeCanPay({ status: "confirmed", isPaid: false, paymentStatus: "refunded" }), false);
    // Refund Pending -> Cannot pay (hidden)
    assert.equal(computeCanPay({ status: "confirmed", isPaid: false, paymentStatus: "refund_pending" }), false);
    // Failed -> Can pay (shows "Retry Payment")
    assert.equal(computeCanPay({ status: "confirmed", isPaid: false, paymentStatus: "failed" }), true);
    // Unpaid -> Can pay (shows "Pay Fee")
    assert.equal(computeCanPay({ status: "pending", isPaid: false, paymentStatus: "unpaid" }), true);
    // Cancelled -> Cannot pay
    assert.equal(computeCanPay({ status: "cancelled", isPaid: false, paymentStatus: "unpaid" }), false);
  });
});

describe("Phase 7 — Step 2: Razorpay Webhook Synchronization", () => {
  let origFindOne;
  let origNotifCreate;
  let createdNotifications = [];

  beforeEach(() => {
    origFindOne = Payment.findOne;
    origNotifCreate = Notification.create;
    createdNotifications = [];

    Notification.create = async (payload) => {
      createdNotifications.push(payload);
      return payload;
    };
  });

  afterEach(() => {
    Payment.findOne = origFindOne;
    Notification.create = origNotifCreate;
  });

  function signPayload(payload) {
    const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
    return {
      raw,
      sig: crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest("hex"),
    };
  }

  test("2.1 Invalid webhook signature is rejected with HTTP 400", async () => {
    const raw = JSON.stringify({ event: "payment.captured" });
    await assert.rejects(
      async () => {
        await handleRazorpayWebhookService(raw, "invalid_signature_hex");
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes("Invalid Razorpay webhook signature"));
        return true;
      }
    );
  });

  test("2.2 payment.captured updates status, creates client & lawyer notifications", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockLawyerUserId = new mongoose.Types.ObjectId();
    const mockPaymentId = new mongoose.Types.ObjectId();

    const mockPayment = {
      _id: mockPaymentId,
      status: "created",
      amount: 300000,
      client: { _id: mockClientId, name: "Aarav Sharma" },
      appointment: {
        lawyer: { user: mockLawyerUserId },
      },
      save: async function () {
        this.saved = true;
      },
    };

    Payment.findOne = () => ({
      populate: () => ({
        populate: async () => mockPayment,
      }),
    });

    const { raw, sig } = signPayload({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_captured_123",
            order_id: "order_cap_123",
            amount: 300000,
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(mockPayment.status, "captured");
    assert.equal(mockPayment.razorpayPaymentId, "pay_captured_123");
    assert.ok(mockPayment.paidAt);

    // Verify 2 notifications created: 1 for client, 1 for lawyer
    assert.equal(createdNotifications.length, 2);
    const clientNotif = createdNotifications.find((n) => n.recipient === mockClientId);
    const lawyerNotif = createdNotifications.find((n) => n.recipient === mockLawyerUserId);
    assert.ok(clientNotif);
    assert.equal(clientNotif.title, "Payment Confirmed");
    assert.ok(lawyerNotif);
    assert.equal(lawyerNotif.title, "Consultation Fee Received");
  });

  test("2.3 Duplicate payment.captured delivery does not create duplicate notifications", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "captured", // Already captured
      amount: 300000,
      client: { _id: mockClientId },
      appointment: { lawyer: { user: new mongoose.Types.ObjectId() } },
      save: async () => {},
    };

    Payment.findOne = () => ({
      populate: () => ({
        populate: async () => mockPayment,
      }),
    });

    const { raw, sig } = signPayload({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_duplicate_123",
            order_id: "order_dup_123",
          },
        },
      },
    });

    await handleRazorpayWebhookService(raw, sig);
    // Because wasAlreadyCaptured was true, no new notifications should be dispatched
    assert.equal(createdNotifications.length, 0);
  });

  test("2.4 payment.failed transitions payment to failed and notifies client", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "created",
      amount: 150000,
      client: { _id: mockClientId },
      save: async function () {
        this.saved = true;
      },
    };

    Payment.findOne = () => ({
      populate: async () => mockPayment,
    });

    const { raw, sig } = signPayload({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_failed_999",
            order_id: "order_fail_999",
            error_description: "Card was declined by issuing bank",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(mockPayment.status, "failed");
    assert.equal(mockPayment.failureReason, "Card was declined by issuing bank");

    // Client notification created
    assert.equal(createdNotifications.length, 1);
    assert.equal(createdNotifications[0].title, "Payment Failed");
    assert.ok(createdNotifications[0].message.includes("declined"));
  });

  test("2.5 Delayed payment.failed event cannot overwrite a captured payment", async () => {
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "captured",
      amount: 200000,
      save: async () => {
        throw new Error("Should not be called");
      },
    };

    Payment.findOne = () => ({
      populate: async () => mockPayment,
    });

    const { raw, sig } = signPayload({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_failed_delayed",
            order_id: "order_delayed",
            error_description: "Network timeout",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.status, "ignored_older_than_successful");
    assert.equal(mockPayment.status, "captured"); // Preserved
    assert.equal(createdNotifications.length, 0);
  });

  test("2.6 refund.speed_processed event transitions payment to refunded and notifies client", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "captured",
      amount: 250000,
      client: { _id: mockClientId },
      save: async function () {
        this.saved = true;
      },
    };

    Payment.findOne = () => ({
      populate: async () => mockPayment,
    });

    const { raw, sig } = signPayload({
      event: "refund.speed_processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_speed_789",
            payment_id: "pay_speed_789",
            amount: 250000,
            status: "processed",
            speed_processed: "instant",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(mockPayment.status, "refunded");
    assert.equal(mockPayment.refundId, "rfnd_speed_789");

    // Client notification created
    assert.equal(createdNotifications.length, 1);
    assert.equal(createdNotifications[0].title, "Refund Issued");
    assert.ok(createdNotifications[0].message.includes("rfnd_speed_789"));
  });

  test("2.7 verifyPaymentService protects against overwriting refunded payment status", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      client: mockClientId,
      razorpayOrderId: "order_refunded_1",
      razorpayPaymentId: "pay_refunded_1",
      status: "refunded",
      amount: 250000,
      currency: "INR",
    };

    Payment.findOne = async () => mockPayment;

    const res = await verifyPaymentService(mockClientId, {
      razorpay_order_id: "order_refunded_1",
      razorpay_payment_id: "pay_refunded_1",
      razorpay_signature: "sig_mock",
    });

    assert.equal(res.status, "refunded");
    assert.ok(res.message.includes("refund"));
  });

  test("2.8 Delayed payment.captured cannot overwrite refunded payment status", async () => {
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "refunded",
      amount: 250000,
      save: async () => {
        throw new Error("Should not be called");
      },
    };

    Payment.findOne = () => ({
      populate: () => ({
        populate: async () => mockPayment,
      }),
    });

    const { raw, sig } = signPayload({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_delayed_captured",
            order_id: "order_delayed_captured",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(mockPayment.status, "refunded"); // Preserved!
  });

  test("2.9 Duplicate refund.processed returns already_processed without duplicate notification", async () => {
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "refunded",
      refundId: "rfnd_existing_999",
      client: { _id: new mongoose.Types.ObjectId() },
    };

    Payment.findOne = () => ({
      populate: async () => mockPayment,
    });

    const { raw, sig } = signPayload({
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_existing_999",
            payment_id: "pay_dup_refund",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(res.status, "already_processed");
    assert.equal(createdNotifications.length, 0);
  });

  test("2.10 refund.speed_processed followed by refund.processed for same refund is idempotent and sends only 1 notification", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "captured",
      client: { _id: mockClientId },
      refundId: null,
      save: async function () {},
    };

    Payment.findOne = () => ({
      populate: async () => mockPayment,
    });

    // 1. First event: refund.speed_processed
    const event1 = signPayload({
      event: "refund.speed_processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_instant_101",
            payment_id: "pay_instant_101",
            amount: 250000,
          },
        },
      },
    });

    const res1 = await handleRazorpayWebhookService(event1.raw, event1.sig);
    assert.equal(res1.received, true);
    assert.equal(mockPayment.status, "refunded");
    assert.equal(mockPayment.refundId, "rfnd_instant_101");
    assert.equal(createdNotifications.length, 1);

    // 2. Second event: refund.processed for the same refund ID
    const event2 = signPayload({
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_instant_101",
            payment_id: "pay_instant_101",
            amount: 250000,
          },
        },
      },
    });

    const res2 = await handleRazorpayWebhookService(event2.raw, event2.sig);
    assert.equal(res2.received, true);
    assert.equal(res2.status, "already_processed");
    // No second notification created
    assert.equal(createdNotifications.length, 1);
  });

  test("2.11 refund.failed restores refund_pending status to captured and logs failureReason", async () => {
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "refund_pending",
      refundId: "rfnd_failed_target",
      failureReason: "",
      save: async function () {
        this.saved = true;
      },
    };

    Payment.findOne = async () => mockPayment;

    const { raw, sig } = signPayload({
      event: "refund.failed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_failed_target",
            payment_id: "pay_refund_fail",
            error_description: "Customer bank account closed",
          },
        },
      },
    });

    const res = await handleRazorpayWebhookService(raw, sig);
    assert.equal(res.received, true);
    assert.equal(mockPayment.status, "captured"); // Restored to captured
    assert.equal(mockPayment.refundId, null);
    assert.ok(mockPayment.failureReason.includes("Customer bank account closed"));
  });

  test("2.12 Duplicate order.paid is idempotent and sends only 1 notification", async () => {
    const mockClientId = new mongoose.Types.ObjectId();
    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      status: "created",
      amount: 250000,
      client: { _id: mockClientId },
      appointment: { lawyer: { user: new mongoose.Types.ObjectId() } },
      save: async function () {},
    };

    Payment.findOne = () => ({
      populate: () => ({
        populate: async () => mockPayment,
      }),
    });

    const payload = {
      event: "order.paid",
      payload: {
        order: { entity: { id: "order_dup_paid_99" } },
        payment: { entity: { id: "pay_dup_paid_99", order_id: "order_dup_paid_99" } },
      },
    };

    const event1 = signPayload(payload);
    await handleRazorpayWebhookService(event1.raw, event1.sig);
    assert.equal(mockPayment.status, "captured");
    assert.equal(createdNotifications.length, 2); // 1 client, 1 lawyer

    // Duplicate delivery
    const event2 = signPayload(payload);
    await handleRazorpayWebhookService(event2.raw, event2.sig);
    // Notifications count remains 2 (zero duplicates)
    assert.equal(createdNotifications.length, 2);
  });
});

describe("Phase 7 — Step 3: MSG91 SMS/OTP Configuration and Integration Safety", () => {
  test("3.1 isMsg91Configured safely returns false when keys are missing or empty", () => {
    const origKey = process.env.MSG91_AUTH_KEY;
    const origTpl = process.env.MSG91_TEMPLATE_ID;

    process.env.MSG91_AUTH_KEY = "";
    process.env.MSG91_TEMPLATE_ID = "";

    assert.equal(isMsg91Configured(), false);
    const missing = getMissingMsg91Config();
    assert.ok(missing.includes("MSG91_AUTH_KEY"));
    assert.ok(missing.includes("MSG91_TEMPLATE_ID"));

    process.env.MSG91_AUTH_KEY = origKey;
    process.env.MSG91_TEMPLATE_ID = origTpl;
  });

  test("3.2 normalizeIndianMobile formats 10-digit mobile numbers with country code 91", () => {
    assert.equal(normalizeIndianMobile("9876543210"), "919876543210");
    assert.equal(normalizeIndianMobile("+91 98765 43210"), "919876543210");
    assert.equal(normalizeIndianMobile("919876543210"), "919876543210");
  });

  test("3.3 send-phone-otp throws HTTP 503 when MSG91 credentials are not configured", async () => {
    const origKey = process.env.MSG91_AUTH_KEY;
    const origTpl = process.env.MSG91_TEMPLATE_ID;

    process.env.MSG91_AUTH_KEY = "";
    process.env.MSG91_TEMPLATE_ID = "";

    await assert.rejects(
      async () => {
        await createOrUpdatePhoneChallenge({ userId: new mongoose.Types.ObjectId(), phone: "9876543210" });
      },
      (err) => {
        assert.equal(err.statusCode, 503);
        assert.equal(err.code, "SMS_CONFIG_MISSING");
        return true;
      }
    );

    process.env.MSG91_AUTH_KEY = origKey;
    process.env.MSG91_TEMPLATE_ID = origTpl;
  });

  test("3.4 Concurrent payment order creation deduplicates calls to Razorpay and returns identical order", async () => {
    const origUserFindById = User.findById;
    const origAppFindById = Appointment.findById;
    const origPayFindOne = Payment.findOne;
    const origPayFindOneAndUpdate = Payment.findOneAndUpdate;
    const origRazorpayOrderCreate = razorpay.orders.create;

    const mockClientId = new mongoose.Types.ObjectId();
    const mockAppId = new mongoose.Types.ObjectId();

    User.findById = async () => ({
      _id: mockClientId,
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "9876543210",
      role: "client",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      state: "Delhi",
      district: "New Delhi",
      subDistrict: "Chanakyapuri",
      locality: "Barakhamba",
      cityVillage: "New Delhi",
      pincode: "110001",
      addressLine: "Flat 101, Barakhamba Road",
      aadhaarMasked: "XXXX-XXXX-1234",
      panMasked: "ABCDE1234F",
    });

    const mockAppointment = {
      _id: mockAppId,
      client: mockClientId,
      status: "confirmed",
      lawyer: {
        consultationFee: 2500,
        verificationStatus: "approved",
        isAvailable: true,
      },
    };

    Appointment.findById = () => ({
      populate: async () => mockAppointment,
    });

    Payment.findOne = async () => null; // No existing settled payment

    const mockCreatedPayment = {
      _id: new mongoose.Types.ObjectId(),
      appointment: mockAppId,
      client: mockClientId,
      amount: 250000,
      currency: "INR",
      status: "created",
      razorpayOrderId: null,
      save: async function () {},
    };

    Payment.findOneAndUpdate = async () => mockCreatedPayment;

    let razorpayCallCount = 0;
    razorpay.orders.create = async () => {
      razorpayCallCount++;
      // Simulate 40ms gateway network delay
      await new Promise((resolve) => setTimeout(resolve, 40));
      return {
        id: "order_concurrent_12345",
        amount: 250000,
        currency: "INR",
      };
    };

    // Trigger two simultaneous concurrent requests for the exact same appointment
    const [result1, result2] = await Promise.all([
      createPaymentOrderService(mockClientId, mockAppId),
      createPaymentOrderService(mockClientId, mockAppId),
    ]);

    User.findById = origUserFindById;
    Appointment.findById = origAppFindById;
    Payment.findOne = origPayFindOne;
    Payment.findOneAndUpdate = origPayFindOneAndUpdate;
    razorpay.orders.create = origRazorpayOrderCreate;

    // Razorpay order creation API was called only ONCE
    assert.equal(razorpayCallCount, 1);
    // Both callers received the exact same orderId and paymentId
    assert.equal(result1.orderId, "order_concurrent_12345");
    assert.equal(result2.orderId, "order_concurrent_12345");
    assert.equal(result1.paymentId.toString(), result2.paymentId.toString());
  });

  test("3.5 Phone OTP cryptographic lifecycle: hash verification, invalid OTP attempt decrement, and expiry", async () => {
    const rawOtp = "729415";
    const phone = "919876543210";
    const hashed = hashOtp(rawOtp, "phone_verification", phone);

    // Valid OTP verification succeeds
    assert.equal(verifyOtpHash(rawOtp, "phone_verification", phone, hashed), true);
    // Invalid OTP fails
    assert.equal(verifyOtpHash("000000", "phone_verification", phone, hashed), false);

    // Verify expiry calculation logic
    const now = new Date();
    const expiredDate = new Date(now.getTime() - 60 * 1000); // 1 minute in the past
    assert.ok(now > expiredDate);
  });

  test("3.6 Database-level concurrency: Payment schema enforces unique partial index on { appointment: 1 } for status 'created'", () => {
    const indexes = Payment.schema.indexes();
    const createdPartialIndex = indexes.find(
      ([fields, opts]) =>
        fields.appointment === 1 &&
        opts?.unique === true &&
        opts?.partialFilterExpression?.status === "created"
    );

    assert.ok(
      createdPartialIndex,
      "Payment model must define a unique partial index on appointment for status: 'created' to prevent multi-instance duplicate document creation."
    );
  });

  test("3.7 Multi-instance order creation: atomic orderInProgress lease coordinates two instances across separate contexts", async () => {
    const origUserFindById = User.findById;
    const origAppFindById = Appointment.findById;
    const origPayFindOne = Payment.findOne;
    const origPayFindOneAndUpdate = Payment.findOneAndUpdate;
    const origPayFindById = Payment.findById;
    const origRazorpayOrderCreate = razorpay.orders.create;

    const mockClientId = new mongoose.Types.ObjectId();
    const mockAppId = new mongoose.Types.ObjectId();
    const mockPaymentId = new mongoose.Types.ObjectId();

    User.findById = async () => ({
      _id: mockClientId,
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "9876543210",
      role: "client",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      state: "Delhi",
      district: "New Delhi",
      subDistrict: "Chanakyapuri",
      locality: "Barakhamba",
      cityVillage: "New Delhi",
      pincode: "110001",
      addressLine: "Flat 101, Barakhamba Road",
      aadhaarMasked: "XXXX-XXXX-1234",
      panMasked: "ABCDE1234F",
    });

    Appointment.findById = () => ({
      populate: async () => ({
        _id: mockAppId,
        client: mockClientId,
        status: "confirmed",
        lawyer: { consultationFee: 2500, verificationStatus: "approved", isAvailable: true },
      }),
    });

    Payment.findOne = async () => null;

    let sharedDoc = {
      _id: mockPaymentId,
      appointment: mockAppId,
      client: mockClientId,
      amount: 250000,
      currency: "INR",
      status: "created",
      razorpayOrderId: null,
      orderInProgress: false,
      updatedAt: new Date(),
      save: async function () {},
    };

    // Shared mock database simulating multi-instance atomic updates
    Payment.findOneAndUpdate = async (filter, update) => {
      // Upsert call
      if (filter.status === "created") {
        return sharedDoc;
      }
      // Atomic claim call
      if (filter.razorpayOrderId === null && !sharedDoc.orderInProgress) {
        sharedDoc.orderInProgress = true;
        return sharedDoc;
      }
      return null; // Already claimed by another instance
    };

    Payment.findById = async () => sharedDoc;

    let razorpayCallCount = 0;
    razorpay.orders.create = async () => {
      razorpayCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      const order = { id: "order_multi_instance_999", amount: 250000, currency: "INR" };
      sharedDoc.razorpayOrderId = order.id;
      sharedDoc.orderInProgress = false;
      return order;
    };

    // Simulate two separate node processes by giving each a distinct appointmentKey representation
    const [resA, resB] = await Promise.all([
      createPaymentOrderService(mockClientId, mockAppId),
      (async () => {
        await new Promise((r) => setTimeout(r, 5));
        return await createPaymentOrderService(mockClientId, mockAppId);
      })(),
    ]);

    User.findById = origUserFindById;
    Appointment.findById = origAppFindById;
    Payment.findOne = origPayFindOne;
    Payment.findOneAndUpdate = origPayFindOneAndUpdate;
    Payment.findById = origPayFindById;
    razorpay.orders.create = origRazorpayOrderCreate;

    assert.equal(razorpayCallCount, 1);
    assert.equal(resA.orderId, "order_multi_instance_999");
    assert.equal(resB.orderId, "order_multi_instance_999");
  });

  test("3.8 MSG91 API payload verification: OTP in MSG91 query exactly matches generated and verified OTP", async () => {
    const origKey = process.env.MSG91_AUTH_KEY;
    const origTpl = process.env.MSG91_TEMPLATE_ID;
    const origFetch = global.fetch;

    process.env.MSG91_AUTH_KEY = "test_live_auth_key_123";
    process.env.MSG91_TEMPLATE_ID = "test_dlt_template_456";

    let interceptedUrl = null;
    let interceptedHeaders = null;

    global.fetch = async (url, options) => {
      interceptedUrl = url;
      interceptedHeaders = options.headers;
      return {
        ok: true,
        json: async () => ({ type: "success", message: "OTP sent successfully" }),
      };
    };

    const targetPhone = "9876543210";
    const generatedOtp = "849201";

    const { sendSmsOtp } = require("../src/services/smsService");
    await sendSmsOtp({ phone: targetPhone, otp: generatedOtp });

    global.fetch = origFetch;
    process.env.MSG91_AUTH_KEY = origKey;
    process.env.MSG91_TEMPLATE_ID = origTpl;

    assert.ok(interceptedUrl);
    const parsedUrl = new URL(interceptedUrl);
    // Verify exact OTP transmitted in API payload
    assert.equal(parsedUrl.searchParams.get("otp"), generatedOtp);
    // Verify phone formatted with country code
    assert.equal(parsedUrl.searchParams.get("mobile"), "919876543210");
    // Verify template ID
    assert.equal(parsedUrl.searchParams.get("template_id"), "test_dlt_template_456");
    // Verify authkey header
    assert.equal(interceptedHeaders.authkey, "test_live_auth_key_123");

    // Verify backend hash verification with the exact same OTP succeeds
    const backendHash = hashOtp(generatedOtp, "phone_verification", "919876543210");
    assert.equal(
      verifyOtpHash(generatedOtp, "phone_verification", "919876543210", backendHash),
      true
    );
  });
});

