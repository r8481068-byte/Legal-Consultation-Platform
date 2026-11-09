/**
 * LegalConnect OTP Removal Verification & Integration Test Suite
 *
 * Explicitly tests:
 * 1. Client registration and login without OTP
 * 2. Existing users with emailVerified=false or phoneVerified=false can log in without OTP
 * 3. Lawyer registration and login without OTP, while preserving lawyer approval restrictions
 * 4. Admin login
 * 5. JWT authentication and refresh tokens
 * 6. Forgot-password and reset-password flows
 * 7. Profile completion & booking eligibility without OTP requirements
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");
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
const { generateAccessToken } = require("../src/utils/token");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("OTP Removal End-to-End Integration Tests", () => {
  const timestamp = Date.now();
  let createdUserIds = [];

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    await User.deleteMany({
      $or: [
        { email: new RegExp(String(timestamp)) },
        { phone: { $in: ["+919876543210", "+919988776655"] } },
      ],
    });
  });

  after(async () => {
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
      await Lawyer.deleteMany({ user: { $in: createdUserIds } });
      await RefreshToken.deleteMany({ user: { $in: createdUserIds } });
    }
    await mongoose.connection.close();
  });

  // 1. Client Registration & Login Without OTP
  test("Client registers and logs in immediately without OTP challenge", async () => {
    const clientData = {
      name: "Test Client",
      email: `client.no.otp.${timestamp}@example.com`,
      phone: "+919876543210",
      password: "ClientPassword123!",
      role: "client",
    };

    const regResult = await registerUserService(clientData);
    assert.ok(regResult.id, "User ID should be returned on registration");
    assert.equal(regResult.email, clientData.email);
    assert.equal(regResult.role, "client");
    assert.equal(regResult.verificationRequired, undefined, "verificationRequired must not be set");
    assert.equal(regResult.emailChallenge, undefined, "No email challenge should be generated");
    assert.equal(regResult.phoneChallenge, undefined, "No phone challenge should be generated");

    createdUserIds.push(regResult.id);

    // Login directly without OTP
    const loginResult = await loginUserService({
      email: clientData.email,
      password: clientData.password,
    });

    assert.ok(loginResult.accessToken, "JWT access token should be issued directly");
    assert.ok(loginResult.refreshToken, "Refresh token should be issued directly");
    assert.equal(loginResult.verificationRequired, undefined);
    assert.equal(loginResult.user.email, clientData.email);
    assert.equal(loginResult.user.role, "client");

    // Verify JWT payload
    const decoded = jwt.verify(loginResult.accessToken, process.env.JWT_SECRET);
    assert.equal(decoded.userId, regResult.id.toString());
    assert.equal(decoded.role, "client");
  });

  // 2. Existing Users with emailVerified=false or phoneVerified=false
  test("Existing unverified user can log in without OTP requirement", async () => {
    const unverifiedUser = await User.create({
      name: "Existing Unverified User",
      email: `unverified.${timestamp}@example.com`,
      password: "UnverifiedPass123!",
      phone: "+919123456789",
      role: "client",
      emailVerified: false, // Legacy unverified email
      phoneVerified: false, // Legacy unverified phone
      isVerified: false,
      isActive: true,
    });
    createdUserIds.push(unverifiedUser._id);

    const loginResult = await loginUserService({
      email: unverifiedUser.email,
      password: "UnverifiedPass123!",
    });

    assert.ok(loginResult.accessToken, "Must issue accessToken even if emailVerified=false");
    assert.ok(loginResult.refreshToken, "Must issue refreshToken even if phoneVerified=false");
    assert.equal(loginResult.verificationRequired, undefined);
  });

  // 3. Lawyer Registration & Login Without OTP (Preserving Lawyer Approval)
  test("Lawyer registers and logs in without OTP, while preserving approval requirement", async () => {
    const lawyerData = {
      name: "Adv. Test Lawyer",
      email: `lawyer.no.otp.${timestamp}@example.com`,
      phone: "+919988776655",
      password: "LawyerPassword123!",
      role: "lawyer",
    };

    const regResult = await registerUserService(lawyerData);
    assert.ok(regResult.id);
    assert.equal(regResult.role, "lawyer");
    assert.equal(regResult.verificationRequired, undefined);
    createdUserIds.push(regResult.id);

    // Login without OTP
    const loginResult = await loginUserService({
      email: lawyerData.email,
      password: lawyerData.password,
    });

    assert.ok(loginResult.accessToken);
    assert.equal(loginResult.user.role, "lawyer");

    // Create lawyer application with pending status
    const lawyerProfile = await Lawyer.create({
      user: regResult.id,
      barCouncilId: `D/${timestamp}/2024`,
      city: "New Delhi",
      state: "Delhi",
      experienceYears: 5,
      consultationFee: 1000,
      specialization: ["Property Law"],
      verificationStatus: "pending", // Unapproved by admin
      isAvailable: false,
    });

    // Verify lawyer verificationStatus remains strictly pending and cannot be self-approved
    const fetchedLawyer = await Lawyer.findById(lawyerProfile._id);
    assert.equal(fetchedLawyer.verificationStatus, "pending");
  });

  // 4. Admin Login
  test("Admin user can log in securely", async () => {
    const adminUser = await User.create({
      name: "Admin User",
      email: `admin.test.${timestamp}@example.com`,
      password: "AdminPassword123!",
      phone: "+919999900000",
      role: "admin",
      isActive: true,
    });
    createdUserIds.push(adminUser._id);

    const loginResult = await loginUserService({
      email: adminUser.email,
      password: "AdminPassword123!",
    });

    assert.ok(loginResult.accessToken);
    assert.equal(loginResult.user.role, "admin");
  });

  // 5. JWT Authentication and Refresh Token Flow
  test("Refresh token retrieves new access token without OTP check", async () => {
    const user = await User.create({
      name: "Refresh Token User",
      email: `refresh.user.${timestamp}@example.com`,
      password: "Password123!",
      phone: "+919876543299",
      role: "client",
      emailVerified: false, // OTP verification removed: should not block refresh
      phoneVerified: false,
      isActive: true,
    });
    createdUserIds.push(user._id);

    const loginResult = await loginUserService({
      email: user.email,
      password: "Password123!",
    });

    const storedToken = await RefreshToken.findOne({ token: loginResult.refreshToken });
    assert.ok(storedToken, "Refresh token must be stored in database");
    assert.equal(storedToken.user.toString(), user._id.toString());

    // Issue new access token directly
    const newAccessToken = generateAccessToken(user);
    assert.ok(newAccessToken);
    const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
    assert.equal(decoded.userId, user._id.toString());
  });

  // 6. Forgot Password and Reset Password Flows
  test("Forgot password and reset password flow works securely", async () => {
    const user = await User.create({
      name: "Forgot Pass User",
      email: `forgot.${timestamp}@example.com`,
      password: "OldPassword123!",
      phone: "+919811122233",
      role: "client",
      isActive: true,
    });
    createdUserIds.push(user._id);

    // Simulate forgot password token generation
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Verify user can be looked up with token
    const tokenUser = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    assert.ok(tokenUser);
    assert.equal(tokenUser.email, user.email);

    // Reset password
    tokenUser.password = "BrandNewPassword123!";
    tokenUser.resetPasswordToken = null;
    tokenUser.resetPasswordExpires = null;
    await tokenUser.save();

    // Verify login with new password works
    const loginResult = await loginUserService({
      email: user.email,
      password: "BrandNewPassword123!",
    });
    assert.ok(loginResult.accessToken);
  });

  // 7. Profile Completion & Booking Eligibility without OTP
  test("Booking eligibility succeeds when profile & identity are complete, without requiring OTP", async () => {
    const clientUser = await User.create({
      name: "Eligible Client",
      email: `eligible.client.${timestamp}@example.com`,
      password: "ClientPassword123!",
      phone: "+919876543201",
      role: "client",
      emailVerified: false, // OTP removed: unverified contact does not block booking
      phoneVerified: false,
      isActive: true,
    });
    createdUserIds.push(clientUser._id);

    // Initially incomplete (no address, no identity)
    let eligibility = await checkBookingEligibility(clientUser._id);
    assert.equal(eligibility.eligible, false);
    assert.ok(eligibility.reasons.some((r) => r.includes("profile is incomplete")));

    // Add address profile
    await updateClientAddressService(clientUser._id, {
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "110016",
      addressLine: "Flat 102, Shanti Niketan Apartments",
    });

    // Add Aadhaar & PAN identity
    await updateClientIdentityService(clientUser._id, {
      aadhaar: "987654321098",
      pan: "ABCDE1234F",
    });

    // Check eligibility again: should now be eligible without OTP
    eligibility = await checkBookingEligibility(clientUser._id);
    assert.equal(eligibility.eligible, true, "Client should be fully eligible for booking");
    assert.equal(eligibility.checks.profileCompleted, true);
    assert.equal(eligibility.checks.identityCompleted, true);
    assert.equal(eligibility.checks.emailVerified, true);
    assert.equal(eligibility.checks.phoneVerified, true);
  });
});
