/**
 * LegalConnect Phase 1: Comprehensive Razorpay Refund Reliability Test Suite
 *
 * Covers:
 * 1. Successful processed refund (refund.status === "processed" -> payment.status === "refunded")
 * 2. Pending refund response (refund.status === "pending" -> payment.status === "refund_pending")
 * 3. Failed Razorpay refund (gateway rejection maps to HTTP 502, state safely restored to "captured")
 * 4. Invalid gateway response (missing .id maps to HTTP 502)
 * 5. Database write failure after gateway success (real refund ID preserved, held in refund_pending, error thrown)
 * 6. Refund webhook processed event (transitions to "refunded", idempotent, preserves unrelated states)
 * 7. Refund webhook failed event (reverts refund_pending to "captured", idempotent)
 * 8. Duplicate simultaneous refund requests (atomic claim prevents double refund; second gets HTTP 409)
 * 9. Gateway timeout with uncertain outcome (leaves as refund_pending for reconciliation, HTTP 502)
 * 10. Invalid webhook signature (rejects with HTTP 400)
 * 11. Gateway credentials missing (HTTP 503)
 * 12. Input validations (invalid ObjectId 400, not found 404, unrefundable status 400, missing gateway payment ID 400)
 * 13. Controller HTTP status and payload contract
 *
 * Run with:
 *   node --test backend/tests/razorpayRefund.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Set test environment configuration
process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
process.env.RAZORPAY_KEY_SECRET = "mockSecretKey456";
process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_xyz789";

const Payment = require("../src/models/Payment");
const Notification = require("../src/models/Notification");
const AdminLog = require("../src/models/AdminLog");
const User = require("../src/models/User");
const razorpay = require("../src/config/razorpay");
const { processRefundService } = require("../src/services/adminService");
const { processRefund } = require("../src/controllers/adminController");
const { handleRazorpayWebhookService } = require("../src/services/paymentService");

describe("Phase 1: Razorpay Refund Handling & Reliability", () => {
  let originalFindById;
  let originalFindOneAndUpdate;
  let originalUpdateOne;
  let originalFindOne;
  let originalUserFindById;
  let originalNotificationCreate;
  let originalAdminLogCreate;
  let originalRazorpayRefund;
  let originalKeyId;
  let originalKeySecret;
  let originalWebhookSecret;

  const mockAdminId = new mongoose.Types.ObjectId();
  const mockPaymentId = new mongoose.Types.ObjectId();
  const mockClientId = new mongoose.Types.ObjectId();
  const mockAppointmentId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    originalFindById = Payment.findById;
    originalFindOneAndUpdate = Payment.findOneAndUpdate;
    originalUpdateOne = Payment.updateOne;
    originalFindOne = Payment.findOne;
    originalUserFindById = User.findById;
    originalNotificationCreate = Notification.create;
    originalAdminLogCreate = AdminLog.create;
    originalRazorpayRefund = razorpay.payments?.refund;
    originalKeyId = process.env.RAZORPAY_KEY_ID;
    originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
    originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
    process.env.RAZORPAY_KEY_SECRET = "mockSecretKey456";
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_xyz789";

    Payment.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });
    User.findById = () => ({
      select: () => ({
        lean: async () => ({ name: "Test Admin", email: "admin@test.com" })
      })
    });
    Notification.create = async (payload) => payload;
    AdminLog.create = async (payload) => payload;
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_ID = originalKeyId || "rzp_test_mockKey123";
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret || "mockSecretKey456";
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret || "test_webhook_secret_xyz789";

    Payment.findById = originalFindById;
    Payment.findOneAndUpdate = originalFindOneAndUpdate;
    Payment.updateOne = originalUpdateOne;
    Payment.findOne = originalFindOne;
    User.findById = originalUserFindById;
    Notification.create = originalNotificationCreate;
    AdminLog.create = originalAdminLogCreate;

    try {
      if (razorpay.payments) {
        razorpay.payments.refund = originalRazorpayRefund;
      }
    } catch (_) {}
  });

  function createMockPayment(overrides = {}) {
    return {
      _id: mockPaymentId,
      status: "captured",
      amount: 150000, // 1500 INR in paise
      currency: "INR",
      razorpayPaymentId: "pay_test_valid_998877",
      razorpayOrderId: "order_test_12345",
      refundId: null,
      failureReason: "",
      client: { _id: mockClientId, name: "Test Client", email: "client@test.com" },
      appointment: { _id: mockAppointmentId },
      saveCalled: false,
      async save() {
        this.saveCalled = true;
        return this;
      },
      ...overrides
    };
  }

  // =========================================================================
  // SCENARIO 1: Successful Processed Refund
  // =========================================================================
  test("1. Successful processed refund: maps to 'refunded', returns real refund ID, notifies client", async () => {
    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update, opts) => ({
      populate: async () => {
        if (query.status?.$in?.includes(mockDoc.status)) {
          mockDoc.status = update.$set.status;
          return mockDoc;
        }
        return null;
      }
    });

    const realGatewayRefundId = "rfnd_processed_112233";
    let refundArgs = null;
    razorpay.payments.refund = async (paymentId, options) => {
      refundArgs = { paymentId, options };
      return {
        id: realGatewayRefundId,
        entity: "refund",
        amount: 150000,
        currency: "INR",
        payment_id: paymentId,
        status: "processed"
      };
    };

    let notificationPayload = null;
    Notification.create = async (payload) => {
      notificationPayload = payload;
      return payload;
    };

    let auditLogPayload = null;
    AdminLog.create = async (payload) => {
      auditLogPayload = payload;
      return payload;
    };

    const result = await processRefundService(
      mockAdminId,
      mockPaymentId.toString(),
      { reason: "Advocate absent" },
      { ip: "127.0.0.1", headers: { "user-agent": "AdminClient/1.0" } }
    );

    // Verify gateway called with correct parameters
    assert.equal(refundArgs.paymentId, "pay_test_valid_998877");
    assert.equal(refundArgs.options.amount, 150000);
    assert.equal(refundArgs.options.notes.reason, "Advocate absent");

    // Verify DB state
    assert.equal(mockDoc.status, "refunded");
    assert.equal(mockDoc.refundId, realGatewayRefundId);
    assert.equal(mockDoc.saveCalled, true);

    // Verify notification
    assert.ok(notificationPayload);
    assert.equal(notificationPayload.title, "Refund Issued");
    assert.match(notificationPayload.message, new RegExp(realGatewayRefundId));

    // Verify audit log
    assert.ok(auditLogPayload);
    assert.equal(auditLogPayload.details.refundId, realGatewayRefundId);
    assert.equal(auditLogPayload.details.status, "refunded");

    // Verify response
    assert.deepEqual(result, {
      paymentId: mockDoc._id,
      refundId: realGatewayRefundId,
      amountRupees: 1500,
      status: "refunded",
      message: "Refund processed successfully"
    });
  });

  // =========================================================================
  // SCENARIO 2: Pending Refund Response
  // =========================================================================
  test("2. Pending refund response: maps to 'refund_pending', does not falsely mark as 'refunded'", async () => {
    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        if (query.status?.$in?.includes(mockDoc.status)) {
          mockDoc.status = update.$set.status;
          return mockDoc;
        }
        return null;
      }
    });

    const pendingRefundId = "rfnd_pending_445566";
    razorpay.payments.refund = async () => ({
      id: pendingRefundId,
      entity: "refund",
      amount: 150000,
      status: "pending" // Bank processing / normal refund
    });

    let notificationPayload = null;
    Notification.create = async (payload) => {
      notificationPayload = payload;
      return payload;
    };

    const result = await processRefundService(
      mockAdminId,
      mockPaymentId.toString(),
      { reason: "Customer requested normal refund" }
    );

    // Document must be held in refund_pending, NOT finalized as refunded
    assert.equal(mockDoc.status, "refund_pending", "Status must be 'refund_pending' for pending gateway response");
    assert.equal(mockDoc.refundId, pendingRefundId);
    assert.equal(mockDoc.saveCalled, true);

    // Notification must indicate initiated, not completed
    assert.ok(notificationPayload);
    assert.equal(notificationPayload.title, "Refund Initiated");
    assert.match(notificationPayload.message, /initiated and is pending bank processing/i);

    // Return payload contract
    assert.equal(result.status, "refund_pending");
    assert.equal(result.message, "Refund initiated and pending settlement");
  });

  // =========================================================================
  // SCENARIO 3: Failed Razorpay Refund
  // =========================================================================
  test("3. Failed Razorpay refund: maps to HTTP 502, safely restores payment status to 'captured'", async () => {
    const mockDoc = createMockPayment();
    let updateOneCalledWith = null;

    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status; // Moves to refund_pending
        return mockDoc;
      }
    });

    Payment.updateOne = async (query, update) => {
      updateOneCalledWith = { query, update };
      mockDoc.status = update.$set.status;
    };

    // Razorpay returns 400 Bad Request error (e.g., merchant account insufficient balance)
    razorpay.payments.refund = async () => {
      const err = new Error("The payment cannot be refunded due to insufficient balance in Razorpay account");
      err.statusCode = 400; // Razorpay SDK sets 400
      err.error = { description: "Insufficient balance in Razorpay account", code: "BAD_REQUEST_ERROR" };
      throw err;
    };

    let errorCaught = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Failed test" });
    } catch (err) {
      errorCaught = err;
    }

    // Must map upstream rejection to 502 Bad Gateway (not misleading 400 client error)
    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 502, "Upstream gateway rejection must map to HTTP 502");
    assert.equal(errorCaught.code, "PAYMENT_GATEWAY_ERROR");
    assert.match(errorCaught.message, /Razorpay refund failed: Insufficient balance/i);

    // Must safely restore status back to 'captured'
    assert.equal(mockDoc.status, "captured", "Payment status must be safely restored to 'captured'");
    assert.equal(updateOneCalledWith.update.$set.status, "captured");
    assert.match(updateOneCalledWith.update.$set.failureReason, /Refund rejected/i);
  });

  // =========================================================================
  // SCENARIO 4: Invalid Gateway Response
  // =========================================================================
  test("4. Invalid gateway response: throws HTTP 502 if response missing refund ID", async () => {
    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status;
        return mockDoc;
      }
    });

    // Returns response object missing .id
    razorpay.payments.refund = async () => ({ status: "processed" });

    let errorCaught = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Test invalid response" });
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 502);
    assert.equal(errorCaught.code, "INVALID_GATEWAY_RESPONSE");
  });

  // =========================================================================
  // SCENARIO 5: Database Write Failure After Gateway Success
  // =========================================================================
  test("5. Database write failure after gateway success: preserves real refund ID, blocks duplicate refunds, logs reconciliation error", async () => {
    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status; // moves to refund_pending
        return mockDoc;
      }
    });

    const realGatewayRefundId = "rfnd_persist_fail_998877";
    razorpay.payments.refund = async () => ({
      id: realGatewayRefundId,
      status: "processed"
    });

    // Simulate primary payment.save() throwing DB error
    mockDoc.save = async () => {
      throw new Error("MongoNetworkTimeoutError: connection lost during save()");
    };

    // Simulate secondary fallback updateOne also failing
    Payment.updateOne = async () => {
      throw new Error("MongoNetworkTimeoutError: secondary update failed");
    };

    let errorCaught = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Persistence failure test" });
    } catch (err) {
      errorCaught = err;
    }

    // Must preserve real refund ID in error and error log
    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 500);
    assert.equal(errorCaught.code, "DATABASE_RECONCILIATION_DEFERRED");
    assert.equal(errorCaught.refundId, realGatewayRefundId, "Real refund ID must be preserved");

    // The payment document in DB remains in 'refund_pending' (from the initial atomic claim)
    assert.equal(mockDoc.status, "refund_pending", "Must remain held in refund_pending to prevent duplicate refunds");
  });

  // =========================================================================
  // SCENARIO 6: Refund Webhook Processed Event
  // =========================================================================
  test("6. Refund webhook processed event: transitions 'refund_pending' to 'refunded' idempotently", async () => {
    const mockDoc = createMockPayment({ status: "refund_pending", razorpayPaymentId: "pay_wh_test_101" });
    Payment.findOne = () => ({
      populate: async () => mockDoc
    });

    const rawBody = JSON.stringify({
      entity: "event",
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_wh_proc_5544",
            payment_id: "pay_wh_test_101",
            amount: 150000,
            status: "processed"
          }
        }
      }
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    let notificationSent = false;
    Notification.create = async () => {
      notificationSent = true;
    };

    // First call: processes refund
    const result1 = await handleRazorpayWebhookService(rawBody, validSignature);
    assert.equal(result1.received, true);
    assert.equal(mockDoc.status, "refunded");
    assert.equal(mockDoc.refundId, "rfnd_wh_proc_5544");
    assert.equal(mockDoc.saveCalled, true);
    assert.equal(notificationSent, true);

    // Second call: idempotent, already processed
    mockDoc.saveCalled = false;
    notificationSent = false;
    const result2 = await handleRazorpayWebhookService(rawBody, validSignature);
    assert.equal(result2.received, true);
    assert.equal(result2.status, "already_processed");
    assert.equal(mockDoc.saveCalled, false, "Must not re-save on duplicate webhook event");
    assert.equal(notificationSent, false, "Must not re-notify on duplicate webhook event");
  });

  // =========================================================================
  // SCENARIO 7: Refund Webhook Failed Event
  // =========================================================================
  test("7. Refund webhook failed event: safely reverts 'refund_pending' to 'captured' idempotently", async () => {
    const mockDoc = createMockPayment({ status: "refund_pending", razorpayPaymentId: "pay_wh_test_202" });
    Payment.findOne = () => mockDoc;

    const rawBody = JSON.stringify({
      entity: "event",
      event: "refund.failed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_wh_fail_9900",
            payment_id: "pay_wh_test_202",
            amount: 150000,
            status: "failed",
            error_description: "Beneficiary bank account closed"
          }
        }
      }
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    // First call: reverts to captured
    const result1 = await handleRazorpayWebhookService(rawBody, validSignature);
    assert.equal(result1.received, true);
    assert.equal(mockDoc.status, "captured");
    assert.equal(mockDoc.refundId, null);
    assert.match(mockDoc.failureReason, /Beneficiary bank account closed/);

    // Second call: idempotent, already reverted
    mockDoc.saveCalled = false;
    const result2 = await handleRazorpayWebhookService(rawBody, validSignature);
    assert.equal(result2.received, true);
    assert.equal(result2.status, "already_processed");
    assert.equal(mockDoc.saveCalled, false);
  });

  // =========================================================================
  // SCENARIO 8: Duplicate Simultaneous Refund Requests
  // =========================================================================
  test("8. Duplicate simultaneous refund requests: atomic claim prevents double refund; second gets HTTP 409", async () => {
    const mockDoc = createMockPayment({ status: "captured" });
    let razorpayCallCount = 0;

    // Simulate atomic findOneAndUpdate in MongoDB
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        // Only matches if current status is captured/authorized
        if (["captured", "authorized"].includes(mockDoc.status)) {
          mockDoc.status = update.$set.status; // moves to refund_pending
          return mockDoc;
        }
        return null; // Atomic collision: already claimed
      }
    });

    Payment.findById = async () => mockDoc;

    razorpay.payments.refund = async () => {
      razorpayCallCount++;
      return { id: "rfnd_simultaneous_test_123", status: "processed" };
    };

    // Request 1 and Request 2 fired concurrently
    const promise1 = processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Admin 1" });
    const promise2 = processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Admin 2" });

    const results = await Promise.allSettled([promise1, promise2]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one request must succeed");
    assert.equal(rejected.length, 1, "The duplicate request must be rejected");

    assert.equal(rejected[0].reason.statusCode, 409, "Rejected request must have HTTP 409");
    assert.match(rejected[0].reason.message, /already (been refunded|in progress)/i);

    assert.equal(razorpayCallCount, 1, "Razorpay refund must be called exactly once");
  });

  // =========================================================================
  // SCENARIO 9: Gateway Timeout with Uncertain Outcome
  // =========================================================================
  test("9. Gateway timeout with uncertain outcome: leaves payment in 'refund_pending' for reconciliation, does NOT reset to 'captured'", async () => {
    const mockDoc = createMockPayment();
    let updatedFailureReason = null;

    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status; // moves to refund_pending
        return mockDoc;
      }
    });

    Payment.updateOne = async (query, update) => {
      if (update.$set.failureReason) {
        updatedFailureReason = update.$set.failureReason;
      }
      if (update.$set.status) {
        mockDoc.status = update.$set.status;
      }
    };

    // Razorpay throws network timeout error
    razorpay.payments.refund = async () => {
      const timeoutErr = new Error("ETIMEDOUT: Connection timed out to api.razorpay.com");
      timeoutErr.code = "ETIMEDOUT";
      throw timeoutErr;
    };

    let errorCaught = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Timeout test" });
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 502);
    assert.equal(errorCaught.code, "GATEWAY_TIMEOUT_RECONCILIATION_REQUIRED");
    assert.match(errorCaught.message, /timed out with uncertain gateway outcome/i);

    // CRITICAL: Document must remain in refund_pending for reconciliation, NOT reset to captured
    assert.equal(mockDoc.status, "refund_pending", "Payment must NOT be reset to captured when gateway outcome is uncertain");
    assert.match(updatedFailureReason, /Refund pending reconciliation: Gateway network timeout/);
  });

  // =========================================================================
  // SCENARIO 10: Invalid Webhook Signature
  // =========================================================================
  test("10. Invalid webhook signature: rejects request with HTTP 400", async () => {
    const rawBody = JSON.stringify({ event: "refund.processed" });
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    let errorCaught = null;
    try {
      await handleRazorpayWebhookService(rawBody, forgedSignature);
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 400);
    assert.match(errorCaught.message, /Invalid Razorpay webhook signature/i);
  });

  // =========================================================================
  // SCENARIO 11: Missing Gateway Credentials
  // =========================================================================
  test("11. Missing gateway credentials: throws HTTP 503 and reverts payment status to 'captured'", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status;
        return mockDoc;
      }
    });

    Payment.updateOne = async (query, update) => {
      mockDoc.status = update.$set.status;
    };

    let errorCaught = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), { reason: "Missing credentials" });
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 503);
    assert.equal(errorCaught.code, "PAYMENT_GATEWAY_UNAVAILABLE");
    assert.equal(mockDoc.status, "captured", "Status must be reverted back to captured");
  });

  // =========================================================================
  // SCENARIO 12: Input Validations
  // =========================================================================
  test("12. Validations: invalid ID format (400), non-existent (404), already refunded (409), unrefundable status (400), missing gateway ID (400)", async () => {
    // 12a. Invalid ID format
    let err1 = null;
    try {
      await processRefundService(mockAdminId, "invalid-mongo-id", {});
    } catch (e) {
      err1 = e;
    }
    assert.equal(err1?.statusCode, 400);

    // 12b. Non-existent payment
    Payment.findOneAndUpdate = () => ({ populate: async () => null });
    Payment.findById = async () => null;
    let err2 = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), {});
    } catch (e) {
      err2 = e;
    }
    assert.equal(err2?.statusCode, 404);

    // 12c. Already refunded payment
    const refundedDoc = createMockPayment({ status: "refunded" });
    Payment.findById = async () => refundedDoc;
    let err3 = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), {});
    } catch (e) {
      err3 = e;
    }
    assert.equal(err3?.statusCode, 409);

    // 12d. Unrefundable status (created, failed)
    for (const badStatus of ["created", "failed"]) {
      const badDoc = createMockPayment({ status: badStatus });
      Payment.findById = async () => badDoc;
      let err4 = null;
      try {
        await processRefundService(mockAdminId, mockPaymentId.toString(), {});
      } catch (e) {
        err4 = e;
      }
      assert.equal(err4?.statusCode, 400);
    }

    // 12e. Missing razorpayPaymentId
    const missingGwDoc = createMockPayment({ razorpayPaymentId: null });
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        missingGwDoc.status = update.$set.status;
        return missingGwDoc;
      }
    });
    Payment.updateOne = async (query, update) => {
      missingGwDoc.status = update.$set.status;
    };
    let err5 = null;
    try {
      await processRefundService(mockAdminId, mockPaymentId.toString(), {});
    } catch (e) {
      err5 = e;
    }
    assert.equal(err5?.statusCode, 400);
    assert.equal(err5?.code, "PAYMENT_GATEWAY_ID_MISSING");
    assert.equal(missingGwDoc.status, "captured");
  });

  // =========================================================================
  // SCENARIO 13: Controller Integration
  // =========================================================================
  test("13. Controller integration: processRefund returns HTTP 200 on success and passes error to next on failure", async () => {
    const mockDoc = createMockPayment();
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDoc.status = update.$set.status;
        return mockDoc;
      }
    });

    const realGatewayRefundId = "rfnd_ctrl_test_7788";
    razorpay.payments.refund = async () => ({ id: realGatewayRefundId, status: "processed" });
    Notification.create = async () => {};
    AdminLog.create = async () => {};

    // Success test
    const req = {
      user: { userId: mockAdminId },
      params: { paymentId: mockPaymentId.toString() },
      body: { reason: "Controller success test" },
      headers: {}
    };

    let resCode = null;
    let resPayload = null;
    const res = {
      status(code) {
        resCode = code;
        return {
          json(p) {
            resPayload = p;
          }
        };
      }
    };

    let nextCalled = null;
    await processRefund(req, res, (err) => {
      nextCalled = err;
    });

    assert.equal(resCode, 200);
    assert.equal(resPayload.success, true);
    assert.equal(resPayload.refundId, realGatewayRefundId);
    assert.equal(resPayload.status, "refunded");
    assert.equal(nextCalled, null);

    // Failure test
    const mockDocFailure = createMockPayment({ status: "captured" });
    Payment.findOneAndUpdate = (query, update) => ({
      populate: async () => {
        mockDocFailure.status = update.$set.status;
        return mockDocFailure;
      }
    });

    razorpay.payments.refund = async () => {
      throw new Error("Razorpay connection dropped");
    };

    let nextError = null;
    await processRefund(req, res, (err) => {
      nextError = err;
    });

    assert.ok(nextError);
    assert.equal(nextError.statusCode, 502);
  });
});
