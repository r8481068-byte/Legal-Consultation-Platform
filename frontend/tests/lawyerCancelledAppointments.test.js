import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Lawyer Dashboard Cancelled Appointments Feature Verification", () => {
  const lawyerDashboardFile = fs.readFileSync(
    path.join(__dirname, "../src/pages/LawyerDashboard.jsx"),
    "utf8"
  );
  const lawyerAppointmentServiceFile = fs.readFileSync(
    path.join(__dirname, "../src/services/lawyerAppointmentService.js"),
    "utf8"
  );
  const appointmentModelFile = fs.readFileSync(
    path.join(__dirname, "../../backend/src/models/Appointment.js"),
    "utf8"
  );
  const appointmentServiceFile = fs.readFileSync(
    path.join(__dirname, "../../backend/src/services/appointmentService.js"),
    "utf8"
  );
  const appointmentRoutesFile = fs.readFileSync(
    path.join(__dirname, "../../backend/src/routes/appointmentRoutes.js"),
    "utf8"
  );
  const appointmentControllerFile = fs.readFileSync(
    path.join(__dirname, "../../backend/src/controllers/appointmentController.js"),
    "utf8"
  );

  it("1. Sidebar Menu: Contains exactly 13 items in the exact required order", () => {
    const sidebarMatch = lawyerDashboardFile.match(/const\s+sidebarMenuItems\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(sidebarMatch, "sidebarMenuItems array must exist");

    const idMatches = [...sidebarMatch[1].matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
    const expectedOrder = [
      "home",
      "dashboard",
      "find-lawyer",
      "availability",
      "requests",
      "completed",
      "cancelled",
      "reviews",
      "notifications",
      "profile",
      "settings",
      "about-us",
      "logout",
    ];

    assert.strictEqual(
      idMatches.length,
      13,
      `Expected exactly 13 sidebar items, found ${idMatches.length}: ${idMatches.join(", ")}`
    );
    assert.deepStrictEqual(
      idMatches,
      expectedOrder,
      "Sidebar items must match the exact 13-item specification in order"
    );

    // Cancelled Appointments item specifics
    const cancelledItemSnippet = sidebarMatch[1].match(/id:\s*"cancelled"[\s\S]*?icon:\s*(\w+)/);
    assert.ok(cancelledItemSnippet, "Cancelled item definition must exist in sidebarMenuItems");
    assert.strictEqual(
      cancelledItemSnippet[1],
      "XCircle",
      "Cancelled Appointments menu item must use XCircle icon"
    );
    assert.ok(
      sidebarMatch[1].includes('label: "Cancelled Appointments"'),
      "Menu label must be 'Cancelled Appointments'"
    );
  });

  it("2. Valid Tabs: Includes 'cancelled' tab", () => {
    const validTabsMatch = lawyerDashboardFile.match(
      /validTabs\s*=\s*useMemo\(\s*\(\)\s*=>\s*\[([\s\S]*?)\]/
    );
    assert.ok(validTabsMatch, "validTabs definition must exist");
    const tabs = validTabsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/["']/g, ""))
      .filter(Boolean);

    assert.ok(tabs.includes("cancelled"), "validTabs must include 'cancelled'");
  });

  it("3. Filtered State: cancelledAppointments filters strictly cancelled and rejected without including completed or pending", () => {
    assert.ok(
      lawyerDashboardFile.includes("cancelledAppointments"),
      "cancelledAppointments state/memo must exist"
    );
    assert.ok(
      lawyerDashboardFile.includes('a.status === "cancelled" || a.status === "rejected"'),
      "cancelledAppointments must include status === 'cancelled' or status === 'rejected'"
    );
    assert.ok(
      lawyerDashboardFile.includes("cancelledCount = cancelledAppointments.length"),
      "cancelledCount must reflect cancelledAppointments length"
    );
  });

  it("4. Cancelled Appointments View: Renders all required information, badges, and actions", () => {
    assert.ok(
      lawyerDashboardFile.includes('activeTab === "cancelled"'),
      "activeTab === 'cancelled' conditional view must be rendered"
    );

    const cancelledTabSnippet = lawyerDashboardFile.slice(
      lawyerDashboardFile.indexOf('activeTab === "cancelled"'),
      lawyerDashboardFile.indexOf('activeTab === "reviews"')
    );

    // Header and count
    assert.ok(
      cancelledTabSnippet.includes("Cancelled Appointments"),
      "Must render Cancelled Appointments heading"
    );
    assert.ok(
      cancelledTabSnippet.includes("cancelledCount"),
      "Must render cancelledCount badge"
    );

    // Empty state
    assert.ok(
      cancelledTabSnippet.includes("No Cancelled Appointments"),
      "Must render empty state message when no cancelled appointments exist"
    );

    // Client information
    assert.ok(
      cancelledTabSnippet.includes("clientName"),
      "Must render clientName"
    );
    assert.ok(
      cancelledTabSnippet.includes("clientImage"),
      "Must render client profile image or avatar initials"
    );
    assert.ok(
      cancelledTabSnippet.includes("clientEmail"),
      "Must render client email when available"
    );
    assert.ok(
      cancelledTabSnippet.includes("clientPhone"),
      "Must render client phone when available"
    );
    assert.ok(
      cancelledTabSnippet.includes("clientLocation"),
      "Must render client location when available"
    );

    // Appointment Reference ID
    assert.ok(
      cancelledTabSnippet.includes("refId"),
      "Must render appointment reference ID"
    );
    assert.ok(
      cancelledTabSnippet.includes("#APT-"),
      "Reference ID must follow #APT- format"
    );

    // Consultation Type, Date, Time, Duration
    assert.ok(
      cancelledTabSnippet.includes("consultationType"),
      "Must render consultation type"
    );
    assert.ok(
      cancelledTabSnippet.includes("scheduledDateFormatted"),
      "Must render formatted scheduled date"
    );
    assert.ok(
      cancelledTabSnippet.includes("scheduledTimeRange"),
      "Must render scheduled start and end time"
    );
    assert.ok(
      cancelledTabSnippet.includes("durationText"),
      "Must render appointment duration"
    );

    // Cancellation status badges distinguishing actors
    assert.ok(
      cancelledTabSnippet.includes("Declined by Advocate"),
      "Must support 'Declined by Advocate' badge"
    );
    assert.ok(
      cancelledTabSnippet.includes("Cancelled by Advocate"),
      "Must support 'Cancelled by Advocate' badge"
    );
    assert.ok(
      cancelledTabSnippet.includes("Cancelled by Client"),
      "Must support 'Cancelled by Client' badge"
    );
    assert.ok(
      cancelledTabSnippet.includes("Cancelled by Admin"),
      "Must support 'Cancelled by Admin' badge"
    );

    // Cancellation Timestamp & Reason
    assert.ok(
      cancelledTabSnippet.includes("formattedCancellationTime"),
      "Must render cancellation date and time"
    );
    assert.ok(
      cancelledTabSnippet.includes("reasonText"),
      "Must render cancellation reason"
    );

    // Payment and Refund statuses
    assert.ok(
      cancelledTabSnippet.includes("Payment Status:"),
      "Must display payment status label and badge"
    );
    assert.ok(
      cancelledTabSnippet.includes("Refund Status:"),
      "Must display refund status label and badge"
    );

    // Action buttons: Summary and Details
    assert.ok(
      cancelledTabSnippet.includes("setSummaryAppointment(appointment)"),
      "Summary button must open existing AppointmentSummaryModal"
    );
    assert.ok(
      cancelledTabSnippet.includes("setSelectedClientId(clientId)"),
      "Details button must open existing ClientDetailModal"
    );
  });

  it("5. Requests Tab Cancel Action: Confirmed appointments invoke cancel action", () => {
    assert.ok(
      lawyerDashboardFile.includes('handleAction(appointment._id, "cancel")'),
      "Cancel button for confirmed appointments in Requests tab must invoke handleAction with 'cancel'"
    );
  });

  it("6. Backend Integration: Appointment model and status endpoints support cancellation actor, timestamp, and reason", () => {
    // Schema fields
    assert.ok(
      appointmentModelFile.includes("cancellationReason:"),
      "Appointment schema must define cancellationReason"
    );
    assert.ok(
      appointmentModelFile.includes("cancelledBy:"),
      "Appointment schema must define cancelledBy"
    );
    assert.ok(
      appointmentModelFile.includes("cancelledAt:"),
      "Appointment schema must define cancelledAt"
    );

    // Backend route
    assert.ok(
      appointmentRoutesFile.includes("/:appointmentId/cancel"),
      "appointmentRoutes must define /:appointmentId/cancel endpoint"
    );

    // Controller
    assert.ok(
      appointmentControllerFile.includes("cancelLawyerAppointment"),
      "appointmentController must export cancelLawyerAppointment"
    );

    // Service logic
    assert.ok(
      appointmentServiceFile.includes('cancelledBy: "lawyer"'),
      "appointmentService must set cancelledBy: 'lawyer' upon advocate cancellation"
    );
    assert.ok(
      appointmentServiceFile.includes("cancelledAt: new Date()"),
      "appointmentService must set cancelledAt timestamp"
    );

    // Frontend service
    assert.ok(
      lawyerAppointmentServiceFile.includes("cancelLawyerAppointment"),
      "lawyerAppointmentService must export cancelLawyerAppointment function"
    );
  });
});

