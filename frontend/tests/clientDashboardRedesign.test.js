import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Client Dashboard UI Redesign & Navigation Verification", () => {
  const clientDashboardPath = path.join(__dirname, "../src/pages/Dashboard.jsx");
  const clientProfileModalsPath = path.join(
    __dirname,
    "../src/components/ClientProfileModals.jsx"
  );
  const findLawyerPath = path.join(
    __dirname,
    "../src/components/ClientLawyerDirectory.jsx"
  );

  const clientDashboardCode = fs.readFileSync(clientDashboardPath, "utf8");
  const clientProfileModalsCode = fs.readFileSync(
    clientProfileModalsPath,
    "utf8"
  );
  const findLawyerCode = fs.readFileSync(findLawyerPath, "utf8");

  it("1. Sidebar structure: exactly 9 items in exact order", () => {
    // 1. Home
    // 2. Dashboard
    // 3. Find Lawyer
    // 4. Completed Appointments
    // 5. Pending Requests
    // 6. Cancelled Appointments
    // 7. Notifications
    // 8. My Profile
    // 9. Logout

    const expectedOrder = [
      'id: "home"',
      'id: "dashboard"',
      'id: "find-lawyer"',
      'id: "completed"',
      'id: "pending"',
      'id: "cancelled"',
      'id: "notifications"',
      'id: "profile"',
      'id: "logout"',
    ];

    let lastIndex = -1;
    for (const item of expectedOrder) {
      const idx = clientDashboardCode.indexOf(item);
      assert.ok(
        idx !== -1,
        `Sidebar item ${item} should exist in sidebarMenuItems`
      );
      assert.ok(
        idx > lastIndex,
        `Sidebar item ${item} must appear in exact order after previous item`
      );
      lastIndex = idx;
    }

    // Verify validTabs includes all 7 main tabs
    const validTabsMatch = clientDashboardCode.match(
      /validTabs\s*=\s*useMemo\(\s*\(\)\s*=>\s*\[([^\]]+)\]/s
    );
    assert.ok(validTabsMatch, "validTabs definition should exist in Dashboard.jsx");
    const tabsList = validTabsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/["']/g, ""))
      .filter(Boolean);

    assert.deepStrictEqual(tabsList, [
      "dashboard",
      "find-lawyer",
      "completed",
      "pending",
      "cancelled",
      "notifications",
      "profile",
    ]);
  });

  it("2. Header updates: notification bell icon removed from top header", () => {
    // Header should have user profile dropdown but NO standalone notification bell icon
    const headerStart = clientDashboardCode.indexOf("<header");
    const headerEnd = clientDashboardCode.indexOf("</header>", headerStart);
    assert.ok(headerStart !== -1 && headerEnd !== -1, "header should exist");

    const headerContent = clientDashboardCode.slice(headerStart, headerEnd);
    assert.ok(
      !headerContent.includes("<Bell"),
      "Bell notification icon should NOT be present in top header bar"
    );
    assert.ok(
      headerContent.includes("profileDropdownOpen"),
      "User profile dropdown must exist in top header"
    );
  });

  it("3. Tab 1 Dashboard: clean client overview (no buttons), 4 stats cards, upcoming spotlight, removed quick actions & security banner", () => {
    // Check conditional tab rendering
    assert.ok(
      clientDashboardCode.includes('activeTab === "dashboard"'),
      "Should have conditional rendering for dashboard tab"
    );

    // 1. Old welcome banner must be REMOVED
    assert.ok(
      !clientDashboardCode.includes("Welcome to Your Legal Consultation Portal"),
      "Old welcome banner heading must be removed from Dashboard"
    );

    // 2. Quick actions section & security banner must be REMOVED
    assert.ok(
      !clientDashboardCode.includes("Quick Actions"),
      "Quick Actions section must be completely removed from Dashboard"
    );
    assert.ok(
      !clientDashboardCode.includes("100% Confidential & Secure Legal Consultations"),
      "Security banner must be removed from Dashboard"
    );
    assert.ok(
      !clientDashboardCode.includes("View Privacy Settings"),
      "View Privacy Settings button must be removed from Dashboard"
    );

    // 3. New Client Overview Section must be PRESENT
    assert.ok(
      clientDashboardCode.includes("Registered Client"),
      "Registered Client label must exist in Client Overview"
    );
    assert.ok(
      clientDashboardCode.includes("clientEmail"),
      "clientEmail must be rendered in Client Overview"
    );
    assert.ok(
      clientDashboardCode.includes("clientPhone"),
      "clientPhone must be rendered in Client Overview"
    );
    assert.ok(
      clientDashboardCode.includes("clientLocation"),
      "clientLocation must be rendered in Client Overview"
    );
    assert.ok(
      clientDashboardCode.includes("completenessPercentage"),
      "Profile completion percentage must be rendered in Client Overview"
    );

    // 4. Verify ZERO buttons or action links exist in the new Client Overview section
    const overviewStart = clientDashboardCode.indexOf("Client Overview Card");
    assert.ok(overviewStart !== -1, "Client Overview Card section must exist");
    const overviewEnd = clientDashboardCode.indexOf("</section>", overviewStart);
    assert.ok(overviewEnd !== -1, "Client Overview Card section closing tag must exist");
    const overviewSnippet = clientDashboardCode.slice(overviewStart, overviewEnd);

    assert.ok(
      !overviewSnippet.includes("<button"),
      "Client Overview section must contain ZERO <button> elements"
    );
    assert.ok(
      !overviewSnippet.includes("<Link"),
      "Client Overview section must contain ZERO <Link> elements"
    );
    assert.ok(
      !overviewSnippet.includes("onClick"),
      "Client Overview section must contain ZERO onClick handlers"
    );

    // 5. 4 stats cards retained
    assert.ok(
      clientDashboardCode.includes("Total Bookings"),
      "Total Bookings stats card must exist"
    );
    assert.ok(
      clientDashboardCode.includes("Concluded sessions"),
      "Completed stats card must exist"
    );
    assert.ok(
      clientDashboardCode.includes("Awaiting confirmation"),
      "Pending stats card must exist"
    );
    assert.ok(
      clientDashboardCode.includes("Cancelled / declined"),
      "Cancelled stats card must exist"
    );

    // 6. Upcoming appointment spotlight retained
    assert.ok(
      clientDashboardCode.includes("Upcoming Appointment"),
      "Upcoming Appointment card spotlight must exist"
    );
    assert.ok(
      clientDashboardCode.includes("Join Video Consultation"),
      "Video consultation action must exist for upcoming appointments"
    );

    // 7. Recent activity / consultation history retained
    assert.ok(
      clientDashboardCode.includes("Recent Consultation History"),
      "Recent Consultation History section must exist"
    );
  });

  it("4. Tab 2 Find Lawyer: client-facing directory with profile view and consultation booking", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "find-lawyer"'),
      "Should have conditional rendering for find-lawyer tab"
    );
    assert.ok(
      clientDashboardCode.includes("<ClientLawyerDirectory />"),
      "ClientLawyerDirectory must be instantiated"
    );

    // ClientLawyerDirectory should provide Book Consultation for client mode
    assert.ok(
      findLawyerCode.includes("Book Consultation"),
      "ClientLawyerDirectory must support Book Consultation for client mode"
    );
  });

  it("5. Tab 3 Completed Appointments: summary, documents, chat, receipt, and review actions", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "completed"'),
      "Should have conditional rendering for completed tab"
    );
    assert.ok(
      clientDashboardCode.includes("setSummaryAppointment"),
      "Summary action must be bound"
    );
    assert.ok(
      clientDashboardCode.includes("setDocumentAppointment"),
      "Documents action must be bound"
    );
    assert.ok(
      clientDashboardCode.includes("setChatAppointment"),
      "Chat action must be bound"
    );
    assert.ok(
      clientDashboardCode.includes("setReceiptAppointment"),
      "Receipt action must be bound"
    );
    assert.ok(
      clientDashboardCode.includes("setReviewAppointment"),
      "Review / Feedback action must be bound"
    );
  });

  it("6. Tab 4 Pending Requests: cancel request, view details, chat, and fee payment", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "pending"'),
      "Should have conditional rendering for pending tab"
    );
    assert.ok(
      clientDashboardCode.includes("setCancelModalAppointment"),
      "Cancel request action must open cancel confirmation modal"
    );
    assert.ok(
      clientDashboardCode.includes("handlePay"),
      "handlePay action must exist for pending unpaid consultations"
    );
  });

  it("7. Tab 5 Cancelled Appointments: history, reason, and book another advocate", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "cancelled"'),
      "Should have conditional rendering for cancelled tab"
    );
    assert.ok(
      clientDashboardCode.includes("Declined by Advocate"),
      "Should indicate declined vs cancelled status"
    );
    assert.ok(
      clientDashboardCode.includes("Book Another Advocate"),
      "Should allow booking another advocate from cancelled appointments"
    );
  });

  it("8. Tab 6 Notifications: full-screen list with filter and mark all read", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "notifications"'),
      "Should have conditional rendering for notifications tab"
    );
    assert.ok(
      clientDashboardCode.includes("handleMarkAllNotifsRead"),
      "Mark all read handler must exist"
    );
    assert.ok(
      clientDashboardCode.includes("handleNotificationClick"),
      "Mark individual notification read handler must exist"
    );
  });

  it("9. Tab 7 My Profile: full-screen dedicated page with 4 distinct sections and privacy masking", () => {
    assert.ok(
      clientDashboardCode.includes('activeTab === "profile"'),
      "Should have conditional rendering for profile tab"
    );

    // Welcome banner must NOT be in profile tab
    const profileSectionStart = clientDashboardCode.indexOf('activeTab === "profile"');
    const profileSectionEnd = clientDashboardCode.indexOf("</main>", profileSectionStart);
    const profileSectionContent = clientDashboardCode.slice(
      profileSectionStart,
      profileSectionEnd
    );

    assert.ok(
      !profileSectionContent.includes("Welcome to Your Legal Consultation Portal"),
      "Welcome hero banner must NOT be displayed on My Profile tab"
    );

    // Section 1: Personal Information
    assert.ok(
      profileSectionContent.includes("Personal Information"),
      "Section 1: Personal Information must exist"
    );
    assert.ok(
      clientDashboardCode.includes("setEditPersonalModalOpen"),
      "Edit Personal Details modal trigger must exist"
    );

    // Section 2: Identity Documents & Verification (Masked + Secure Update)
    assert.ok(
      profileSectionContent.includes("Identity Documents & Verification") ||
      profileSectionContent.includes("Identity Information & Verification"),
      "Section 2: Identity Documents & Verification must exist"
    );
    assert.ok(
      clientDashboardCode.includes("Update Identity Details"),
      "Update Identity Details action must exist"
    );
    assert.ok(
      clientDashboardCode.includes("maskedAadhaar"),
      "Masked Aadhaar must be used"
    );
    assert.ok(
      clientDashboardCode.includes("maskedPan"),
      "Masked PAN must be used"
    );
    assert.ok(
      profileSectionContent.includes("AES-256-GCM Encrypted"),
      "AES-256 encryption badge must exist"
    );

    // Section 3: About Me
    assert.ok(
      profileSectionContent.includes("About Me & Legal Interests"),
      "Section 3: About Me must exist"
    );
    assert.ok(
      clientDashboardCode.includes("setEditAboutModalOpen"),
      "Edit About modal trigger must exist"
    );

    // Section 4: Account Security & Password
    assert.ok(
      profileSectionContent.includes("Account Security & Password"),
      "Section 4: Account Security must exist"
    );
    assert.ok(
      clientDashboardCode.includes("setChangePasswordModalOpen"),
      "Change Password modal trigger must exist"
    );
  });

  it("10. Profile modals: EditClientPersonalModal, EditClientAboutModal, ChangePasswordModal, CancelAppointmentModal, LogoutModal exist", () => {
    assert.ok(
      clientProfileModalsCode.includes("export function EditClientPersonalModal"),
      "EditClientPersonalModal must be exported"
    );
    assert.ok(
      clientProfileModalsCode.includes("export function EditClientAboutModal"),
      "EditClientAboutModal must be exported"
    );
    assert.ok(
      clientProfileModalsCode.includes("export function ChangePasswordModal"),
      "ChangePasswordModal must be exported"
    );
    assert.ok(
      clientProfileModalsCode.includes("export function CancelAppointmentModal"),
      "CancelAppointmentModal must be exported"
    );
    assert.ok(
      clientProfileModalsCode.includes("export function LogoutModal"),
      "LogoutModal must be exported"
    );
  });
});
