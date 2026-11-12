/**
 * LegalConnect Phase 5: Client Detail Appointment Payment Status Mapping Test Suite
 *
 * Covers:
 * 1. Captured payment maps to isPaid: true, paymentStatus: 'paid'.
 * 2. Created or authorized payment is not incorrectly marked as paid (isPaid: false).
 * 3. Failed payment is not marked as paid (isPaid: false, paymentStatus: 'failed').
 * 4. Refund-pending payment is represented correctly (isPaid: false, paymentStatus: 'refund_pending').
 * 5. Refunded payment is not shown as currently paid (isPaid: false, paymentStatus: 'refunded').
 * 6. Appointment without a Payment document is handled safely (isPaid: false, paymentStatus: 'unpaid').
 * 7. Multiple appointments do not receive another appointment's payment status (isolation).
 * 8. Existing client detail response structure remains compatible.
 * 9. Unauthorized users cannot access protected client details (404 lawyer, 403 no shared appointments, 404 client).
 *
 * Run with:
 *   node --test backend/tests/clientDetailPaymentMapping.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { getAuthorizedClientDetailService } = require("../src/services/lawyerService");
const Lawyer = require("../src/models/Lawyer");
const User = require("../src/models/User");
const Appointment = require("../src/models/Appointment");
const Payment = require("../src/models/Payment");

describe("Phase 5: Appointment Payment Status Mapping in Client Detail Service", () => {
  let originalLawyerFindOne;
  let originalUserFindOne;
  let originalAppointmentFind;
  let originalPaymentFind;

  const mockLawyerUserId = new mongoose.Types.ObjectId();
  const mockLawyerId = new mongoose.Types.ObjectId();
  const mockClientId = new mongoose.Types.ObjectId();

  const mockLawyer = {
    _id: mockLawyerId,
    user: mockLawyerUserId,
    verificationStatus: "approved",
    isAvailable: true
  };

  const mockClient = {
    _id: mockClientId,
    role: "client",
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+919876543210",
    profileImage: "https://example.com/avatar.jpg",
    cityVillage: "Noida",
    district: "Gautam Buddha Nagar",
    state: "Uttar Pradesh",
    createdAt: new Date("2024-01-15T10:00:00Z")
  };

  beforeEach(() => {
    originalLawyerFindOne = Lawyer.findOne;
    originalUserFindOne = User.findOne;
    originalAppointmentFind = Appointment.find;
    originalPaymentFind = Payment.find;

    Lawyer.findOne = async () => mockLawyer;
    User.findOne = () => ({
      select: () => ({
        lean: async () => mockClient
      })
    });
  });

  afterEach(() => {
    Lawyer.findOne = originalLawyerFindOne;
    User.findOne = originalUserFindOne;
    Appointment.find = originalAppointmentFind;
    Payment.find = originalPaymentFind;
  });

  function createAppointment(overrides = {}) {
    return {
      _id: new mongoose.Types.ObjectId(),
      lawyer: mockLawyerId,
      client: mockClientId,
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 30,
      consultationType: "video",
      status: "confirmed",
      notes: "Property dispute consultation",
      meetingRoomId: "room_12345",
      createdAt: new Date(),
      ...overrides
    };
  }

  // =========================================================================
  // 1. CAPTURED PAYMENT MAPS TO PAID STATE
  // =========================================================================
  test("1. Captured payment maps to isPaid: true and paymentStatus: 'paid'", async () => {
    const app = createAppointment({ status: "confirmed" });
    const paidAtDate = new Date("2024-05-10T12:00:00Z");

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              _id: new mongoose.Types.ObjectId(),
              appointment: app._id,
              status: "captured",
              amount: 150000,
              paidAt: paidAtDate,
              createdAt: paidAtDate
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);

    assert.equal(result.appointments.length, 1);
    const enriched = result.appointments[0];
    assert.equal(enriched.isPaid, true, "Captured payment must map to isPaid: true");
    assert.equal(enriched.paymentStatus, "paid");
    assert.equal(enriched.paidAt, paidAtDate);
  });

  // =========================================================================
  // 2. CREATED AND AUTHORIZED STATUSES ARE NOT MARKED AS PAID
  // =========================================================================
  test("2. Created or authorized payments are not marked as paid (isPaid: false)", async () => {
    const appCreated = createAppointment();
    const appAuthorized = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [appCreated, appAuthorized]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: appCreated._id,
              status: "created",
              amount: 150000,
              paidAt: null
            },
            {
              appointment: appAuthorized._id,
              status: "authorized",
              amount: 150000,
              paidAt: null
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);

    const mappedCreated = result.appointments.find((a) => a._id.toString() === appCreated._id.toString());
    assert.equal(mappedCreated.isPaid, false, "Created payment must have isPaid: false");
    assert.equal(mappedCreated.paymentStatus, "created");

    const mappedAuthorized = result.appointments.find((a) => a._id.toString() === appAuthorized._id.toString());
    assert.equal(mappedAuthorized.isPaid, false, "Authorized payment must have isPaid: false");
    assert.equal(mappedAuthorized.paymentStatus, "authorized");
  });

  // =========================================================================
  // 3. FAILED PAYMENT IS NOT MARKED AS PAID
  // =========================================================================
  test("3. Failed payment is not marked as paid (isPaid: false, paymentStatus: 'failed')", async () => {
    const app = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: app._id,
              status: "failed",
              amount: 150000,
              paidAt: null
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false, "Failed payment must have isPaid: false");
    assert.equal(enriched.paymentStatus, "failed");
    assert.equal(enriched.paidAt, null);
  });

  // =========================================================================
  // 4. REFUND-PENDING PAYMENT IS REPRESENTED CORRECTLY
  // =========================================================================
  test("4. Refund-pending payment is represented correctly (isPaid: false, paymentStatus: 'refund_pending')", async () => {
    const app = createAppointment({ status: "cancelled" });

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: app._id,
              status: "refund_pending",
              amount: 150000,
              paidAt: new Date()
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false, "Refund-pending payment must not be considered paid");
    assert.equal(enriched.paymentStatus, "refund_pending");
  });

  // =========================================================================
  // 5. REFUNDED PAYMENT IS NOT SHOWN AS CURRENTLY PAID
  // =========================================================================
  test("5. Refunded payment is not shown as currently paid (isPaid: false, paymentStatus: 'refunded')", async () => {
    const app = createAppointment({ status: "cancelled" });

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: app._id,
              status: "refunded",
              amount: 150000,
              paidAt: new Date("2024-04-01")
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false, "Refunded payment must have isPaid: false");
    assert.equal(enriched.paymentStatus, "refunded");
  });

  // =========================================================================
  // 6. APPOINTMENT WITHOUT A PAYMENT DOCUMENT IS HANDLED SAFELY
  // =========================================================================
  test("6. Appointment without a Payment document is handled safely (isPaid: false, paymentStatus: 'unpaid')", async () => {
    const app = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [] // No payment records in DB
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false);
    assert.equal(enriched.paymentStatus, "unpaid");
    assert.equal(enriched.paidAt, null);
  });

  // =========================================================================
  // 7. MULTIPLE APPOINTMENTS ISOLATION
  // =========================================================================
  test("7. Multiple appointments do not receive another appointment's payment status", async () => {
    const appPaid = createAppointment({ consultationType: "video" });
    const appRefunded = createAppointment({ consultationType: "chat" });
    const appUnpaid = createAppointment({ consultationType: "in-person" });
    const appFailed = createAppointment({ consultationType: "both" });

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [appPaid, appRefunded, appUnpaid, appFailed]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: appPaid._id,
              status: "captured",
              amount: 200000,
              paidAt: new Date("2024-05-01")
            },
            {
              appointment: appRefunded._id,
              status: "refunded",
              amount: 150000,
              paidAt: new Date("2024-04-10")
            },
            {
              appointment: appFailed._id,
              status: "failed",
              amount: 100000,
              paidAt: null
            }
            // appUnpaid has no payment document
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    assert.equal(result.appointments.length, 4);

    const mPaid = result.appointments.find((a) => a._id.toString() === appPaid._id.toString());
    const mRefunded = result.appointments.find((a) => a._id.toString() === appRefunded._id.toString());
    const mUnpaid = result.appointments.find((a) => a._id.toString() === appUnpaid._id.toString());
    const mFailed = result.appointments.find((a) => a._id.toString() === appFailed._id.toString());

    assert.equal(mPaid.isPaid, true);
    assert.equal(mPaid.paymentStatus, "paid");

    assert.equal(mRefunded.isPaid, false);
    assert.equal(mRefunded.paymentStatus, "refunded");

    assert.equal(mUnpaid.isPaid, false);
    assert.equal(mUnpaid.paymentStatus, "unpaid");

    assert.equal(mFailed.isPaid, false);
    assert.equal(mFailed.paymentStatus, "failed");
  });

  // =========================================================================
  // 8. RESPONSE STRUCTURE COMPATIBILITY & PRIVACY
  // =========================================================================
  test("8. Existing client detail response structure remains compatible without leaking payment secrets", async () => {
    const app = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [
            {
              appointment: app._id,
              status: "captured",
              amount: 150000,
              paidAt: new Date(),
              // Sensitive fields that MUST NOT leak
              razorpayPaymentId: "pay_secret_9988",
              razorpayOrderId: "order_secret_1234",
              refundId: "rfnd_secret_5678"
            }
          ]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);

    // Verify top-level contract
    assert.ok(result.client);
    assert.equal(result.appointmentsCount, 1);
    assert.ok(Array.isArray(result.appointments));

    // Verify client fields
    assert.equal(result.client.name, "Rohan Verma");
    assert.equal(result.client.email, "rohan.verma@example.com");
    assert.equal(result.client.phone, "+919876543210");
    assert.equal(result.client.cityVillage, "Noida");

    // Verify appointment fields
    const enriched = result.appointments[0];
    assert.equal(enriched.consultationType, "video");
    assert.equal(enriched.durationMinutes, 30);
    assert.equal(enriched.status, "confirmed");
    assert.equal(enriched.notes, "Property dispute consultation");
    assert.equal(enriched.isPaid, true);

    // Verify sensitive gateway fields are NOT leaked
    assert.equal(enriched.razorpayPaymentId, undefined, "razorpayPaymentId must not be leaked");
    assert.equal(enriched.razorpayOrderId, undefined, "razorpayOrderId must not be leaked");
    assert.equal(enriched.refundId, undefined, "refundId must not be leaked");
  });

  // =========================================================================
  // 9. AUTHORIZATION PROTECTION
  // =========================================================================
  test("9. Unauthorized requests are strictly blocked (missing lawyer: 404, no shared appointments: 403, missing client: 404)", async () => {
    // 9a. Lawyer profile not found
    Lawyer.findOne = async () => null;

    let err9a = null;
    try {
      await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    } catch (err) {
      err9a = err;
    }
    assert.equal(err9a?.statusCode, 404);
    assert.match(err9a?.message, /Lawyer profile not found/i);

    // 9b. Lawyer and client have no appointments together
    Lawyer.findOne = async () => mockLawyer;
    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [] // No appointments found
        })
      })
    });

    let err9b = null;
    try {
      await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    } catch (err) {
      err9b = err;
    }
    assert.equal(err9b?.statusCode, 403);
    assert.match(err9b?.message, /not authorized to view this client profile/i);

    // 9c. Client account not found
    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [createAppointment()]
        })
      })
    });
    User.findOne = () => ({
      select: () => ({
        lean: async () => null // Client deleted
      })
    });

    let err9c = null;
    try {
      await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    } catch (err) {
      err9c = err;
    }
    assert.equal(err9c?.statusCode, 404);
    assert.match(err9c?.message, /Client account not found/i);
  });

  // =========================================================================
  // 10. MULTIPLE PAYMENTS FOR ONE APPOINTMENT: OLDER REFUNDED -> NEWER CAPTURED
  // =========================================================================
  test("10. Older refunded payment followed by newer captured payment maps to paid", async () => {
    const app = createAppointment();
    const paidAtDate = new Date("2024-05-02T10:00:00Z");

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    const olderRefunded = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "refunded",
      createdAt: new Date("2024-05-01T10:00:00Z")
    };
    const newerCaptured = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "captured",
      paidAt: paidAtDate,
      createdAt: paidAtDate
    };

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [newerCaptured, olderRefunded]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, true, "Newer captured payment must not be overwritten by older refunded payment");
    assert.equal(enriched.paymentStatus, "paid");
    assert.equal(enriched.paidAt, paidAtDate);
  });

  // =========================================================================
  // 11. MULTIPLE PAYMENTS FOR ONE APPOINTMENT: OLDER CAPTURED -> NEWER REFUNDED
  // =========================================================================
  test("11. Older captured payment followed by newer refunded payment maps to refunded", async () => {
    const app = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    const olderCaptured = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "captured",
      paidAt: new Date("2024-05-01T10:00:00Z"),
      createdAt: new Date("2024-05-01T10:00:00Z")
    };
    const newerRefunded = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "refunded",
      createdAt: new Date("2024-05-02T10:00:00Z")
    };

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [newerRefunded, olderCaptured]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false, "Newer refunded payment must take precedence over older captured payment");
    assert.equal(enriched.paymentStatus, "refunded");
  });

  // =========================================================================
  // 12. MULTIPLE PAYMENTS FOR ONE APPOINTMENT: OLDER CAPTURED -> NEWER REFUND_PENDING
  // =========================================================================
  test("12. Older captured payment followed by newer refund_pending payment maps to refund_pending", async () => {
    const app = createAppointment();

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    const olderCaptured = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "captured",
      paidAt: new Date("2024-05-01T10:00:00Z"),
      createdAt: new Date("2024-05-01T10:00:00Z")
    };
    const newerRefundPending = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "refund_pending",
      createdAt: new Date("2024-05-02T10:00:00Z")
    };

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [newerRefundPending, olderCaptured]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false, "Newer refund_pending state must take precedence over older captured state");
    assert.equal(enriched.paymentStatus, "refund_pending");
  });

  // =========================================================================
  // 13. MULTIPLE PAYMENTS FOR ONE APPOINTMENT: OLDER CAPTURED -> NEWER FAILED ATTEMPT
  // =========================================================================
  test("13. Older captured payment followed by newer failed attempt retains paid status", async () => {
    const app = createAppointment();
    const paidAtDate = new Date("2024-05-01T10:00:00Z");

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    const olderCaptured = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "captured",
      paidAt: paidAtDate,
      createdAt: paidAtDate
    };
    const newerFailed = {
      _id: new mongoose.Types.ObjectId(),
      appointment: app._id,
      status: "failed",
      createdAt: new Date("2024-05-02T10:00:00Z")
    };

    Payment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [newerFailed, olderCaptured]
        })
      })
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, true, "Later failed attempt must not erase earlier successful captured payment");
    assert.equal(enriched.paymentStatus, "paid");
    assert.equal(enriched.paidAt, paidAtDate);
  });

  // =========================================================================
  // 14. DETERMINISTIC TIE-BREAKING USING _id WHEN createdAt IS IDENTICAL
  // =========================================================================
  test("14. Two payment records with identical createdAt verify deterministic tie-breaking using _id", async () => {
    const app = createAppointment();
    const sharedCreatedAt = new Date("2024-05-01T12:00:00.000Z");

    Appointment.find = () => ({
      sort: () => ({
        select: () => ({
          lean: async () => [app]
        })
      })
    });

    const idSmaller = new mongoose.Types.ObjectId("650000000000000000000001");
    const idLarger = new mongoose.Types.ObjectId("650000000000000000000002");

    const paymentOlderId = {
      _id: idSmaller,
      appointment: app._id,
      status: "created",
      createdAt: sharedCreatedAt
    };
    const paymentNewerId = {
      _id: idLarger,
      appointment: app._id,
      status: "failed",
      createdAt: sharedCreatedAt
    };

    Payment.find = () => ({
      sort: (sortCriteria) => {
        assert.deepEqual(
          sortCriteria,
          { createdAt: -1, _id: -1 },
          "Payment query must specify deterministic sort { createdAt: -1, _id: -1 }"
        );
        return {
          select: () => ({
            lean: async () => {
              const unsorted = [paymentOlderId, paymentNewerId];
              return unsorted.sort((a, b) => {
                const diffTime = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (diffTime !== 0) return diffTime;
                return b._id.toString().localeCompare(a._id.toString());
              });
            }
          })
        };
      }
    });

    const result = await getAuthorizedClientDetailService(mockLawyerUserId, mockClientId);
    const enriched = result.appointments[0];

    assert.equal(enriched.isPaid, false);
    assert.equal(enriched.paymentStatus, "failed", "Tie-breaker by _id: -1 must deterministically select payment with larger _id");
  });
});

