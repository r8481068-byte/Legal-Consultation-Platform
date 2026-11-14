import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Client Profile Sub-District and Locality Fields Verification", () => {
  const dashboardPath = path.join(__dirname, "../src/pages/Dashboard.jsx");
  const modalsPath = path.join(__dirname, "../src/components/ClientProfileModals.jsx");
  const eligibilityServicePath = path.join(__dirname, "../../backend/src/services/eligibilityService.js");
  const authServicePath = path.join(__dirname, "../../backend/src/services/authService.js");
  const userModelPath = path.join(__dirname, "../../backend/src/models/User.js");

  const dashboardCode = fs.readFileSync(dashboardPath, "utf8");
  const modalsCode = fs.readFileSync(modalsPath, "utf8");
  const eligibilityCode = fs.readFileSync(eligibilityServicePath, "utf8");
  const authServiceCode = fs.readFileSync(authServicePath, "utf8");
  const userModelCode = fs.readFileSync(userModelPath, "utf8");

  describe("1. MongoDB User Model & Backend Support", () => {
    it("User model contains subDistrict and locality fields", () => {
      assert.ok(
        userModelCode.includes("subDistrict: {"),
        "User model must define subDistrict schema field"
      );
      assert.ok(
        userModelCode.includes("locality: {"),
        "User model must define locality schema field"
      );
    });

    it("Backend authService permits and sanitizes subDistrict and locality in updateUserProfileService", () => {
      assert.ok(
        authServiceCode.includes('"subDistrict"'),
        "allowedUpdates must include subDistrict"
      );
      assert.ok(
        authServiceCode.includes('"locality"'),
        "allowedUpdates must include locality"
      );
      assert.ok(
        authServiceCode.includes("updates.subDistrict ="),
        "updates.subDistrict must be handled and trimmed"
      );
      assert.ok(
        authServiceCode.includes("updates.locality ="),
        "updates.locality must be handled and trimmed"
      );
    });

    it("Backend eligibilityService considers subDistrict and locality required for 100% completion", () => {
      assert.ok(
        eligibilityCode.includes('key: "subDistrict"'),
        "REQUIRED_PROFILE_FIELDS must include subDistrict"
      );
      assert.ok(
        eligibilityCode.includes('key: "locality"'),
        "REQUIRED_PROFILE_FIELDS must include locality"
      );
    });
  });

  describe("2. Client Dashboard Read-Only Personal Information Display", () => {
    it("renders Block / Sub-District with profileData?.subDistrict fallback in Section 1", () => {
      assert.ok(
        dashboardCode.includes("Block / Sub-District"),
        "Dashboard must render Block / Sub-District label"
      );
      assert.ok(
        dashboardCode.includes('profileData?.subDistrict || "Not provided"'),
        "Dashboard must render profileData?.subDistrict || 'Not provided'"
      );
    });

    it("renders Area / Locality with profileData?.locality fallback in Section 1", () => {
      assert.ok(
        dashboardCode.includes("Area / Locality"),
        "Dashboard must render Area / Locality label"
      );
      assert.ok(
        dashboardCode.includes('profileData?.locality || "Not provided"'),
        "Dashboard must render profileData?.locality || 'Not provided'"
      );
    });

    it("preserves all existing personal information fields alongside new fields", () => {
      const requiredDisplays = [
        "Full Name",
        "Email Address",
        "Mobile Number",
        "Gender",
        "Date of Birth",
        "City / Village",
        "Block / Sub-District",
        "Area / Locality",
        "District",
        "State / UT",
        "PIN Code",
        "Street Address",
      ];

      for (const field of requiredDisplays) {
        assert.ok(
          dashboardCode.includes(field),
          `Dashboard must retain field label '${field}'`
        );
      }
    });
  });

  describe("3. Edit Personal Details Modal (EditClientPersonalModal)", () => {
    it("initializes form state with subDistrict and locality", () => {
      assert.ok(
        modalsCode.includes('subDistrict: "",'),
        "EditClientPersonalModal formData state must include subDistrict: ''"
      );
      assert.ok(
        modalsCode.includes('locality: "",'),
        "EditClientPersonalModal formData state must include locality: ''"
      );
    });

    it("prefills subDistrict and locality from userData when modal opens", () => {
      assert.ok(
        modalsCode.includes('subDistrict: userData.subDistrict || "",'),
        "EditClientPersonalModal useEffect must prefill subDistrict"
      );
      assert.ok(
        modalsCode.includes('locality: userData.locality || "",'),
        "EditClientPersonalModal useEffect must prefill locality"
      );
    });

    it("includes subDistrict and locality in updateProfile API payload", () => {
      assert.ok(
        modalsCode.includes("subDistrict: formData.subDistrict.trim() || null,"),
        "EditClientPersonalModal handleSubmit must send trimmed subDistrict or null"
      );
      assert.ok(
        modalsCode.includes("locality: formData.locality.trim() || null,"),
        "EditClientPersonalModal handleSubmit must send trimmed locality or null"
      );
    });

    it("provides input fields for Block / Sub-District and Area / Locality", () => {
      assert.ok(
        modalsCode.includes('name="subDistrict"'),
        "EditClientPersonalModal must have input with name='subDistrict'"
      );
      assert.ok(
        modalsCode.includes("value={formData.subDistrict}"),
        "EditClientPersonalModal must bind value to formData.subDistrict"
      );
      assert.ok(
        modalsCode.includes('name="locality"'),
        "EditClientPersonalModal must have input with name='locality'"
      );
      assert.ok(
        modalsCode.includes("value={formData.locality}"),
        "EditClientPersonalModal must bind value to formData.locality"
      );
    });
  });

  describe("4. Profile Completeness Logic Verification", () => {
    const REQUIRED_FIELDS = [
      "name",
      "email",
      "phone",
      "state",
      "district",
      "subDistrict",
      "locality",
      "cityVillage",
      "pincode",
      "addressLine",
    ];

    function calcCompleteness(user) {
      if (!user) return 0;
      const completed = REQUIRED_FIELDS.filter(
        (key) => user[key] && typeof user[key] === "string" && user[key].trim().length > 0
      );
      return Math.round((completed.length / REQUIRED_FIELDS.length) * 100);
    }

    it("calculates 80% when 8 fields are filled but subDistrict and locality are missing", () => {
      const userWithoutSubDistrictAndLocality = {
        name: "Rupesh Kumar",
        email: "rupesh@example.com",
        phone: "9876543210",
        state: "Delhi",
        district: "South Delhi",
        cityVillage: "New Delhi",
        pincode: "110001",
        addressLine: "Flat 101, Connaught Place",
        subDistrict: null,
        locality: "",
      };

      const percentage = calcCompleteness(userWithoutSubDistrictAndLocality);
      assert.strictEqual(percentage, 80, "Completeness must be exactly 80% when subDistrict and locality are missing");
    });

    it("calculates 100% when all 10 fields including subDistrict and locality are filled", () => {
      const completeUser = {
        name: "Rupesh Kumar",
        email: "rupesh@example.com",
        phone: "9876543210",
        state: "Delhi",
        district: "South Delhi",
        subDistrict: "Chanakyapuri Sub-Division",
        locality: "Connaught Place",
        cityVillage: "New Delhi",
        pincode: "110001",
        addressLine: "Flat 101, Connaught Place",
      };

      const percentage = calcCompleteness(completeUser);
      assert.strictEqual(percentage, 100, "Completeness must reach 100% when all required fields are filled");
    });
  });
});

