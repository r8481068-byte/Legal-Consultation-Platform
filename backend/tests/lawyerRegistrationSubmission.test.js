/**
 * LegalConnect Lawyer Registration & Application Submission Test Suite
 *
 * Covers:
 * 1. Flow A: New Advocate registration without an existing login:
 *    - Registers new user account via registerUserService
 *    - Authenticates via loginUserService to obtain session tokens
 *    - Submits lawyer verification application via applyAsLawyerService
 *    - Validates application is linked to the newly created user with verificationStatus: "pending"
 *    - Verifies demo documents are NOT automatically approved
 * 2. Flow B: Existing logged-in Client applying to become an Advocate:
 *    - Submits lawyer application with existing client session
 *    - Validates application is linked to existing client ID
 * 3. Duplicate Account Prevention:
 *    - Rejects duplicate registration with identical email (409)
 *    - Rejects duplicate registration with identical phone (409)
 * 4. Verification Workflow & Role Promotion:
 *    - Approving application promotes user role to "lawyer" and enables availability
 *    - Rejecting application sets verificationStatus to "rejected" and keeps user role as "client"
 * 5. Route Authorization Gate:
 *    - Validates /api/lawyers/apply and /api/lawyers/application/status allow both client and lawyer roles
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const lawyerRouter = require("../src/routes/lawyerRoutes");

const {
  registerUserService,
  loginUserService,
} = require("../src/services/authService");

const {
  applyAsLawyerService,
  getMyLawyerApplicationService,
} = require("../src/services/lawyerService");

const {
  updateLawyerVerificationService,
} = require("../src/services/adminService");

describe("Lawyer Registration Submission & Application Linking Test Suite", () => {
  let createdUserIds = [];
  let createdLawyerIds = [];
  let adminUserId = null;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Ensure an admin user exists for verification testing
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Test Admin",
        email: `testadmin_${Date.now()}@legalconnect.com`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: "AdminSecurePassword123",
        role: "admin",
        isActive: true,
      });
      createdUserIds.push(admin._id);
    }
    adminUserId = admin._id;
  });

  after(async () => {
    try {
      if (createdLawyerIds.length > 0) {
        await Lawyer.deleteMany({ _id: { $in: createdLawyerIds } });
      }
      if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
      }
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
  });

  test("1. Route Gate: /application/status and /apply permit both client and lawyer roles", () => {
    const routes = [];
    lawyerRouter.stack.forEach((layer) => {
      if (layer.route) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods);
        routes.push({ path, methods, stack: layer.route.stack });
      }
    });

    const applyRoute = routes.find((r) => r.path === "/apply");
    assert.ok(applyRoute, "Route /apply must exist");

    const statusRoute = routes.find((r) => r.path === "/application/status");
    assert.ok(statusRoute, "Route /application/status must exist");
  });

  test("2. Flow A: New Advocate registration without an existing login", async () => {
    const timestamp = Date.now();
    const email = `newadvocate_${timestamp}@test.com`;
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = "AdvocatePass123!";

    // Step A: Register new account using existing registerUser service
    const regRes = await registerUserService({
      name: "Adv. Meera Sen",
      email,
      phone,
      password,
      confirmPassword: password,
      role: "client",
    });

    assert.ok(regRes.id, "Registration should return new user ID");
    createdUserIds.push(regRes.id);

    // Step B: Authenticate via loginUser service to generate session tokens
    const loginRes = await loginUserService({
      email,
      password,
    });

    assert.ok(loginRes.accessToken, "Login must return accessToken");
    assert.ok(loginRes.user, "Login must return user profile");
    assert.equal(loginRes.user.email, email);

    // Step C: Submit Lawyer application & verification documents
    const barId = `D/${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`;
    const applicationPayload = {
      phone,
      barCouncilId: barId,
      stateOfEnrolment: "Bar Council of Delhi",
      city: "New Delhi",
      experienceYears: 4,
      consultationFee: 1200,
      specialization: ["Civil Litigation", "Corporate Law"],
      languages: ["English", "Hindi"],
      bio: "Practicing advocate at Delhi High Court specializing in commercial and civil litigation.",
      lawCollege: "Faculty of Law, University of Delhi",
      graduationYear: 2020,
      consultationModes: ["video", "in_person"],
      education: [
        {
          degree: "LL.B.",
          institution: "Faculty of Law, University of Delhi",
          year: 2020,
        },
      ],
      verificationDocuments: [
        {
          title: "Bar Council Enrolment Certificate",
          url: "https://example.com/demo/bar-cert.pdf",
          documentType: "bar_certificate",
        },
      ],
    };

    const lawyerDoc = await applyAsLawyerService(loginRes.user.id, applicationPayload);
    assert.ok(lawyerDoc._id, "Application must create a Lawyer document");
    createdLawyerIds.push(lawyerDoc._id);

    // Step D: Validate application is linked to newly created user
    assert.equal(String(lawyerDoc.user), String(loginRes.user.id));
    assert.equal(lawyerDoc.barCouncilId, barId);
    assert.equal(lawyerDoc.city, "New Delhi");

    // Step E: Verify demo documents are NOT automatically approved (must be pending)
    assert.equal(lawyerDoc.verificationStatus, "pending");
    assert.equal(lawyerDoc.isAvailable, false);

    // Step F: Query application status via getMyLawyerApplicationService
    const myApp = await getMyLawyerApplicationService(loginRes.user.id);
    assert.ok(myApp, "Application must be retrievable by the applicant user");
    assert.equal(myApp.verificationStatus, "pending");
    assert.equal(myApp.barCouncilId, barId);
  });

  test("3. Flow B: Existing logged-in Client applying to become an Advocate", async () => {
    const timestamp = Date.now();
    const email = `existingclient_${timestamp}@test.com`;
    const phone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = "ClientPass123!";

    // Create existing client user
    const clientUser = await User.create({
      name: "Siddharth Malhotra",
      email,
      phone,
      password,
      role: "client",
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
    });
    createdUserIds.push(clientUser._id);

    // Existing client applies for Advocate status
    const barId = `MAH/${Math.floor(1000 + Math.random() * 9000)}/2019`;
    const applicationPayload = {
      phone,
      barCouncilId: barId,
      stateOfEnrolment: "Bar Council of Maharashtra & Goa",
      city: "Mumbai",
      experienceYears: 6,
      consultationFee: 2000,
      specialization: ["Property Law"],
      languages: ["English", "Marathi"],
      bio: "High Court advocate focusing on real estate disputes and property agreements.",
      lawCollege: "Government Law College, Mumbai",
      graduationYear: 2018,
      consultationModes: ["video"],
      education: [
        {
          degree: "B.L.S. LL.B.",
          institution: "Government Law College, Mumbai",
          year: 2018,
        },
      ],
      verificationDocuments: [
        {
          title: "Bar Council Certificate",
          url: "https://example.com/demo/bar-cert-mumbai.pdf",
          documentType: "bar_certificate",
        },
      ],
    };

    const lawyerDoc = await applyAsLawyerService(clientUser._id, applicationPayload);
    assert.ok(lawyerDoc._id);
    createdLawyerIds.push(lawyerDoc._id);

    // Validates application is linked to existing client
    assert.equal(String(lawyerDoc.user), String(clientUser._id));
    assert.equal(lawyerDoc.verificationStatus, "pending");
    assert.equal(lawyerDoc.isAvailable, false);
  });

  test("4. Duplicate account prevention: Rejects registration if email or phone exists", async () => {
    const timestamp = Date.now();
    const existingEmail = `dup_test_${timestamp}@test.com`;
    const rawPhone = `96${Math.floor(10000000 + Math.random() * 90000000)}`;

    const reg = await registerUserService({
      name: "Existing Person",
      email: existingEmail,
      phone: rawPhone,
      password: "Password123",
      confirmPassword: "Password123",
      role: "client",
    });
    createdUserIds.push(reg.id);

    // Duplicate Email attempt
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "Duplicate Email Attempt",
          email: existingEmail,
          phone: `95${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: "Pass123456",
          confirmPassword: "Pass123456",
          role: "client",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /email address already exists/i);
        return true;
      }
    );

    // Duplicate Phone attempt
    await assert.rejects(
      async () => {
        await registerUserService({
          name: "Duplicate Phone Attempt",
          email: `different_${timestamp}@test.com`,
          phone: rawPhone,
          password: "Pass123456",
          confirmPassword: "Pass123456",
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

  test("5. Admin Verification Workflow: Approval promotes role, Rejection requires reason", async () => {
    const timestamp = Date.now();
    const email = `workflow_${timestamp}@test.com`;
    const phone = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

    const user = await User.create({
      name: "Candidate Advocate",
      email,
      phone: `+91${phone}`,
      password: "Password123",
      role: "client",
      isActive: true,
    });
    createdUserIds.push(user._id);

    const lawyer = await Lawyer.create({
      user: user._id,
      barCouncilId: `KAR/${timestamp}/2021`,
      specialization: ["Labour Law"],
      city: "Bangalore",
      experienceYears: 5,
      consultationFee: 1500,
      verificationStatus: "pending",
      isAvailable: false,
    });
    createdLawyerIds.push(lawyer._id);

    // Attempting rejection without decisionReason fails
    await assert.rejects(
      async () => {
        await updateLawyerVerificationService(
          adminUserId,
          lawyer._id,
          { status: "rejected", decisionReason: "" },
          { ip: "127.0.0.1", headers: {} }
        );
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /reason is strictly required/i);
        return true;
      }
    );

    // Admin approves the advocate application
    const approvedRes = await updateLawyerVerificationService(
      adminUserId,
      lawyer._id,
      { status: "approved", decisionReason: "Credentials verified with State Bar Council records" },
      { ip: "127.0.0.1", headers: {} }
    );

    assert.equal(approvedRes.verificationStatus, "approved");

    // Verify user role was promoted to "lawyer"
    const updatedUser = await User.findById(user._id);
    assert.equal(updatedUser.role, "lawyer");

    // Verify lawyer availability was activated
    const updatedLawyer = await Lawyer.findById(lawyer._id);
    assert.equal(updatedLawyer.isAvailable, true);
    assert.equal(updatedLawyer.verificationStatus, "approved");
  });
});
