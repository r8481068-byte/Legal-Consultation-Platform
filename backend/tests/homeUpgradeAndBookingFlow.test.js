const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const LawyerAvailability = require("../src/models/LawyerAvailability");
const Appointment = require("../src/models/Appointment");
const {
  updateUserProfileService,
  updateClientIdentityService,
} = require("../src/services/authService");
const {
  checkBookingEligibility,
} = require("../src/services/eligibilityService");
const {
  bookAppointmentService,
} = require("../src/services/appointmentService");
const {
  searchLawyersService,
  getLawyerByIdService,
} = require("../src/services/lawyerService");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("Home Page Upgrade & Booking Eligibility Flow Verification", () => {
  let incompleteClient;
  let completeClient;
  let lawyerUser;
  let lawyerDoc;
  let slotDoc1;
  let slotDoc2;
  let bookedAppointment;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const stamp = Date.now();

    // 1. Incomplete Client User (only basic registration info, no address or identity)
    incompleteClient = await User.create({
      name: `Incomplete Client ${stamp}`,
      email: `incomplete.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543220",
      role: "client",
      isActive: true,
    });

    // 2. Complete Client User (100% address + identity documents)
    completeClient = await User.create({
      name: `Complete Client ${stamp}`,
      email: `complete.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543221",
      role: "client",
      gender: "female",
      dob: new Date("1994-06-20"),
      state: "Delhi NCR",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      locality: "Green Park Extension",
      cityVillage: "New Delhi",
      pincode: "110016",
      addressLine: "Flat 101, Nilgiri Apartments",
      aadhaarMasked: "XXXXXXXX9988",
      panMasked: "ABCDE9988F",
      isActive: true,
    });

    // 3. Approved Lawyer
    lawyerUser = await User.create({
      name: `Adv. Verified Counsel ${stamp}`,
      email: `counsel.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543222",
      role: "lawyer",
      isActive: true,
    });

    lawyerDoc = await Lawyer.create({
      user: lawyerUser._id,
      barCouncilId: `D/${stamp}/2015`,
      specialization: ["Corporate Law", "Arbitration"],
      experienceYears: 10,
      consultationFee: 2000,
      city: "New Delhi",
      state: "Delhi",
      verificationStatus: "approved",
      isAvailable: true,
      averageRating: 4.9,
      totalReviews: 8,
    });

    // 4. Time slots
    const start1 = new Date(Date.now() + 86400000 * 3);
    const end1 = new Date(start1.getTime() + 30 * 60 * 1000);
    slotDoc1 = await LawyerAvailability.create({
      lawyer: lawyerDoc._id,
      startAt: start1,
      endAt: end1,
      status: "available",
    });

    const start2 = new Date(Date.now() + 86400000 * 4);
    const end2 = new Date(start2.getTime() + 30 * 60 * 1000);
    slotDoc2 = await LawyerAvailability.create({
      lawyer: lawyerDoc._id,
      startAt: start2,
      endAt: end2,
      status: "available",
    });
  });

  after(async () => {
    if (bookedAppointment) await Appointment.deleteOne({ _id: bookedAppointment._id });
    if (slotDoc1) await LawyerAvailability.deleteOne({ _id: slotDoc1._id });
    if (slotDoc2) await LawyerAvailability.deleteOne({ _id: slotDoc2._id });
    if (lawyerDoc) await Lawyer.deleteOne({ _id: lawyerDoc._id });
    if (lawyerUser) await User.deleteOne({ _id: lawyerUser._id });
    if (incompleteClient) await User.deleteOne({ _id: incompleteClient._id });
    if (completeClient) await User.deleteOne({ _id: completeClient._id });
    await mongoose.disconnect();
  });

  test("1. Lawyer discovery search and filters work on backend", async () => {
    const results = await searchLawyersService({
      search: "Verified Counsel",
      specialization: "Corporate Law",
      city: "New Delhi",
      minExperience: "5",
    });

    assert.ok(Array.isArray(results.lawyers));
    assert.ok(results.lawyers.length >= 1);
    const match = results.lawyers.find((l) => l._id.toString() === lawyerDoc._id.toString());
    assert.ok(match, "Created lawyer should be discoverable by search & filters");
    assert.equal(match.verificationStatus, "approved");
    assert.equal(match.user.name, lawyerUser.name);
  });

  test("2. Public lawyer profile viewing returns complete professional details", async () => {
    const profile = await getLawyerByIdService(lawyerDoc._id.toString());
    assert.ok(profile);
    assert.equal(profile._id.toString(), lawyerDoc._id.toString());
    assert.equal(profile.user.name, lawyerUser.name);
    assert.equal(profile.consultationFee, 2000);
    assert.ok(profile.specialization.includes("Corporate Law"));
  });

  test("3. Client with incomplete profile has booking eligibility rejected with clear message", async () => {
    const eligibility = await checkBookingEligibility(incompleteClient._id);
    assert.equal(eligibility.eligible, false);
    assert.equal(eligibility.checks.profileCompleted, false);
    assert.ok(eligibility.checks.missingProfileLabels.length > 0);
    assert.ok(
      eligibility.reasons.some((r) =>
        r.includes("Please complete your client profile to 100% before booking a consultation")
      )
    );
  });

  test("4. Backend rejects direct booking attempt by incomplete client with HTTP 403", async () => {
    await assert.rejects(
      async () => {
        await bookAppointmentService(incompleteClient._id, {
          slotId: slotDoc1._id,
          consultationType: "video",
          notes: "Attempting to book with incomplete profile",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "BOOKING_INELIGIBLE");
        assert.match(
          err.message,
          /Please complete your client profile to 100% before booking a consultation/i
        );
        return true;
      }
    );
  });

  test("5. Client with 100% completed profile is eligible and can book appointment", async () => {
    const eligibility = await checkBookingEligibility(completeClient._id);
    assert.equal(eligibility.eligible, true);
    assert.equal(eligibility.checks.profileCompleted, true);
    assert.equal(eligibility.checks.identityCompleted, true);

    // Now book appointment with eligible client
    bookedAppointment = await bookAppointmentService(completeClient._id, {
      slotId: slotDoc1._id,
      consultationType: "video",
      notes: "Commercial contract review consultation",
    });

    assert.ok(bookedAppointment);
    assert.equal(bookedAppointment.client.toString(), completeClient._id.toString());
    assert.equal(bookedAppointment.lawyer.toString(), lawyerDoc._id.toString());
    assert.equal(bookedAppointment.status, "pending");

    // Verify slot status was updated to booked
    const updatedSlot = await LawyerAvailability.findById(slotDoc1._id);
    assert.equal(updatedSlot.status, "booked");
  });
});
