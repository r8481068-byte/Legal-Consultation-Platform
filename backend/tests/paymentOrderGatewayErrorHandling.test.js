/**
 * Payment Order Gateway Error Handling & Authentication Isolation Test Suite
 *
 * Verifies:
 * 1. Upstream Razorpay 401 Authentication failure is trapped and mapped to HTTP 502 (NEVER 401)
 * 2. Error message clearly identifies gateway credential issue rather than generic 'Internal server error'
 * 3. Upstream Razorpay general errors map to HTTP 502 Bad Gateway
 * 4. Successful Razorpay order creation returns valid order details
 * 5. Global error handler correctly converts upstream 401 to 502 and formats message
 * 6. Payment verification handles upstream gateway fetch failures as HTTP 502 Bad Gateway
 *
 * Run with:
 *   node --test backend/tests/paymentOrderGatewayErrorHandling.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Ensure environment variables are configured before requiring razorpay
process.env.RAZORPAY_KEY_ID = "rzp_test_mockKey123";
process.env.RAZORPAY_KEY_SECRET = "mockSecretKey456";

const { createPaymentOrderService, verifyPaymentService } = require("../src/services/paymentService");
const errorHandler = require("../src/middleware/errorMiddleware");
const Appointment = require("../src/models/Appointment");
const Payment = require("../src/models/Payment");
const User = require("../src/models/User");
const razorpay = require("../src/config/razorpay");

describe("Payment Order Gateway Error Handling & Auth Isolation", () => {
  let originalUserFindById;
  let originalAppointmentFindById;
  let originalPaymentFindOne;
  let originalPaymentFindOneAndUpdate;
  let originalPaymentUpdateOne;
  let originalRazorpayOrdersCreate;
  let originalRazorpayPaymentsFetch;

  const mockClientId = new mongoose.Types.ObjectId();
  const mockAppointmentId = new mongoose.Types.ObjectId();
  const mockPaymentId = new mongoose.Types.ObjectId();

  const mockClientUser = {
    _id: mockClientId,
    role: "client",
    name: "Payment Test Client",
    email: "client@test.com",
    phone: "9876543210",
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    state: "Delhi",
    district: "New Delhi",
    subDistrict: "Chanakyapuri",
    locality: "Connaught Place",
    cityVillage: "New Delhi",
    pincode: "110001",
    addressLine: "123 Test Street",
    aadhaarMasked: "XXXXXXXX9012",
    panMasked: "ABCDE1234F",
    aadhaarNumberEncrypted: "enc_aadhaar_mock",
    panNumberEncrypted: "enc_pan_mock",
    identityStatus: "verified",
  };

  const mockAppointment = {
    _id: mockAppointmentId,
    client: mockClientId,
    status: "pending",
    lawyer: {
      consultationFee: 1500,
      verificationStatus: "approved",
      isAvailable: true,
    },
  };

  const mockPaymentDoc = {
    _id: mockPaymentId,
    appointment: mockAppointmentId,
    client: mockClientId,
    amount: 150000,
    currency: "INR",
    status: "created",
    razorpayOrderId: null,
    orderInProgress: false,
    save: async function () {
      return this;
    },
  };

  beforeEach(() => {
    originalUserFindById = User.findById;
    originalAppointmentFindById = Appointment.findById;
    originalPaymentFindOne = Payment.findOne;
    originalPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
    originalPaymentUpdateOne = Payment.updateOne;
    originalRazorpayOrdersCreate = razorpay.orders?.create;
    originalRazorpayPaymentsFetch = razorpay.payments?.fetch;

    User.findById = async () => mockClientUser;

    Appointment.findById = () => ({
      populate: async () => mockAppointment,
    });

    Payment.findOne = async () => null;

    Payment.findOneAndUpdate = async () => ({ ...mockPaymentDoc });

    Payment.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });
  });

  afterEach(() => {
    User.findById = originalUserFindById;
    Appointment.findById = originalAppointmentFindById;
    Payment.findOne = originalPaymentFindOne;
    Payment.findOneAndUpdate = originalPaymentFindOneAndUpdate;
    Payment.updateOne = originalPaymentUpdateOne;
    if (razorpay.orders) {
      razorpay.orders.create = originalRazorpayOrdersCreate;
    }
    if (razorpay.payments) {
      razorpay.payments.fetch = originalRazorpayPaymentsFetch;
    }
  });

  test("1. Upstream Razorpay 401 authentication failure is mapped to HTTP 502 with PAYMENT_GATEWAY_AUTH_FAILED (NEVER 401)", async () => {
    razorpay.orders.create = async () => {
      const err = new Error();
      err.statusCode = 401;
      err.error = {
        code: "BAD_REQUEST_ERROR",
        description: "Authentication failed",
      };
      throw err;
    };

    await assert.rejects(
      async () => {
        await createPaymentOrderService(mockClientId, mockAppointmentId);
      },
      (err) => {
        assert.equal(err.statusCode, 502, "Must be HTTP 502 Bad Gateway, NEVER 401");
        assert.equal(err.code, "PAYMENT_GATEWAY_AUTH_FAILED");
        assert.ok(
          err.message.includes("Payment gateway authentication failed: Authentication failed"),
          `Expected informative message, got: ${err.message}`
        );
        return true;
      }
    );
  });

  test("2. Upstream Razorpay general gateway failure is mapped to HTTP 502 with PAYMENT_GATEWAY_ERROR", async () => {
    razorpay.orders.create = async () => {
      const err = new Error("Gateway connection timed out");
      err.statusCode = 504;
      throw err;
    };

    await assert.rejects(
      async () => {
        await createPaymentOrderService(mockClientId, mockAppointmentId);
      },
      (err) => {
        assert.equal(err.statusCode, 502, "Must be HTTP 502 Bad Gateway");
        assert.equal(err.code, "PAYMENT_GATEWAY_ERROR");
        assert.ok(err.message.includes("Gateway connection timed out"));
        return true;
      }
    );
  });

  test("3. Successful Razorpay order creation returns valid payment details", async () => {
    razorpay.orders.create = async () => ({
      id: "order_mock_test_12345",
      amount: 150000,
      currency: "INR",
    });

    const result = await createPaymentOrderService(mockClientId, mockAppointmentId);

    assert.equal(result.paymentId, mockPaymentId);
    assert.equal(result.orderId, "order_mock_test_12345");
    assert.equal(result.amount, 150000);
    assert.equal(result.currency, "INR");
  });

  test("4. Global error handler correctly formats gateway 502 error and avoids generic 'Internal server error'", () => {
    const gatewayError = new Error(
      "Payment gateway authentication failed: Authentication failed. Please verify server Razorpay API credentials."
    );
    gatewayError.statusCode = 502;
    gatewayError.code = "PAYMENT_GATEWAY_AUTH_FAILED";

    let responseStatus = null;
    let responseBody = null;

    const mockRes = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    const mockReq = { originalUrl: "/api/payments/order", method: "POST" };
    const mockNext = () => {};

    errorHandler(gatewayError, mockReq, mockRes, mockNext);

    assert.equal(responseStatus, 502);
    assert.equal(responseBody.success, false);
    assert.equal(responseBody.code, "PAYMENT_GATEWAY_AUTH_FAILED");
    assert.ok(
      responseBody.message.includes("Payment gateway authentication failed"),
      "Message must not be generic 'Internal server error'"
    );
  });

  test("5. Global error handler protects against unexpected upstream errors with statusCode 401 from external services", () => {
    const unhandledExternalError = {
      statusCode: 401,
      error: { code: "BAD_REQUEST_ERROR", description: "Authentication failed" },
    };

    let responseStatus = null;
    let responseBody = null;

    const mockRes = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    const mockReq = { originalUrl: "/api/payments/order", method: "POST" };
    const mockNext = () => {};

    errorHandler(unhandledExternalError, mockReq, mockRes, mockNext);

    assert.equal(responseStatus, 502);
    assert.equal(responseBody.success, false);
    assert.equal(responseBody.message, "Authentication failed");
  });

  test("6. Payment verification handles upstream gateway fetch failures as HTTP 502", async () => {
    const orderId = "order_mock_verify_123";
    const paymentId = "pay_mock_verify_456";

    Payment.findOne = async () => ({
      _id: mockPaymentId,
      client: mockClientId,
      razorpayOrderId: orderId,
      status: "created",
      amount: 150000,
      currency: "INR",
      save: async function () {
        return this;
      },
    });

    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    razorpay.payments.fetch = async () => {
      const err = new Error();
      err.statusCode = 401;
      err.error = { code: "BAD_REQUEST_ERROR", description: "Authentication failed" };
      throw err;
    };

    await assert.rejects(
      async () => {
        await verifyPaymentService(mockClientId, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 502, "Verification gateway error must be HTTP 502, not 401");
        assert.equal(err.code, "PAYMENT_GATEWAY_AUTH_FAILED");
        assert.ok(
          err.message.includes("Payment gateway verification failed"),
          `Expected informative message, got: ${err.message}`
        );
        return true;
      }
    );
  });
});
