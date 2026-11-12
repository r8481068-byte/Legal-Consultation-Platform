import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Remove Forced 100% Profile Completion Page & Redirect to Client Portal My Profile", () => {
  const appFile = fs.readFileSync(path.join(__dirname, "../src/App.jsx"), "utf8");
  const lawyerProfileFile = fs.readFileSync(path.join(__dirname, "../src/pages/LawyerProfile.jsx"), "utf8");
  const bookAppointmentFile = fs.readFileSync(path.join(__dirname, "../src/pages/BookAppointment.jsx"), "utf8");
  const dashboardFile = fs.readFileSync(path.join(__dirname, "../src/pages/Dashboard.jsx"), "utf8");
  const clientProfileFile = fs.readFileSync(path.join(__dirname, "../src/pages/ClientProfile.jsx"), "utf8");
  const accountMenuFile = fs.readFileSync(path.join(__dirname, "../src/components/AccountMenu.jsx"), "utf8");
  const navbarFile = fs.readFileSync(path.join(__dirname, "../src/components/Navbar.jsx"), "utf8");

  it("1. Separate Forced 100% Profile Completion Page & Gate Notice Removed", () => {
    // Ensure the unwanted gate header is completely removed
    assert.strictEqual(
      clientProfileFile.includes("100% Profile Completion Required to Book Consultation"),
      false,
      "Forced '100% Profile Completion Required to Book Consultation' notice must be removed from ClientProfile"
    );
    assert.strictEqual(
      dashboardFile.includes("100% Profile Completion Required to Book Consultation"),
      false,
      "Dashboard must not contain the forced '100% Profile Completion Required' gate notice"
    );
    assert.strictEqual(
      lawyerProfileFile.includes("navigate('/client/profile'") ||
        lawyerProfileFile.includes('navigate("/client/profile"'),
      false,
      "LawyerProfile must not redirect to old /client/profile page"
    );
    assert.strictEqual(
      bookAppointmentFile.includes("navigate('/client/profile'") ||
        bookAppointmentFile.includes('navigate("/client/profile"'),
      false,
      "BookAppointment must not redirect to old /client/profile page"
    );
  });

  it("2. Incomplete Profile (< 100%) Redirects Directly to Client Portal My Profile (/dashboard?tab=profile)", () => {
    // In LawyerProfile.jsx: incomplete profile redirects to /dashboard?tab=profile
    assert.ok(
      lawyerProfileFile.includes('navigate("/dashboard?tab=profile"'),
      "LawyerProfile must redirect incomplete clients to /dashboard?tab=profile"
    );

    // In BookAppointment.jsx: pre-check and catch block redirect to /dashboard?tab=profile
    assert.ok(
      bookAppointmentFile.includes('navigate("/dashboard?tab=profile"'),
      "BookAppointment must redirect incomplete clients to /dashboard?tab=profile"
    );

    // Selected lawyer context preserved in sessionStorage and location state
    assert.ok(
      lawyerProfileFile.includes('sessionStorage.setItem("pendingConsultation"'),
      "Selected lawyer payload must be preserved in sessionStorage"
    );
    assert.ok(
      lawyerProfileFile.includes("fromBooking: true"),
      "fromBooking flag must be preserved in navigation state"
    );
  });

  it("3. Verification for All Completion Percentages (0%, 30%, 70%, 99% vs 100%)", () => {
    // Condition checks profilePercentage !== 100
    const lawyerConditionMatch = lawyerProfileFile.match(
      /if\s*\(!eligibility\.eligible\s*\|\|\s*eligibility\.checks\?\.profilePercentage\s*!==\s*100\s*\|\|\s*!eligibility\.checks\?\.profileCompleted\)/
    );
    assert.ok(
      lawyerConditionMatch,
      "Eligibility check must apply to any percentage < 100% (e.g. 0%, 30%, 70%, 99%)"
    );

    const bookConditionMatch = bookAppointmentFile.match(
      /if\s*\(\s*eligData\s*&&\s*\(!eligData\.eligible\s*\|\|\s*eligData\.checks\?\.profilePercentage\s*!==\s*100/
    );
    assert.ok(
      bookConditionMatch,
      "BookAppointment pre-check must apply to any percentage < 100%"
    );

    // 100% profile proceeds to booking without redirect
    assert.ok(
      lawyerProfileFile.includes('navigate("/book-appointment");'),
      "100% complete profile proceeds directly to /book-appointment"
    );
  });

  it("4. App.jsx Routes: Profile URLs Redirect to Client Portal My Profile (/dashboard?tab=profile)", () => {
    assert.ok(
      appFile.includes('path="/client/profile"') &&
        appFile.includes('element={<Navigate to="/dashboard?tab=profile" replace />}'),
      "/client/profile route must redirect to /dashboard?tab=profile"
    );
    assert.ok(
      appFile.includes('path="/client/profile-completion"') &&
        appFile.includes('element={<Navigate to="/dashboard?tab=profile" replace />}'),
      "/client/profile-completion route must redirect to /dashboard?tab=profile"
    );
    assert.ok(
      appFile.includes('path="/profile-completion"') &&
        appFile.includes('element={<Navigate to="/dashboard?tab=profile" replace />}'),
      "/profile-completion route must redirect to /dashboard?tab=profile"
    );
    assert.ok(
      appFile.includes('path="/my-profile"') &&
        appFile.includes('element={<Navigate to="/dashboard?tab=profile" replace />}'),
      "/my-profile route must redirect to /dashboard?tab=profile"
    );
  });

  it("5. Client Portal My Profile Interface: Contains All Required Sections & Elements", () => {
    const profileTabStart = dashboardFile.indexOf('activeTab === "profile"');
    assert.ok(profileTabStart !== -1, "Dashboard must have activeTab === 'profile' view");

    const profileTabSnippet = dashboardFile.slice(profileTabStart);

    // Client Profile Overview
    assert.ok(profileTabSnippet.includes("Registered Client"), "Must include Registered Client label");
    assert.ok(profileTabSnippet.includes("clientName"), "Must display clientName");
    assert.ok(profileTabSnippet.includes("clientEmail"), "Must display clientEmail");
    assert.ok(profileTabSnippet.includes("clientPhone"), "Must display clientPhone");
    assert.ok(profileTabSnippet.includes("completenessPercentage"), "Must display profile completeness percentage");
    assert.ok(profileTabSnippet.includes("clientImage"), "Must display profile photo if available");

    // Legal Matter Overview
    assert.ok(profileTabSnippet.includes("Legal Matter Overview"), "Must include Legal Matter Overview section");
    assert.ok(profileTabSnippet.includes("Edit Overview"), "Must include Edit Overview action");

    // Section 1: Personal Information
    assert.ok(profileTabSnippet.includes("Personal Information"), "Must include Personal Information section");
    assert.ok(profileTabSnippet.includes("Full Name"), "Must include Full Name");
    assert.ok(profileTabSnippet.includes("Email Address"), "Must include Email Address");
    assert.ok(profileTabSnippet.includes("Mobile Number"), "Must include Mobile Number");
    assert.ok(profileTabSnippet.includes("Gender"), "Must include Gender");
    assert.ok(profileTabSnippet.includes("Date of Birth"), "Must include Date of Birth");
    assert.ok(profileTabSnippet.includes("City / Village"), "Must include City / Village");
    assert.ok(profileTabSnippet.includes("District"), "Must include District");
    assert.ok(profileTabSnippet.includes("State / UT"), "Must include State / UT");
    assert.ok(profileTabSnippet.includes("PIN Code"), "Must include PIN Code");
    assert.ok(profileTabSnippet.includes("Edit Personal Details"), "Must include Edit Personal Details action");

    // Section 2: Identity Documents & Verification
    assert.ok(
      profileTabSnippet.includes("Identity Documents & Verification"),
      "Must include Identity Documents & Verification section"
    );
    assert.ok(profileTabSnippet.includes("Aadhaar Number"), "Must include Aadhaar Number");
    assert.ok(profileTabSnippet.includes("PAN Card Number") || profileTabSnippet.includes("Permanent Account Number"), "Must include PAN Number");
    assert.ok(profileTabSnippet.includes("maskedAadhaar"), "Must display masked Aadhaar identifier");
    assert.ok(profileTabSnippet.includes("maskedPan"), "Must display masked PAN identifier");
    assert.ok(profileTabSnippet.includes("AES-256-GCM"), "Must retain AES-256-GCM encryption notice");
    assert.ok(
      profileTabSnippet.includes("Update Identity Details") ||
        profileTabSnippet.includes("Add Identity Details"),
      "Must include Update Identity Details / Add Identity Details action"
    );

    // Section 3: About Me & Legal Interests
    assert.ok(profileTabSnippet.includes("About Me & Legal Interests"), "Must include About Me section");
    assert.ok(profileTabSnippet.includes("Case Summary / Introduction"), "Must include Case Summary");
    assert.ok(profileTabSnippet.includes("Preferred Language for Consultation"), "Must include Preferred Language");
    assert.ok(profileTabSnippet.includes("Edit Profile Summary"), "Must include Edit Profile Summary action");

    // Section 4: Account Security & Password
    assert.ok(profileTabSnippet.includes("Account Security & Password"), "Must include Account Security section");
    assert.ok(profileTabSnippet.includes("Change Password"), "Must include Change Password action");
  });

  it("6. Selected Lawyer Context Preservation in Client Portal", () => {
    // Dashboard checks pendingConsultation from sessionStorage and location.state
    assert.ok(
      dashboardFile.includes('sessionStorage.getItem("pendingConsultation")'),
      "Dashboard must inspect pendingConsultation in sessionStorage"
    );
    assert.ok(
      dashboardFile.includes("location.state?.fromBooking"),
      "Dashboard must inspect location.state.fromBooking"
    );

    // Displays non-blocking selected consultation card when pendingBooking exists
    assert.ok(
      dashboardFile.includes("pendingBooking"),
      "Dashboard profile view must support pendingBooking context"
    );
    assert.ok(
      dashboardFile.includes("Continue Booking"),
      "Dashboard must allow continuing booking when profile is 100% complete"
    );
  });

  it("7. Navigation Links (AccountMenu & Navbar) Point to Client Portal My Profile or Dashboard", () => {
    // Following AccountMenu simplification (keeping only Dashboard & Logout), AccountMenu directs to /dashboard
    assert.ok(
      accountMenuFile.includes('return "/dashboard"'),
      "AccountMenu must route clients to /dashboard"
    );
    assert.strictEqual(
      accountMenuFile.includes('to="/client/profile-completion"'),
      false,
      "AccountMenu must not have old /client/profile-completion link"
    );

    assert.ok(
      navbarFile.includes('to="/dashboard?tab=profile"'),
      "Navbar must link My Profile to /dashboard?tab=profile"
    );
  });

  it("8. Strict Safety: No Automatic Appointment Creation on Redirect", () => {
    // LawyerProfile and BookAppointment only redirect; they do not invoke create appointment on eligibility redirect
    const lawyerRedirectSection = lawyerProfileFile.slice(
      lawyerProfileFile.indexOf("getBookingEligibility"),
      lawyerProfileFile.indexOf("navigate('/book-appointment')") !== -1
        ? lawyerProfileFile.indexOf("navigate('/book-appointment')")
        : lawyerProfileFile.indexOf('navigate("/book-appointment")')
    );
    assert.strictEqual(
      lawyerRedirectSection.includes("bookAppointment") ||
        lawyerRedirectSection.includes("createAppointment"),
      false,
      "Redirection must not create an appointment"
    );
  });
});

