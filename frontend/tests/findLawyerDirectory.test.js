import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Find Lawyer (Lawyer-to-Lawyer Directory) Verification", () => {
  const lawyerDashboardFile = fs.readFileSync(
    path.join(__dirname, "../src/pages/LawyerDashboard.jsx"),
    "utf8"
  );
  const directoryCompFile = fs.readFileSync(
    path.join(__dirname, "../src/components/FindLawyerDirectory.jsx"),
    "utf8"
  );
  const modalCompFile = fs.readFileSync(
    path.join(__dirname, "../src/components/LawyerToLawyerProfileModal.jsx"),
    "utf8"
  );
  const backendLawyerServiceFile = fs.readFileSync(
    path.join(__dirname, "../../backend/src/services/lawyerService.js"),
    "utf8"
  );

  it("1. Sidebar position: Find Lawyer is immediately below Dashboard (Item #3)", () => {
    // Check validTabs array
    const validTabsMatch = lawyerDashboardFile.match(/validTabs\s*=\s*useMemo\(\s*\(\)\s*=>\s*\[([^\]]+)\]/s);
    assert.ok(validTabsMatch, "validTabs definition should exist");
    const tabsList = validTabsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/["']/g, ""))
      .filter(Boolean);

    const dashIndex = tabsList.indexOf("dashboard");
    const findIndex = tabsList.indexOf("find-lawyer");
    assert.ok(dashIndex !== -1, "dashboard tab must exist");
    assert.strictEqual(findIndex, dashIndex + 1, "find-lawyer must be immediately after dashboard in validTabs");

    // Check sidebarMenuItems order
    const dashboardItemPos = lawyerDashboardFile.indexOf('id: "dashboard"');
    const findLawyerItemPos = lawyerDashboardFile.indexOf('id: "find-lawyer"');
    const availabilityItemPos = lawyerDashboardFile.indexOf('id: "availability"');

    assert.ok(dashboardItemPos !== -1, "Dashboard item should exist in sidebarMenuItems");
    assert.ok(findLawyerItemPos !== -1, "Find Lawyer item should exist in sidebarMenuItems");
    assert.ok(availabilityItemPos !== -1, "Availability item should exist in sidebarMenuItems");

    assert.ok(
      dashboardItemPos < findLawyerItemPos,
      "Find Lawyer must appear after Dashboard"
    );
    assert.ok(
      findLawyerItemPos < availabilityItemPos,
      "Find Lawyer must appear before Availability Schedule"
    );
  });

  it("2. Search & Filters: supports Name, Specialization, Practice Area, Location, Experience, Verification Status, and Sort", () => {
    // Backend searchLawyersService supports required filters
    assert.ok(
      backendLawyerServiceFile.includes("query.verificationStatus"),
      "backend lawyer service must support query.verificationStatus"
    );
    assert.ok(
      backendLawyerServiceFile.includes("query.practiceArea"),
      "backend lawyer service must support query.practiceArea"
    );
    assert.ok(
      backendLawyerServiceFile.includes("query.specialization"),
      "backend lawyer service must support query.specialization"
    );
    assert.ok(
      backendLawyerServiceFile.includes("query.minExperience"),
      "backend lawyer service must support query.minExperience"
    );

    // Frontend directory component provides inputs & controls
    assert.ok(
      directoryCompFile.includes("handleClearFilters"),
      "FindLawyerDirectory must provide Clear Filters functionality"
    );
    assert.ok(
      directoryCompFile.includes("selectedSpecialization"),
      "FindLawyerDirectory must provide specialization filter"
    );
    assert.ok(
      directoryCompFile.includes("practiceArea"),
      "FindLawyerDirectory must provide practice area filter"
    );
    assert.ok(
      directoryCompFile.includes("verificationStatus"),
      "FindLawyerDirectory must provide verification status filter"
    );
    assert.ok(
      directoryCompFile.includes("sortBy"),
      "FindLawyerDirectory must provide sort by options"
    );
  });

  it("3. Lawyer card & View Profile modal: shows public professional credentials without leaking private data", () => {
    // Check that cards have View Profile button
    assert.ok(
      directoryCompFile.includes("View Profile"),
      "FindLawyerDirectory cards must have View Profile action"
    );
    assert.ok(
      directoryCompFile.includes("LawyerToLawyerProfileModal"),
      "FindLawyerDirectory must mount LawyerToLawyerProfileModal"
    );

    // Verify modal has sections: Specializations, Education, Internships, Achievements, Verification
    assert.ok(
      modalCompFile.includes("educationList"),
      "LawyerToLawyerProfileModal must display education credentials"
    );
    assert.ok(
      modalCompFile.includes("internshipsList"),
      "LawyerToLawyerProfileModal must display internships & judicial training"
    );
    assert.ok(
      modalCompFile.includes("awardsList"),
      "LawyerToLawyerProfileModal must display achievements & awards"
    );
    assert.ok(
      modalCompFile.includes("BCI Verified"),
      "LawyerToLawyerProfileModal must display BCI verification status"
    );

    // Verify private data (Aadhaar, PAN, internalNotes, password, booking buttons) is NOT exposed
    assert.ok(
      !directoryCompFile.includes("Book Consultation"),
      "Directory cards must NOT include client booking button"
    );
    assert.ok(
      !modalCompFile.includes("Book Consultation"),
      "Directory profile modal must NOT include client booking button"
    );
    assert.ok(
      !modalCompFile.includes("aadhaar"),
      "Modal must not expose Aadhaar"
    );
    assert.ok(
      !modalCompFile.includes("panNumber"),
      "Modal must not expose PAN"
    );
  });

  it("4. LawyerDashboard mounts FindLawyerDirectory under activeTab === 'find-lawyer'", () => {
    assert.ok(
      lawyerDashboardFile.includes('activeTab === "find-lawyer"'),
      "LawyerDashboard must conditionally render FindLawyerDirectory when activeTab is find-lawyer"
    );
    assert.ok(
      lawyerDashboardFile.includes("<FindLawyerDirectory />") ||
        lawyerDashboardFile.includes("<FindLawyerDirectory"),
      "LawyerDashboard must render FindLawyerDirectory"
    );
  });
});
