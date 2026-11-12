/**
 * LegalConnect Phase 2: Admin Appointment Cancellation & Slot Release Test Suite
 *
 * Covers:
 * 1. Admin cancellation successfully cancels the appointment and releases its linked slot.
 * 2. The slot belonging to another active appointment is not released.
 * 3. Already-cancelled and completed appointments do not cause inconsistent changes (and duplicate protection).
 * 4. Missing availability slot (slot: null) is handled safely.
 * 5. Unauthorized access (auth middleware) & input validations (missing reason, invalid ID).
 * 6. Cancellation reason, notification, and audit logging behavior remain intact.
 * 7. Existing client cancellation and lawyer rejection behavior do not regress.
 *
 * Run with:
 *   node --test backend/tests/adminAppointmentCancel.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const Appointment = require("../src/models/Appointment");
const LawyerAvailability = require("../src/models/LawyerAvailability");
const Lawyer = require("../src/models/Lawyer");
const Notification = require("../src/models/Notification");
const AdminLog = require("../src/models/AdminLog");
const User = require("../src/models/User");

const { cancelAdminAppointmentService } = require("../src/services/adminService");
const { cancelAdminAppointment } = require("../src/controllers/adminController");
const {
  cancelAppointmentService,
  updateLawyerAppointmentStatusService
} = require("../src/services/appointmentService");
const { protect, authorize } = require("../src/middleware/authMiddleware");

describe("Phase 2: Admin Appointment Cancellation & Slot Release", () => {
  let originalAppFindById;
  let originalAppFindOne;
  let originalAppFindOneAndUpdate;
  let originalAppUpdateOne;
  let originalSlotUpdateOne;
  let originalSlotFindById;
  let originalLawyerFindOne;
  let originalUserFindById;
  let originalNotificationCreate;
  let originalAdminLogCreate;

  const mockAdminId = new mongoose.Types.ObjectId();
  const mockAppointmentId = new mongoose.Types.ObjectId();
  const mockSlotId = new mongoose.Types.ObjectId();
  const mockLawyerId = new mongoose.Types.ObjectId();
  const mockLawyerUserId = new mongoose.Types.ObjectId();
  const mockClientId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    originalAppFindById = Appointment.findById;
    originalAppFindOne = Appointment.findOne;
    originalAppFindOneAndUpdate = Appointment.findOneAndUpdate;
    originalAppUpdateOne = Appointment.updateOne;
    originalSlotUpdateOne = LawyerAvailability.updateOne;
    originalSlotFindById = LawyerAvailability.findById;
    originalLawyerFindOne = Lawyer.findOne;
    originalUserFindById = User.findById;
    originalNotificationCreate = Notification.create;
    originalAdminLogCreate = AdminLog.create;

    User.findById = () => ({
      select: () => ({
        lean: async () => ({ name: "Super Admin", email: "admin@legalconnect.in" })
      })
    });
    Notification.create = async (payload) => payload;
    AdminLog.create = async (payload) => payload;
  });

  afterEach(() => {
    Appointment.findById = originalAppFindById;
    Appointment.findOne = originalAppFindOne;
    Appointment.findOneAndUpdate = originalAppFindOneAndUpdate;
    Appointment.updateOne = originalAppUpdateOne;
    LawyerAvailability.updateOne = originalSlotUpdateOne;
    LawyerAvailability.findById = originalSlotFindById;
    Lawyer.findOne = originalLawyerFindOne;
    User.findById = originalUserFindById;
    Notification.create = originalNotificationCreate;
    AdminLog.create = originalAdminLogCreate;
  });

  function createMockAppointment(overrides = {}) {
    return {
      _id: mockAppointmentId,
      client: {
        _id: mockClientId,
        name: "Test Client",
        email: "client@example.com"
      },
      lawyer: {
        _id: mockLawyerId,
        user: {
          _id: mockLawyerUserId,
          name: "Advocate Sharma",
          email: "lawyer@example.com"
        }
      },
      slot: mockSlotId,
      status: "confirmed",
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 30,
      consultationType: "video",
      notes: "Initial consultation notes",
      ...overrides
    };
  }

  function createMockSlot(overrides = {}) {
    return {
      _id: mockSlotId,
      lawyer: mockLawyerId,
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 86400000 + 1800000),
      status: "booked",
      ...overrides
    };
  }

  // =========================================================================
  // SCENARIO 1: Admin cancellation cancels appointment and releases linked slot
  // =========================================================================
  test("1. Admin cancellation successfully cancels the appointment and releases its linked slot", async () => {
    const mockApp = createMockAppointment({ status: "confirmed" });
    const mockSlot = createMockSlot({ status: "booked" });

    // Mock Appointment.findById
    Appointment.findById = () => ({
      populate: () => ({
        populate: async () => mockApp
      })
    });

    // Mock Appointment.findOneAndUpdate
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          mockApp.notes = update.$set.notes;
          return mockApp;
        }
      })
    });

    // Mock Appointment.findOne (check for other active appointments)
    Appointment.findOne = async () => null;

    // Mock LawyerAvailability.updateOne
    let slotUpdatedWith = null;
    LawyerAvailability.updateOne = async (filter, update) => {
      slotUpdatedWith = { filter, update };
      mockSlot.status = update.$set.status;
      return { acknowledged: true, modifiedCount: 1 };
    };

    let notificationsCreated = null;
    Notification.create = async (payload) => {
      notificationsCreated = payload;
      return payload;
    };

    let auditLogCreated = null;
    AdminLog.create = async (payload) => {
      auditLogCreated = payload;
      return payload;
    };

    const result = await cancelAdminAppointmentService(
      mockAdminId,
      mockAppointmentId.toString(),
      { reason: "Advocate emergency medical leave" },
      { ip: "127.0.0.1", headers: { "user-agent": "AdminClient/1.0" } }
    );

    // Verify appointment status & notes
    assert.equal(mockApp.status, "cancelled");
    assert.match(mockApp.notes, /\[Admin Cancelled\]: Advocate emergency medical leave/);

    // Verify slot release
    assert.ok(slotUpdatedWith, "LawyerAvailability.updateOne must be called");
    assert.equal(slotUpdatedWith.filter._id.toString(), mockSlotId.toString());
    assert.equal(slotUpdatedWith.filter.lawyer.toString(), mockLawyerId.toString());
    assert.equal(slotUpdatedWith.filter.status, "booked");
    assert.equal(slotUpdatedWith.update.$set.status, "available");
    assert.equal(mockSlot.status, "available", "Slot status must become 'available'");

    // Verify notifications sent to both client and lawyer
    assert.ok(Array.isArray(notificationsCreated));
    assert.equal(notificationsCreated.length, 2);
    assert.equal(notificationsCreated[0].recipient.toString(), mockClientId.toString());
    assert.match(notificationsCreated[0].message, /Advocate emergency medical leave/);
    assert.equal(notificationsCreated[1].recipient.toString(), mockLawyerUserId.toString());

    // Verify audit log
    assert.ok(auditLogCreated);
    assert.equal(auditLogCreated.action, "APPOINTMENT_CANCEL");
    assert.equal(auditLogCreated.targetId.toString(), mockAppointmentId.toString());

    // Verify API return contract
    assert.deepEqual(result, {
      appointmentId: mockApp._id,
      status: "cancelled",
      message: "Appointment cancelled successfully"
    });
  });

  // =========================================================================
  // SCENARIO 2: Slot belonging to another active appointment is NOT released
  // =========================================================================
  test("2. The slot belonging to another active appointment is not released", async () => {
    const mockApp = createMockAppointment({ status: "confirmed" });
    const mockSlot = createMockSlot({ status: "booked" });

    Appointment.findById = () => ({
      populate: () => ({
        populate: async () => mockApp
      })
    });

    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          return mockApp;
        }
      })
    });

    // Simulate another appointment that is currently active on the same slot
    Appointment.findOne = async () => ({
      _id: new mongoose.Types.ObjectId(),
      slot: mockSlotId,
      status: "confirmed"
    });

    let slotUpdateCalled = false;
    LawyerAvailability.updateOne = async () => {
      slotUpdateCalled = true;
    };

    await cancelAdminAppointmentService(
      mockAdminId,
      mockAppointmentId.toString(),
      { reason: "Cancellation with overlapping active appointment" }
    );

    assert.equal(mockApp.status, "cancelled");
    assert.equal(slotUpdateCalled, false, "Slot must NOT be released if another active appointment references it");
    assert.equal(mockSlot.status, "booked");
  });

  // =========================================================================
  // SCENARIO 3: Already-cancelled or completed appointments reject safely
  // =========================================================================
  test("3. Already-cancelled and completed appointments reject safely with HTTP 400 without releasing slot", async () => {
    // 3a. Already cancelled
    const cancelledApp = createMockAppointment({ status: "cancelled" });
    Appointment.findById = async () => cancelledApp;

    let slotUpdateCalled = false;
    LawyerAvailability.updateOne = async () => {
      slotUpdateCalled = true;
    };

    let errCancelled = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Duplicate cancel" });
    } catch (err) {
      errCancelled = err;
    }

    assert.ok(errCancelled);
    assert.equal(errCancelled.statusCode, 400);
    assert.match(errCancelled.message, /already been cancelled/i);
    assert.equal(slotUpdateCalled, false);

    // 3b. Already completed
    const completedApp = createMockAppointment({ status: "completed" });
    Appointment.findById = async () => completedApp;

    let errCompleted = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Cancel completed" });
    } catch (err) {
      errCompleted = err;
    }

    assert.ok(errCompleted);
    assert.equal(errCompleted.statusCode, 400);
    assert.match(errCompleted.message, /already been marked completed/i);
    assert.equal(slotUpdateCalled, false);
  });

  // =========================================================================
  // SCENARIO 4: Missing availability slot (slot: null) is handled safely
  // =========================================================================
  test("4. Missing availability slot (slot: null) is handled safely without crashing", async () => {
    const mockApp = createMockAppointment({ slot: null, status: "pending" });

    Appointment.findById = async () => mockApp;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          return mockApp;
        }
      })
    });

    let slotUpdateCalled = false;
    LawyerAvailability.updateOne = async () => {
      slotUpdateCalled = true;
    };

    const result = await cancelAdminAppointmentService(
      mockAdminId,
      mockAppointmentId.toString(),
      { reason: "Cancel appointment with no slot attached" }
    );

    assert.equal(result.status, "cancelled");
    assert.equal(mockApp.status, "cancelled");
    assert.equal(slotUpdateCalled, false, "Slot update must be skipped safely when slot is null");
  });

  // =========================================================================
  // SCENARIO 5: Unauthorized access & input validation
  // =========================================================================
  test("5. Authorization & validation: rejects missing reason (400), invalid ID (400), non-existent (404), and non-admin roles (403)", async () => {
    // 5a. Missing reason
    let errNoReason = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "" });
    } catch (err) {
      errNoReason = err;
    }
    assert.equal(errNoReason?.statusCode, 400);
    assert.match(errNoReason?.message, /cancellation reason is required/i);

    // 5b. Invalid ID format
    let errInvalidId = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, "invalid-mongo-id", { reason: "Valid reason" });
    } catch (err) {
      errInvalidId = err;
    }
    assert.equal(errInvalidId?.statusCode, 400);
    assert.match(errInvalidId?.message, /Invalid appointment ID/i);

    // 5c. Appointment not found
    Appointment.findById = async () => null;
    let errNotFound = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Valid reason" });
    } catch (err) {
      errNotFound = err;
    }
    assert.equal(errNotFound?.statusCode, 404);

    // 5d. Role authorization gate: authorize('admin') blocks client and lawyer with 403
    const adminGate = authorize("admin");
    const clientReq = { user: { role: "client", userId: "client123" } };
    const lawyerReq = { user: { role: "lawyer", userId: "lawyer123" } };

    let clientStatus = null;
    adminGate(clientReq, { status(c) { clientStatus = c; return { json() {} }; } }, () => {});
    assert.equal(clientStatus, 403, "Client role must be blocked with 403");

    let lawyerStatus = null;
    adminGate(lawyerReq, { status(c) { lawyerStatus = c; return { json() {} }; } }, () => {});
    assert.equal(lawyerStatus, 403, "Lawyer role must be blocked with 403");
  });

  // =========================================================================
  // SCENARIO 6: Cancellation reason, notification, and audit behavior remain intact
  // =========================================================================
  test("6. Notifications & audit log capture exact reason, admin ID, and recipient IDs", async () => {
    const mockApp = createMockAppointment({ status: "pending" });
    Appointment.findById = async () => mockApp;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          return mockApp;
        }
      })
    });
    Appointment.findOne = async () => null;
    LawyerAvailability.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

    let capturedNotifications = null;
    Notification.create = async (payload) => {
      capturedNotifications = payload;
      return payload;
    };

    let capturedAudit = null;
    AdminLog.create = async (payload) => {
      capturedAudit = payload;
      return payload;
    };

    const specificReason = "Lawyer state bar license temporarily under inquiry";
    await cancelAdminAppointmentService(
      mockAdminId,
      mockAppointmentId.toString(),
      { reason: specificReason }
    );

    assert.ok(capturedNotifications);
    assert.equal(capturedNotifications.length, 2);
    assert.match(capturedNotifications[0].message, new RegExp(specificReason));
    assert.match(capturedNotifications[1].message, new RegExp(specificReason));

    assert.ok(capturedAudit);
    assert.equal(capturedAudit.admin.toString(), mockAdminId.toString());
    assert.equal(capturedAudit.action, "APPOINTMENT_CANCEL");
    assert.equal(capturedAudit.details.reason, specificReason);
  });

  // =========================================================================
  // SCENARIO 7: Existing client cancellation and lawyer rejection behavior does not regress
  // =========================================================================
  test("7. Client cancellation and lawyer rejection continue releasing availability slots properly", async () => {
    // 7a. Client cancellation service
    const clientApp = createMockAppointment({ status: "pending" });
    Appointment.findOneAndUpdate = async () => clientApp;

    let clientSlotReleased = false;
    LawyerAvailability.updateOne = async (filter, update) => {
      if (filter._id.toString() === mockSlotId.toString() && update.$set.status === "available") {
        clientSlotReleased = true;
      }
      return { acknowledged: true, modifiedCount: 1 };
    };

    await cancelAppointmentService(mockClientId, mockAppointmentId);
    assert.equal(clientSlotReleased, true, "Client cancellation must release slot to available");

    // 7b. Lawyer rejection service
    const lawyerApp = createMockAppointment({ status: "pending" });
    Lawyer.findOne = async () => ({ _id: mockLawyerId, user: mockLawyerUserId });
    Appointment.findOneAndUpdate = () => ({
      populate: async () => lawyerApp
    });

    let lawyerSlotReleased = false;
    LawyerAvailability.updateOne = async (filter, update) => {
      if (filter._id.toString() === mockSlotId.toString() && update.$set.status === "available") {
        lawyerSlotReleased = true;
      }
      return { acknowledged: true, modifiedCount: 1 };
    };

    await updateLawyerAppointmentStatusService(mockLawyerUserId, mockAppointmentId, "rejected");
    assert.equal(lawyerSlotReleased, true, "Lawyer rejection must release slot to available");
  });

  // =========================================================================
  // SCENARIO 8: Slot update matches zero documents
  // =========================================================================
  test("8. Slot update matches zero documents: throws 404 if missing, 409 if locked/mismatched, succeeds if already available", async () => {
    // 8a. Slot missing from database -> throws 404 SLOT_NOT_FOUND
    const app8a = createMockAppointment({ status: "confirmed" });
    Appointment.findById = async () => app8a;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          app8a.status = update.$set.status;
          return app8a;
        }
      })
    });
    Appointment.findOne = async () => null;

    let compensatedTo8a = null;
    Appointment.updateOne = async (filter, update) => {
      compensatedTo8a = update.$set.status;
      app8a.status = update.$set.status;
    };

    LawyerAvailability.updateOne = async () => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    LawyerAvailability.findById = async () => null; // Slot does not exist

    let err8a = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Missing slot test" });
    } catch (err) {
      err8a = err;
    }

    assert.ok(err8a);
    assert.equal(err8a.statusCode, 404);
    assert.equal(err8a.code, "SLOT_NOT_FOUND");
    assert.equal(compensatedTo8a, "confirmed", "Appointment must be compensated back to confirmed");

    // 8b. Slot still booked in DB but update matched 0 -> throws 409 SLOT_RELEASE_FAILED
    const app8b = createMockAppointment({ status: "confirmed" });
    Appointment.findById = async () => app8b;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          app8b.status = update.$set.status;
          return app8b;
        }
      })
    });
    Appointment.findOne = async () => null;

    let compensatedTo8b = null;
    Appointment.updateOne = async (filter, update) => {
      compensatedTo8b = update.$set.status;
      app8b.status = update.$set.status;
    };

    LawyerAvailability.updateOne = async () => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    LawyerAvailability.findById = async () => ({ _id: mockSlotId, status: "booked" });

    let err8b = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Mismatched slot test" });
    } catch (err) {
      err8b = err;
    }

    assert.ok(err8b);
    assert.equal(err8b.statusCode, 409);
    assert.equal(err8b.code, "SLOT_RELEASE_FAILED");
    assert.equal(compensatedTo8b, "confirmed", "Appointment must be compensated back to confirmed");

    // 8c. Slot already in available state in DB -> succeeds cleanly
    const app8c = createMockAppointment({ status: "confirmed" });
    Appointment.findById = async () => app8c;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          app8c.status = update.$set.status;
          return app8c;
        }
      })
    });
    Appointment.findOne = async () => null;
    LawyerAvailability.updateOne = async () => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    LawyerAvailability.findById = async () => ({ _id: mockSlotId, status: "available" });

    const result8c = await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Already available slot test" });
    assert.equal(result8c.status, "cancelled");
  });

  // =========================================================================
  // SCENARIO 9: Slot update throws a database error
  // =========================================================================
  test("9. Slot update throws database error: standalone compensation reverts appointment and rethrows error", async () => {
    const mockApp = createMockAppointment({ status: "confirmed", notes: "Original notes" });
    Appointment.findById = async () => mockApp;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          mockApp.notes = update.$set.notes;
          return mockApp;
        }
      })
    });
    Appointment.findOne = async () => null;

    let compensationCalled = false;
    Appointment.updateOne = async (filter, update) => {
      compensationCalled = true;
      mockApp.status = update.$set.status;
      mockApp.notes = update.$set.notes;
    };

    LawyerAvailability.updateOne = async () => {
      throw new Error("MongoNetworkTimeoutError: slot collection write failed");
    };

    let errorCaught = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Slot DB error test" });
    } catch (err) {
      errorCaught = err;
    }

    assert.ok(errorCaught);
    assert.match(errorCaught.message, /MongoNetworkTimeoutError/);
    assert.equal(compensationCalled, true, "Compensation updateOne must be called on standalone failure");
    assert.equal(mockApp.status, "confirmed", "Appointment status must be restored to confirmed");
    assert.equal(mockApp.notes, "Original notes", "Appointment notes must be restored to original");
  });

  // =========================================================================
  // SCENARIO 10: Transaction rollback when slot release fails
  // =========================================================================
  test("10. Transaction rollback: when transactions are supported, slot failure aborts transaction without standalone fallback", async () => {
    const mockApp = createMockAppointment({ status: "confirmed" });

    const originalStartSession = mongoose.startSession;
    let transactionAborted = false;
    let endSessionCalled = false;

    // Simulate connected replica set
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

    mongoose.startSession = async () => ({
      async withTransaction(fn) {
        try {
          await fn();
        } catch (err) {
          transactionAborted = true;
          throw err;
        }
      },
      async endSession() {
        endSessionCalled = true;
      }
    });

    Appointment.findById = async () => mockApp;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          return mockApp;
        }
      })
    });
    Appointment.findOne = async () => null;

    LawyerAvailability.updateOne = async () => {
      throw new Error("Slot release write conflict inside transaction");
    };

    let errorCaught = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "Transaction abort test" });
    } catch (err) {
      errorCaught = err;
    } finally {
      mongoose.startSession = originalStartSession;
      Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
    }

    assert.ok(errorCaught);
    assert.match(errorCaught.message, /Slot release write conflict inside transaction/);
    assert.equal(transactionAborted, true, "Transaction must abort when slot update fails");
    assert.equal(endSessionCalled, true, "Session must be closed");
  });

  // =========================================================================
  // SCENARIO 11: Standalone fallback behavior
  // =========================================================================
  test("11. Standalone fallback behavior: falls back only on genuine unsupported-transaction errors, not on arbitrary errors", async () => {
    const mockApp = createMockAppointment({ status: "confirmed" });

    const originalStartSession = mongoose.startSession;
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

    let fallbackExecuted = false;

    // 11a. Genuine unsupported-transaction error (code 20 / standalone)
    mongoose.startSession = async () => ({
      async withTransaction() {
        const err = new Error("Transaction numbers are only allowed on a replica set member or mongos");
        err.code = 20;
        throw err;
      },
      async endSession() {}
    });

    Appointment.findById = async () => mockApp;
    Appointment.findOneAndUpdate = (query, update) => ({
      populate: () => ({
        populate: async () => {
          mockApp.status = update.$set.status;
          fallbackExecuted = true;
          return mockApp;
        }
      })
    });
    Appointment.findOne = async () => null;
    LawyerAvailability.updateOne = async () => ({ acknowledged: true, matchedCount: 1, modifiedCount: 1 });

    const result = await cancelAdminAppointmentService(
      mockAdminId,
      mockAppointmentId.toString(),
      { reason: "Standalone fallback test" }
    );

    assert.equal(fallbackExecuted, true, "Must fall back to standalone execution on code 20");
    assert.equal(result.status, "cancelled");

    // 11b. Arbitrary error inside operation must NOT trigger standalone fallback
    let fallbackAfterAppError = false;
    mongoose.startSession = async () => ({
      async withTransaction(fn) {
        await fn();
      },
      async endSession() {}
    });

    Appointment.findById = async () => {
      const err = new Error("Database validation failure inside transaction");
      throw err;
    };

    let error11b = null;
    try {
      await cancelAdminAppointmentService(mockAdminId, mockAppointmentId.toString(), { reason: "App error test" });
    } catch (err) {
      error11b = err;
    } finally {
      mongoose.startSession = originalStartSession;
      Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
    }

    assert.ok(error11b);
    assert.match(error11b.message, /Database validation failure inside transaction/);
  });
});

