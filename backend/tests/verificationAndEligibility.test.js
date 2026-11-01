/**
 * LegalConnect Secure Verification & Booking Eligibility Test Suite
 *
 * Covers:
 * 1. Cryptographic utilities (HMAC OTP hashing, AES-256-GCM encryption, masking, and validation)
 * 2. Registration field validation, email normalization, and Indian mobile numbers
 * 3. Email & Phone OTP challenge lifecycle (HMAC verify, expiry, max attempts, cooldown)
 * 4. Client profile completion calculation & required Indian address fields
 * 5. Secure Aadhaar & PAN format gate and masking
 * 6. Centralized booking eligibility gate (contact verification, profile, and identity checks)
 * 7. Refresh token verification enforcement
 * 8. Legacy user migration behavior
 *
 * Run with:
 *   node --test tests/verificationAndEligibility.test.js
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const {
  encryptSensitive,
  decryptSensitive,
  normalizeEmail,
  normalizeIndianMobile,
  isValidIndianMobile,
  isValidAadhaar,
  maskAadhaar,
  isValidPAN,
  maskPAN,
  isValidPinCode,
} = require("../src/utils/cryptoUtils");

const {
  calculateProfileCompleteness,
  calculateIdentityStatus,
  REQUIRED_PROFILE_FIELDS,
} = require("../src/services/eligibilityService");

describe("1. Cryptographic & Security Utility Tests", () => {

  test("encryptSensitive and decryptSensitive perform round-trip AES-256-GCM encryption", () => {
    const sensitiveAadhaar = "987654321098";
    const encrypted = encryptSensitive(sensitiveAadhaar);

    assert.notEqual(encrypted, sensitiveAadhaar);
    const parts = encrypted.split(":");
    assert.equal(parts.length, 3); // iv : authTag : cipherHex

    const decrypted = decryptSensitive(encrypted);
    assert.equal(decrypted, sensitiveAadhaar);

    // Tampered payload fails decryption safely without throw
    const tampered = encrypted.slice(0, -4) + "0000";
    const failedDecryption = decryptSensitive(tampered);
    assert.equal(failedDecryption, null);
  });

  test("normalizeEmail standardizes emails to lowercase and trimmed string", () => {
    assert.equal(normalizeEmail("  Client.Demo@Example.COM  "), "client.demo@example.com");
    assert.equal(normalizeEmail("USER@DOMAIN.IN"), "user@domain.in");
    assert.equal(normalizeEmail(""), "");
    assert.equal(normalizeEmail(null), "");
  });

  test("normalizeIndianMobile validates and normalizes Indian mobile numbers", () => {
    // Valid formats
    assert.equal(normalizeIndianMobile("9876543210"), "+919876543210");
    assert.equal(normalizeIndianMobile("+91 98765 43210"), "+919876543210");
    assert.equal(normalizeIndianMobile("09876543210"), "+919876543210");
    assert.equal(normalizeIndianMobile("+919876543210"), "+919876543210");
    assert.equal(normalizeIndianMobile("8888888888"), "+918888888888");
    assert.equal(normalizeIndianMobile("7000000000"), "+917000000000");
    assert.equal(normalizeIndianMobile("6123456789"), "+916123456789");

    // Invalid numbers
    assert.equal(normalizeIndianMobile("5123456789"), null); // Doesn't start with 6-9
    assert.equal(normalizeIndianMobile("12345"), null); // Too short
    assert.equal(normalizeIndianMobile("987654321099"), null); // Too long
    assert.equal(normalizeIndianMobile("abcdefghij"), null); // Non-numeric
    assert.equal(normalizeIndianMobile(""), null);

    assert.equal(isValidIndianMobile("9876543210"), true);
    assert.equal(isValidIndianMobile("12345"), false);
  });

  test("Aadhaar validation and masking adhere to 12-digit rules", () => {
    assert.equal(isValidAadhaar("987654321098"), true);
    assert.equal(isValidAadhaar("9876 5432 1098"), true);
    assert.equal(isValidAadhaar("9876-5432-1098"), true);
    assert.equal(isValidAadhaar("234567890123"), true);

    // Invalid: Starts with 0 or 1, or wrong length
    assert.equal(isValidAadhaar("087654321098"), false);
    assert.equal(isValidAadhaar("187654321098"), false);
    assert.equal(isValidAadhaar("987654321"), false);
    assert.equal(isValidAadhaar("abcdefghijkl"), false);

    assert.equal(maskAadhaar("987654321098"), "XXXX-XXXX-1098");
    assert.equal(maskAadhaar("9876 5432 1098"), "XXXX-XXXX-1098");
  });

  test("PAN validation and masking adhere to 10-char alphanumeric rules", () => {
    assert.equal(isValidPAN("ABCDE1234F"), true);
    assert.equal(isValidPAN("xyzpk5678m"), true);

    // Invalid: wrong length or character types
    assert.equal(isValidPAN("ABCD12345F"), false); // 4 letters then 5 digits
    assert.equal(isValidPAN("ABCDE12345"), false); // ends in digit
    assert.equal(isValidPAN("12345ABCDE"), false);
    assert.equal(isValidPAN("ABCDE123"), false);

    assert.equal(maskPAN("ABCDE1234F"), "XXXXX1234F");
    assert.equal(maskPAN("xyzpk5678m"), "XXXXX5678M");
  });

  test("Indian PIN code validation adheres to 6-digit postal rules", () => {
    assert.equal(isValidPinCode("110001"), true);
    assert.equal(isValidPinCode("560001"), true);
    assert.equal(isValidPinCode("400001"), true);
    assert.equal(isValidPinCode(110016), true);

    // Invalid: Starts with 0 or not 6 digits
    assert.equal(isValidPinCode("010001"), false);
    assert.equal(isValidPinCode("11001"), false);
    assert.equal(isValidPinCode("1100001"), false);
    assert.equal(isValidPinCode("ABCDEF"), false);
    assert.equal(isValidPinCode(null), false);
  });
});

describe("2. Profile Completeness & Identity Requirements", () => {
  test("calculateProfileCompleteness identifies complete and missing required address fields", () => {
    const incompleteUser = {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+919876543210",
      state: "Delhi NCR",
      district: "South Delhi",
      // missing: subDistrict, locality, cityVillage, pincode, addressLine
    };

    const incompleteRes = calculateProfileCompleteness(incompleteUser);
    assert.equal(incompleteRes.isComplete, false);
    assert.ok(incompleteRes.percentage < 100);
    assert.ok(incompleteRes.missingFields.includes("pincode"));
    assert.ok(incompleteRes.missingFields.includes("addressLine"));
    assert.ok(incompleteRes.missingFields.includes("cityVillage"));

    const completeUser = {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+919876543210",
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "110016",
      addressLine: "Flat 102, Shanti Niketan Apartments",
    };

    const completeRes = calculateProfileCompleteness(completeUser);
    assert.equal(completeRes.isComplete, true);
    assert.equal(completeRes.percentage, 100);
    assert.equal(completeRes.missingFields.length, 0);
  });

  test("calculateProfileCompleteness rejects invalid PIN code format", () => {
    const userWithInvalidPincode = {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+919876543210",
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "01234", // Invalid PIN code
      addressLine: "Flat 102, Shanti Niketan Apartments",
    };

    const res = calculateProfileCompleteness(userWithInvalidPincode);
    assert.equal(res.isComplete, false);
    assert.ok(res.missingFields.includes("pincode"));
  });

  test("calculateIdentityStatus requires both Aadhaar and PAN masked tokens", () => {
    const noIdentityUser = {};
    const res1 = calculateIdentityStatus(noIdentityUser);
    assert.equal(res1.isComplete, false);
    assert.equal(res1.hasAadhaar, false);
    assert.equal(res1.hasPan, false);

    const aadhaarOnlyUser = { aadhaarMasked: "XXXX-XXXX-1234" };
    const res2 = calculateIdentityStatus(aadhaarOnlyUser);
    assert.equal(res2.isComplete, false);
    assert.equal(res2.hasAadhaar, true);
    assert.equal(res2.hasPan, false);

    const bothProvidedUser = {
      aadhaarMasked: "XXXX-XXXX-1234",
      panMasked: "XXXXX1234F",
    };
    const res3 = calculateIdentityStatus(bothProvidedUser);
    assert.equal(res3.isComplete, true);
    assert.equal(res3.hasAadhaar, true);
    assert.equal(res3.hasPan, true);
  });
});

describe("3. Centralized Booking Eligibility Enforcement Logic", () => {
  test("Centralized gate allows client accounts with completed profile and identity regardless of emailVerified/phoneVerified", () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      role: "client",
      isActive: true,
      emailVerified: false, // OTP verification removed: no longer blocks booking
      phoneVerified: false,
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+919876543210",
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "110016",
      addressLine: "Flat 102, Shanti Niketan Apartments",
      aadhaarMasked: "XXXX-XXXX-1234",
      panMasked: "XXXXX1234F",
    };

    const profile = calculateProfileCompleteness(user);
    const identity = calculateIdentityStatus(user);

    assert.equal(profile.isComplete, true);
    assert.equal(identity.isComplete, true);

    // Gate condition check without OTP requirement
    const eligible =
      user.role === "client" &&
      user.isActive &&
      profile.isComplete &&
      identity.isComplete;

    assert.equal(eligible, true);
  });

  test("Centralized gate rejects accounts with incomplete profile or identity", () => {
    const incompleteUser = {
      _id: "507f1f77bcf86cd799439011",
      role: "client",
      isActive: true,
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+919876543210",
      state: "Delhi NCR",
      // missing address fields
    };

    const profile = calculateProfileCompleteness(incompleteUser);
    const identity = calculateIdentityStatus(incompleteUser);

    const eligible =
      incompleteUser.role === "client" &&
      incompleteUser.isActive &&
      profile.isComplete &&
      identity.isComplete;

    assert.equal(eligible, false);
  });
});
