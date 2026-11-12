/**
 * Test Suite: Direct Registration & Login Without OTP Verification
 *
 * Verifies all 9 items requested:
 * 1. Client can register with mandatory Email ID and Mobile Number without OTP.
 * 2. Lawyer can register with mandatory Email ID and Mobile Number without OTP.
 * 3. Missing Email ID is rejected.
 * 4. Missing Mobile Number is rejected.
 * 5. Duplicate Email ID and Mobile Number validations still work.
 * 6. Client can log in using registered Email ID and Password.
 * 7. Lawyer can log in using registered Email ID and Password.
 * 8. Admin login and authorization continue working.
 * 9. Existing dashboards and features remain functional.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const RefreshToken = require("../src/models/RefreshToken");
const {
  registerUserService,
  loginUserService,
  updateClientAddressService,
  updateClientIdentityService,
} = require("../src/services/authService");
const { checkBookingEligibility } = require("../src/services/eligibilityService");
const { connectTestDB, disconnectTestDB } = require("./helpers/testDb");

describe("Registration & Login Without OTP Verification Test Suite", () => {
  const timestamp = Date.now();
  const makePhone = (idx) => "+919" + String(timestamp).slice(-6) + String(idx).padStart(3, "0");
  const createdUserIds = [];

  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
      await Lawyer.deleteMany({ user: { $in: createdUserIds } });
      await RefreshToken.deleteMany({ user: { $in: createdUserIds } });
    }
    await disconnectTestDB();
  });

  // 1. Client can register with mandatory Email ID and Mobile Number without OTP
  test("1. Client can register with mandatory Email ID and Mobile Number without OTP", async () => {
    const email = `client.nootp.${timestamp}@example.com`;
    const phone = makePhone(1);

    const regRes = await registerUserService({
      name: "Rohan Verma",
      email,
      phone,
      password: "ClientPassword123!",
      role: "client",
    });

    assert.equal(regRes.success, true);
    assert.ok(regRes.id, "User ID must be returned immediately");
    assert.equal(regRes.email, email.toLowerCase());
    assert.equal(regRes.role, "client");
    assert.equal(regRes.verificationRequired, undefined, "No verification challenge should be required");

    createdUserIds.push(regRes.id);

    // Verify account exists directly in database
    const dbUser = await User.findById(regRes.id);
    assert.ok(dbUser, "User record must exist in DB immediately");
    assert.equal(dbUser.phone, phone);
    assert.equal(dbUser.isActive, true);
  });

  // 2. Lawyer can register with mandatory Email ID and Mobile Number without OTP
  test("2. Lawyer can register with mandatory Email ID and Mobile Number without OTP", async () => {
    const email = `lawyer.nootp.${timestamp}@example.com`;
    const phone = makePhone(2);

    const regRes = await registerUserService({
      name: "Adv. Sunita Rao",
      email,
      phone,
      password: "AdvocatePassword123!",
      role: "lawyer",
    });

    assert.equal(regRes.success, true);
    assert.ok(regRes.id);
    assert.equal(regRes.role, "lawyer");
    assert.equal(regRes.verificationRequired, undefined);

    createdUserIds.push(regRes.id);

    const dbUser = await User.findById(regRes.id);
    assert.ok(dbUser);
    assert.equal(dbUser.role, "lawyer");
  });

  // 3. Missing Email ID is rejected
  test("3. Missing Email ID is rejected", async () => {
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "No Email User",
          email: "",
          phone: makePhone(3),
          password: "Password123!",
          role: "client",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /valid email address is required/i);
        return true;
      }
    );
  });

  // 4. Missing Mobile Number is rejected
  test("4. Missing Mobile Number is rejected", async () => {
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "No Phone User",
          email: `nophone.${timestamp}@example.com`,
          phone: "",
          password: "Password123!",
          role: "client",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /valid 10-digit Indian mobile number/i);
        return true;
      }
    );
  });

  // 5. Duplicate Email ID and Mobile Number validations still work
  test("5. Duplicate Email ID and Mobile Number validations still work", async () => {
    const email = `dup.test.${timestamp}@example.com`;
    const phone = makePhone(5);

    const original = await registerUserService({
      name: "Original User",
      email,
      phone,
      password: "Password123!",
      role: "client",
    });
    createdUserIds.push(original.id);

    // Duplicate email rejection
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "Duplicate Email Attempt",
          email,
          phone: makePhone(6),
          password: "Password123!",
          role: "client",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /email address already exists/i);
        return true;
      }
    );

    // Duplicate phone rejection
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "Duplicate Phone Attempt",
          email: `different.${timestamp}@example.com`,
          phone,
          password: "Password123!",
          role: "client",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /mobile number already exists/i);
        return true;
      }
    );
  });

  // 6. Client can log in using registered Email ID and Password
  test("6. Client can log in using registered Email ID and Password", async () => {
    const email = `login.client.${timestamp}@example.com`;
    const password = "ClientPass123!";
    const phone = makePhone(7);

    const reg = await registerUserService({
      name: "Login Client",
      email,
      phone,
      password,
      role: "client",
    });
    createdUserIds.push(reg.id);

    const loginRes = await loginUserService({ email, password });
    assert.ok(loginRes.accessToken, "Login must return access token");
    assert.ok(loginRes.refreshToken, "Login must return refresh token");
    assert.equal(loginRes.user.email, email.toLowerCase());
    assert.equal(loginRes.user.role, "client");

    // Token should decode properly
    const decoded = jwt.verify(loginRes.accessToken, process.env.JWT_SECRET);
    assert.equal(decoded.userId, reg.id.toString());
  });

  // 7. Lawyer can log in using registered Email ID and Password
  test("7. Lawyer can log in using registered Email ID and Password", async () => {
    const email = `login.lawyer.${timestamp}@example.com`;
    const password = "LawyerPass123!";
    const phone = makePhone(8);

    const reg = await registerUserService({
      name: "Adv. Login Lawyer",
      email,
      phone,
      password,
      role: "lawyer",
    });
    createdUserIds.push(reg.id);

    const loginRes = await loginUserService({ email, password });
    assert.ok(loginRes.accessToken);
    assert.ok(loginRes.refreshToken);
    assert.equal(loginRes.user.email, email.toLowerCase());
    assert.equal(loginRes.user.role, "lawyer");
  });

  // 8. Admin login and authorization continue working
  test("8. Admin login and authorization continue working", async () => {
    const email = `admin.auth.${timestamp}@example.com`;
    const password = "AdminPassword123!";
    const phone = makePhone(9);

    const admin = await User.create({
      name: "Admin Governance",
      email,
      password,
      phone,
      role: "admin",
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    });
    createdUserIds.push(admin._id);

    const loginRes = await loginUserService({ email, password });
    assert.ok(loginRes.accessToken);
    assert.equal(loginRes.user.role, "admin");

    const decoded = jwt.verify(loginRes.accessToken, process.env.JWT_SECRET);
    assert.equal(decoded.role, "admin");
  });

  // 9. Existing dashboards and features remain functional
  test("9. Existing dashboards and features remain functional without OTP requirement", async () => {
    const clientUser = await User.create({
      name: "Dashboard Client",
      email: `dash.client.${timestamp}@example.com`,
      password: "ClientPassword123!",
      phone: makePhone(10),
      role: "client",
      emailVerified: false,
      phoneVerified: false,
      isActive: true,
    });
    createdUserIds.push(clientUser._id);

    // Initial eligibility check
    let eligibility = await checkBookingEligibility(clientUser._id);
    assert.equal(eligibility.eligible, false);

    // Update profile address
    await updateClientAddressService(clientUser._id, {
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "110016",
      addressLine: "Flat 202, Metro View",
    });

    // Update identity
    await updateClientIdentityService(clientUser._id, {
      aadhaar: "987654321098",
      pan: "ABCDE1234F",
    });

    // Check eligibility again: should now be eligible without OTP
    eligibility = await checkBookingEligibility(clientUser._id);
    assert.equal(eligibility.eligible, true);
    assert.equal(eligibility.checks.profileCompleted, true);
    assert.equal(eligibility.checks.identityCompleted, true);
  });
});
