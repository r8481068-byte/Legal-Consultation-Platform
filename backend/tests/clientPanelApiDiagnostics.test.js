const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const LawyerAvailability = require("../src/models/LawyerAvailability");
const Appointment = require("../src/models/Appointment");
const {
  getUserProfileService,
  changePasswordService,
} = require("../src/services/authService");
const { searchLawyers } = require("../src/controllers/lawyerController");
const { getMyAppointments } = require("../src/controllers/appointmentController");

const { connectTestDB, disconnectTestDB } = require("./helpers/testDb");

describe("Client Panel API Diagnostics & Verification", () => {
  let clientUser;
  let lawyerUser;
  let lawyerProfile;
  let slotDoc;
  let testAppointment;

  before(async () => {
    await connectTestDB();

    const stamp = Date.now() + "_" + Math.floor(Math.random() * 100000);

    // Clean up any stale records from previous interrupted runs
    await User.deleteMany({ email: { $in: [`client.${stamp}@example.com`, `advocate.${stamp}@example.com`] } });

    // Create client user
    clientUser = await User.create({
      name: `Diagnose Client ${stamp}`,
      email: `client.${stamp}@example.com`,
      password: "OriginalPassword123!",
      phone: "9123456789",
      role: "client",
      gender: "male",
      dob: new Date("1992-04-15"),
      state: "Maharashtra",
      district: "Mumbai City",
      cityVillage: "Mumbai",
      pincode: "400001",
      addressLine: "Flat 101, Marine Drive",
      aadhaarMasked: "XXXXXXXX1234",
      panMasked: "ABCDE1234F",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    // Create lawyer user and profile
    lawyerUser = await User.create({
      name: `Adv. Test Advocate ${stamp}`,
      email: `advocate.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543210",
      role: "lawyer",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    lawyerProfile = await Lawyer.create({
      user: lawyerUser._id,
      barCouncilId: `MAH/${stamp}/2020`,
      specialization: ["Criminal Law", "Civil Law"],
      experienceYears: 12,
      consultationFee: 1500,
      verificationStatus: "approved",
      isAvailable: true,
      city: "Mumbai",
      state: "Maharashtra",
      averageRating: 4.8,
      totalReviews: 5,
    });

    // Create availability slot
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
    slotDoc = await LawyerAvailability.create({
      lawyer: lawyerProfile._id,
      startAt,
      endAt,
      status: "booked",
    });

    // Create appointment
    testAppointment = await Appointment.create({
      client: clientUser._id,
      lawyer: lawyerProfile._id,
      slot: slotDoc._id,
      scheduledAt: startAt,
      durationMinutes: 30,
      consultationType: "video",
      status: "pending",
      notes: "Need consultation on urgent civil matter",
    });
  });

  after(async () => {
    if (testAppointment) await Appointment.deleteOne({ _id: testAppointment._id });
    if (slotDoc) await LawyerAvailability.deleteOne({ _id: slotDoc._id });
    if (lawyerProfile) await Lawyer.deleteOne({ _id: lawyerProfile._id });
    if (lawyerUser) await User.deleteOne({ _id: lawyerUser._id });
    if (clientUser) await User.deleteOne({ _id: clientUser._id });
    await disconnectTestDB();
  });

  // 1. Find Lawyer API returns actual lawyers
  test("1. Find Lawyer API returns actual approved lawyers from MongoDB", async () => {
    let responseData = null;
    const req = {
      query: {},
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await searchLawyers(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(responseData.success, true);
    assert.ok(Array.isArray(responseData.lawyers));
    assert.ok(responseData.lawyers.length > 0, "Should return at least one lawyer");

    const found = responseData.lawyers.find(
      (l) => l._id.toString() === lawyerProfile._id.toString()
    );
    assert.ok(found, "Created approved lawyer should be returned in list");
    assert.equal(found.verificationStatus, "approved");
  });

  // 2. Lawyer search works
  test("2. Lawyer search finds lawyer by name or specialization", async () => {
    let responseData = null;
    const req = {
      query: { search: "Test Advocate" },
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await searchLawyers(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.ok(responseData.lawyers.length >= 1);
    const match = responseData.lawyers.some(
      (l) => l._id.toString() === lawyerProfile._id.toString()
    );
    assert.ok(match, "Search for 'Test Advocate' should find the created lawyer");
  });

  // 3. Lawyer filters work
  test("3. Lawyer filters by specialization, city, and experience", async () => {
    let responseData = null;
    const req = {
      query: {
        specialization: "Criminal Law",
        city: "Mumbai",
        minExperience: "10",
      },
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await searchLawyers(req, res, () => {});

    assert.equal(res.statusCode, 200);
    const match = responseData.lawyers.some(
      (l) => l._id.toString() === lawyerProfile._id.toString()
    );
    assert.ok(match, "Filtering by Criminal Law and Mumbai should include lawyer");
  });

  // 4. My Appointments API returns the authenticated client's appointments
  test("4. My Appointments returns appointments for authenticated client only", async () => {
    let responseData = null;
    const req = {
      user: { userId: clientUser._id.toString(), role: "client" },
      query: {},
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await getMyAppointments(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(responseData.success, true);
    assert.ok(Array.isArray(responseData.appointments));
    const apt = responseData.appointments.find(
      (a) => a._id.toString() === testAppointment._id.toString()
    );
    assert.ok(apt, "Appointment belonging to client must be present");
  });

  // 5. Appointment counts are correct
  test("5. Appointment counts reflect actual records", async () => {
    let responseData = null;
    const req = {
      user: { userId: clientUser._id.toString(), role: "client" },
      query: {},
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await getMyAppointments(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.ok(responseData.count >= 1);
    assert.ok(responseData.appointments.length >= 1);

    const pending = responseData.appointments.filter((a) => a.status === "pending");
    assert.ok(pending.length >= 1, "Pending appointments count should be >= 1");
  });

  // 6. My Profile API returns the correct saved profile
  test("6. My Profile API returns saved client personal info, masked Aadhaar/PAN, and completeness", async () => {
    const profile = await getUserProfileService(clientUser._id);

    assert.equal(profile.name, clientUser.name);
    assert.equal(profile.email, clientUser.email);
    assert.equal(profile.phone, "9123456789");
    assert.equal(profile.gender, "male");
    assert.equal(profile.state, "Maharashtra");
    assert.equal(profile.district, "Mumbai City");
    assert.equal(profile.cityVillage, "Mumbai");
    assert.equal(profile.pincode, "400001");
    assert.equal(profile.aadhaarMasked, "XXXXXXXX1234");
    assert.equal(profile.panMasked, "ABCDE1234F");
    assert.equal(profile.aadhaarEncrypted, undefined, "Encrypted Aadhaar must never be exposed");
    assert.equal(profile.panEncrypted, undefined, "Encrypted PAN must never be exposed");
    assert.equal(profile.password, undefined, "Password must not be returned");
    assert.ok(profile.completeness.percentage >= 80);
  });

  // 7 & 8. Change Password works with correct current password & rejects incorrect password
  test("7. Change Password rejects incorrect current password", async () => {
    await assert.rejects(
      async () => {
        await changePasswordService(clientUser._id, {
          currentPassword: "WrongPassword999!",
          newPassword: "BrandNewPassword123!",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /Current password is incorrect/i);
        return true;
      }
    );
  });

  test("8. Change Password works with correct current password and updates hash", async () => {
    const result = await changePasswordService(clientUser._id, {
      currentPassword: "OriginalPassword123!",
      newPassword: "BrandNewPassword123!",
    });

    assert.equal(result.message, "Password updated successfully");

    // Verify user can be found and new password validates with bcrypt
    const updated = await User.findById(clientUser._id).select("+password");
    const isNewMatch = await bcrypt.compare("BrandNewPassword123!", updated.password);
    assert.equal(isNewMatch, true, "New password must match the hashed password in MongoDB");

    const isOldMatch = await bcrypt.compare("OriginalPassword123!", updated.password);
    assert.equal(isOldMatch, false, "Old password must no longer match");
  });
});
