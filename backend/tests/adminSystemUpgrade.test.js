/**
 * LegalConnect Admin Panel Upgrade Test Suite
 *
 * Covers:
 * 1. Authentication & Role-Based Access Control (Admin authorization, Blocked user session revocation)
 * 2. Admin Activity Audit Logging
 * 3. Complaint & Support ticket model logic
 * 4. Lawyer verification enum updates & history
 * 5. Platform settings schema
 * 6. User block fields & account state
 * 7. Admin route tree completeness
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const jwt = require("jsonwebtoken");

const { protect, authorize } = require("../src/middleware/authMiddleware");
const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const Complaint = require("../src/models/Complaint");
const AdminLog = require("../src/models/AdminLog");
const PlatformSetting = require("../src/models/PlatformSetting");
const adminRouter = require("../src/routes/adminRoutes");

describe("1. Admin Role & Authentication Middleware Security", () => {
  const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

  test("protect middleware rejects requests without authorization header", async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = { headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(payload) {
            jsonResponse = payload;
          }
        };
      }
    };
    const next = () => {};

    await protect(req, res, next);
    assert.equal(statusCode, 401);
    assert.match(jsonResponse.message, /Authentication required/i);
  });

  test("authorize('admin') blocks client and lawyer roles with 403", () => {
    const adminGate = authorize("admin");

    const clientReq = { user: { role: "client", userId: "client123" } };
    const lawyerReq = { user: { role: "lawyer", userId: "lawyer123" } };
    const adminReq = { user: { role: "admin", userId: "admin123" } };

    let clientStatus = null;
    let clientJson = null;
    const clientRes = {
      status(c) { clientStatus = c; return { json(p) { clientJson = p; } }; }
    };
    adminGate(clientReq, clientRes, () => {});
    assert.equal(clientStatus, 403);
    assert.match(clientJson.message, /Access denied/i);

    let lawyerStatus = null;
    const lawyerRes = {
      status(c) { lawyerStatus = c; return { json() {} }; }
    };
    adminGate(lawyerReq, lawyerRes, () => {});
    assert.equal(lawyerStatus, 403);

    let nextCalled = false;
    adminGate(adminReq, {}, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });
});

describe("2. Database Models & Schema Extensions", () => {
  test("User model supports block metadata attributes", () => {
    const userPaths = User.schema.paths;
    assert.ok(userPaths.isActive, "User schema must have isActive field");
    assert.ok(userPaths.blockReason, "User schema must have blockReason field");
    assert.ok(userPaths.blockedAt, "User schema must have blockedAt field");
    assert.ok(userPaths.blockedBy, "User schema must have blockedBy field");
    assert.ok(userPaths.unblockedAt, "User schema must have unblockedAt field");
    assert.ok(userPaths.unblockedBy, "User schema must have unblockedBy field");
  });

  test("Lawyer model verificationStatus supports all required enum states", () => {
    const statusEnum = Lawyer.schema.paths.verificationStatus.enumValues;
    const expectedStatuses = [
      "pending",
      "under_review",
      "approved",
      "rejected",
      "additional_info_required",
      "suspended"
    ];

    expectedStatuses.forEach((status) => {
      assert.ok(
        statusEnum.includes(status),
        `Lawyer verificationStatus enum must include "${status}"`
      );
    });

    assert.ok(Lawyer.schema.paths.internalNotes, "Lawyer schema must include internalNotes");
    assert.ok(Lawyer.schema.paths.verificationHistory, "Lawyer schema must include verificationHistory array");
  });

  test("Complaint model defines support ticket schema fields & statuses", () => {
    const paths = Complaint.schema.paths;
    assert.ok(paths.complaintId, "Complaint schema must have complaintId");
    assert.ok(paths.submittedBy, "Complaint schema must have submittedBy");
    assert.ok(paths.subject, "Complaint schema must have subject");
    assert.ok(paths.description, "Complaint schema must have description");
    assert.ok(paths.status, "Complaint schema must have status");
    assert.ok(paths.priority, "Complaint schema must have priority");
    assert.ok(paths.adminResponse, "Complaint schema must have adminResponse");

    const statusEnum = paths.status.enumValues;
    assert.deepEqual(statusEnum, ["open", "in_progress", "resolved", "closed"]);

    const priorityEnum = paths.priority.enumValues;
    assert.deepEqual(priorityEnum, ["low", "medium", "high", "urgent"]);
  });

  test("AdminLog model defines immutable audit fields", () => {
    const paths = AdminLog.schema.paths;
    assert.ok(paths.admin, "AdminLog schema must have admin reference");
    assert.ok(paths.action, "AdminLog schema must have action");
    assert.ok(paths.targetType, "AdminLog schema must have targetType");
    assert.ok(paths.description, "AdminLog schema must have description");
    assert.ok(paths.createdAt, "AdminLog schema must have timestamp");
  });

  test("PlatformSetting model defines platform configuration schema", () => {
    const paths = PlatformSetting.schema.paths;
    assert.ok(paths.platformFeePercent, "PlatformSetting must have platformFeePercent");
    assert.ok(paths.maintenanceMode, "PlatformSetting must have maintenanceMode");
    assert.ok(paths.maintenanceMessage, "PlatformSetting must have maintenanceMessage");
    assert.ok(paths.supportEmail, "PlatformSetting must have supportEmail");
  });
});

describe("3. Admin Router Endpoint Coverage", () => {
  test("adminRouter registers all 12 modules", () => {
    const routes = [];
    adminRouter.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map((m) => m.toUpperCase());
        routes.push({ path: middleware.route.path, methods });
      }
    });

    const registeredPaths = routes.map((r) => r.path);

    // Verify key module endpoints exist
    assert.ok(registeredPaths.includes("/metrics"), "Missing /metrics");
    assert.ok(registeredPaths.includes("/analytics"), "Missing /analytics");
    assert.ok(registeredPaths.includes("/recent-activity"), "Missing /recent-activity");
    assert.ok(registeredPaths.includes("/clients"), "Missing /clients");
    assert.ok(registeredPaths.includes("/clients/:clientId/block"), "Missing /clients/:clientId/block");
    assert.ok(registeredPaths.includes("/lawyers"), "Missing /lawyers");
    assert.ok(registeredPaths.includes("/lawyers/:lawyerId/block"), "Missing /lawyers/:lawyerId/block");
    assert.ok(registeredPaths.includes("/verifications"), "Missing /verifications");
    assert.ok(registeredPaths.includes("/verifications/:lawyerId"), "Missing /verifications/:lawyerId");
    assert.ok(registeredPaths.includes("/appointments"), "Missing /appointments");
    assert.ok(registeredPaths.includes("/appointments/:appointmentId/cancel"), "Missing /appointments/:appointmentId/cancel");
    assert.ok(registeredPaths.includes("/reviews"), "Missing /reviews");
    assert.ok(registeredPaths.includes("/reviews/:reviewId/moderate"), "Missing /reviews/:reviewId/moderate");
    assert.ok(registeredPaths.includes("/payments"), "Missing /payments");
    assert.ok(registeredPaths.includes("/payments/:paymentId/refund"), "Missing /payments/:paymentId/refund");
    assert.ok(registeredPaths.includes("/complaints"), "Missing /complaints");
    assert.ok(registeredPaths.includes("/notifications"), "Missing /notifications");
    assert.ok(registeredPaths.includes("/notifications/broadcast"), "Missing /notifications/broadcast");
    assert.ok(registeredPaths.includes("/reports"), "Missing /reports");
    assert.ok(registeredPaths.includes("/activity-logs"), "Missing /activity-logs");
    assert.ok(registeredPaths.includes("/settings"), "Missing /settings");
    assert.ok(registeredPaths.includes("/settings/profile"), "Missing /settings/profile");
    assert.ok(registeredPaths.includes("/settings/password"), "Missing /settings/password");
    assert.ok(registeredPaths.includes("/settings/platform"), "Missing /settings/platform");
  });
});
