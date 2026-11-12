import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Booking Success Page Navigation & Client Dashboard Verification", () => {
  const bookAppointmentPath = path.join(__dirname, "../src/pages/BookAppointment.jsx");
  const dashboardPath = path.join(__dirname, "../src/pages/Dashboard.jsx");
  const appPath = path.join(__dirname, "../src/App.jsx");

  const bookAppointmentCode = fs.readFileSync(bookAppointmentPath, "utf8");
  const dashboardCode = fs.readFileSync(dashboardPath, "utf8");
  const appCode = fs.readFileSync(appPath, "utf8");

  describe("1. Booking Request Submitted Success Page Structure", () => {
    it("preserves the Booking Request Submitted success screen and all details", () => {
      assert.ok(
        bookAppointmentCode.includes("Booking Request Submitted"),
        "Must display 'Booking Request Submitted' badge"
      );
      assert.ok(
        bookAppointmentCode.includes("Your consultation request has been submitted successfully"),
        "Must display submission confirmation heading"
      );
      assert.ok(
        bookAppointmentCode.includes("Appointment Reference ID"),
        "Must display Appointment Reference ID label"
      );
      assert.ok(
        bookAppointmentCode.includes("Advocate Name"),
        "Must display Advocate Name field"
      );
      assert.ok(
        bookAppointmentCode.includes("Consultation Type"),
        "Must display Consultation Type field"
      );
      assert.ok(
        bookAppointmentCode.includes("Consultation Fee"),
        "Must display Consultation Fee field"
      );
      assert.ok(
        bookAppointmentCode.includes("Appointment Status"),
        "Must display Appointment Status field"
      );
      assert.ok(
        bookAppointmentCode.includes("Pending Advocate Confirmation"),
        "Must display Pending Advocate Confirmation status"
      );
      assert.ok(
        bookAppointmentCode.includes("Scheduled Consultation Time:"),
        "Must display Scheduled Consultation Time"
      );
    });

    it("View My Appointments button navigates directly to Client Portal Dashboard (/dashboard)", () => {
      // Find the success action buttons block
      const actionsStart = bookAppointmentCode.indexOf("Action Buttons: Back to Home & View My Appointments");
      assert.ok(actionsStart !== -1, "Action buttons section must exist");
      const actionsEnd = bookAppointmentCode.indexOf("</div>\n            </div>\n          </div>", actionsStart);
      const actionsSnippet = bookAppointmentCode.slice(actionsStart, actionsEnd !== -1 ? actionsEnd : actionsStart + 600);

      // Verify button label
      assert.ok(
        actionsSnippet.includes("View My Appointments"),
        "Must contain 'View My Appointments' button text"
      );

      // Verify that it navigates to /dashboard
      assert.ok(
        actionsSnippet.includes('navigate("/dashboard")'),
        "Clicking 'View My Appointments' must navigate directly to /dashboard"
      );

      // Verify it does NOT navigate to old pages or alternate routes
      assert.ok(
        !actionsSnippet.includes('navigate("/my-appointments")'),
        "Must NOT navigate to old /my-appointments page"
      );
      assert.ok(
        !actionsSnippet.includes('navigate("/client/lawyers")'),
        "Must NOT navigate to /client/lawyers"
      );
      assert.ok(
        !actionsSnippet.includes('navigate("/client/profile")'),
        "Must NOT navigate to /client/profile"
      );
    });

    it("Back to Home button continues navigating to '/'", () => {
      const actionsStart = bookAppointmentCode.indexOf("Action Buttons: Back to Home & View My Appointments");
      const actionsSnippet = bookAppointmentCode.slice(actionsStart, actionsStart + 1500);

      assert.ok(
        actionsSnippet.includes("Back to Home"),
        "Must contain 'Back to Home' button"
      );
      assert.ok(
        actionsSnippet.includes('navigate("/")'),
        "'Back to Home' must navigate to '/'"
      );
    });
  });

  describe("2. Client Portal Dashboard Route & Data Reflection", () => {
    it("Route /dashboard renders the main Client Portal Dashboard", () => {
      assert.ok(
        appCode.includes('path="/dashboard" element={<Dashboard />}'),
        "/dashboard route must map to Dashboard component"
      );
      assert.ok(
        appCode.includes('path="/client/dashboard" element={<Navigate to="/dashboard" replace />}'),
        "/client/dashboard must alias to /dashboard"
      );
    });

    it("Dashboard defaults to 'dashboard' tab overview and fetches fresh records on open", () => {
      // Default tab
      assert.ok(
        dashboardCode.includes('setActiveTab("dashboard")'),
        "Dashboard must default activeTab to 'dashboard' when no tabParam is present"
      );

      // Data fetching lifecycle
      assert.ok(
        dashboardCode.includes("loadDashboardData();"),
        "Dashboard must invoke loadDashboardData on component mount"
      );
      assert.ok(
        dashboardCode.includes("getCurrentUser()"),
        "loadDashboardData must fetch fresh user profile data from API"
      );
      assert.ok(
        dashboardCode.includes("getMyAppointments()"),
        "loadDashboardData must fetch fresh appointment records from API"
      );
    });

    it("Dashboard computes Total, Completed, Pending, and Cancelled stats accurately", () => {
      // Pending filter
      assert.ok(
        dashboardCode.includes('appointments.filter((a) => a.status === "pending")'),
        "Pending appointments must filter by status === 'pending'"
      );

      // Completed filter
      assert.ok(
        dashboardCode.includes('appointments.filter((a) => a.status === "completed")'),
        "Completed appointments must filter strictly by status === 'completed'"
      );

      // Cancelled filter
      assert.ok(
        dashboardCode.includes('a.status === "cancelled" || a.status === "rejected"'),
        "Cancelled appointments must filter by status === 'cancelled' or 'rejected'"
      );

      // Total Bookings stats card
      assert.ok(
        dashboardCode.includes("Total Bookings"),
        "Must display Total Bookings stat card"
      );
      assert.ok(
        dashboardCode.includes("{appointments.length}"),
        "Total Bookings must reflect total appointments length"
      );
    });

    it("Dashboard renders Client Overview, Upcoming Appointment, and Recent History", () => {
      // Client Overview
      assert.ok(
        dashboardCode.includes("Registered Client"),
        "Client Overview must display 'Registered Client' label"
      );
      assert.ok(
        dashboardCode.includes("clientEmail"),
        "Client Overview must display client email"
      );
      assert.ok(
        dashboardCode.includes("clientPhone"),
        "Client Overview must display client phone"
      );
      assert.ok(
        dashboardCode.includes("clientLocation"),
        "Client Overview must display client location"
      );

      // Upcoming Appointment
      assert.ok(
        dashboardCode.includes("Upcoming Appointment"),
        "Must display Upcoming Appointment section"
      );

      // Recent History
      assert.ok(
        dashboardCode.includes("Recent Consultation History"),
        "Must display Recent Consultation History section"
      );
    });
  });
});
