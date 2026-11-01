/**
 * Client Panel Upgrade Integration & Security Test Suite
 *
 * Validates:
 * 1. Client profile update with About Me, Gender, Date of Birth, Name, Phone, and Profile Image
 * 2. Identity data protection: Aadhaar and PAN masked tokens; encrypted fields protected at rest
 * 3. Client appointments retrieval: Populates lawyer with headline, bio, averageRating, totalReviews, experienceYears
 * 4. Authorization: Role-based protections and user ownership
 * 5. Appointment cancellation enforcement rules
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const Appointment = require("../src/models/Appointment");
const LawyerAvailability = require("../src/models/LawyerAvailability");

const {
  updateUserProfileService,
  getUserProfileService,
  updateClientAddressService,
  updateClientIdentityService,
} = require("../src/services/authService");

const {
  getMyAppointmentsService,
  cancelAppointmentService,
} = require("../src/services/appointmentService");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("Client Panel Upgrade Test Suite", () => {
  let clientUser;
  let anotherClientUser;
  let lawyerUser;
  let lawyerDoc;
  let slotDoc;
  let appointmentDoc;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const stamp = Date.now();

    // Create client user
    clientUser = await User.create({
      name: `Client Tester ${stamp}`,
      email: `client.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543210",
      role: "client",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    // Create another client user for ownership checks
    anotherClientUser = await User.create({
      name: `Other Client ${stamp}`,
      email: `other.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543211",
      role: "client",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    // Create lawyer user and profile
    lawyerUser = await User.create({
      name: `Adv. Supreme Lawyer ${stamp}`,
      email: `lawyer.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543212",
      role: "lawyer",
      profileImage: "https://example.com/lawyer-avatar.jpg",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    lawyerDoc = await Lawyer.create({
      user: lawyerUser._id,
      headline: "Senior High Court Counsel & Corporate Specialist",
      designation: "Advocate",
      bio: "Practicing advocate with over 12 years of experience in corporate litigation and constitutional writ petitions.",
      specialization: ["Corporate & Startup Law", "Civil Litigation"],
      experienceYears: 12,
      consultationFee: 2500,
      city: "New Delhi",
      state: "Delhi",
      barCouncilId: `D/${stamp}/2012`,
      verificationStatus: "approved",
      averageRating: 4.9,
      totalReviews: 24,
      education: [
        {
          degree: "LL.B.",
          institution: "Faculty of Law, Delhi University",
          year: 2012,
        },
      ],
    });

    // Create availability slot
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    slotDoc = await LawyerAvailability.create({
      lawyer: lawyerDoc._id,
      startAt,
      endAt,
      status: "booked",
    });

    // Create appointment
    appointmentDoc = await Appointment.create({
      client: clientUser._id,
      lawyer: lawyerDoc._id,
      slot: slotDoc._id,
      scheduledAt: startAt,
      durationMinutes: 30,
      consultationType: "video",
      notes: "Need guidance on corporate shareholder agreement.",
      status: "pending",
    });
  });

  after(async () => {
    // Cleanup created test records
    if (clientUser) await User.deleteOne({ _id: clientUser._id });
    if (anotherClientUser) await User.deleteOne({ _id: anotherClientUser._id });
    if (lawyerUser) await User.deleteOne({ _id: lawyerUser._id });
    if (lawyerDoc) await Lawyer.deleteOne({ _id: lawyerDoc._id });
    if (slotDoc) await LawyerAvailability.deleteOne({ _id: slotDoc._id });
    if (appointmentDoc) await Appointment.deleteOne({ _id: appointmentDoc._id });
    await mongoose.disconnect();
  });

  test("1. Client updates About Me, Gender, Date of Birth, and Profile Image", async () => {
    const updated = await updateUserProfileService(clientUser._id, {
      name: "Updated Client Name",
      about: "I am a startup founder looking for commercial contract advisory.",
      gender: "female",
      dob: "1994-08-15",
      profileImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    });

    assert.equal(updated.name, "Updated Client Name");
    assert.equal(
      updated.about,
      "I am a startup founder looking for commercial contract advisory."
    );
    assert.equal(updated.gender, "female");
    assert.ok(updated.dob instanceof Date);
    assert.ok(updated.profileImage.startsWith("data:image/png"));

    // Role cannot be updated via profile
    assert.equal(updated.role, "client");
  });

  test("2. Client Address and Postal PIN Code updates accurately", async () => {
    const addressResult = await updateClientAddressService(clientUser._id, {
      state: "Maharashtra",
      district: "Mumbai",
      subDistrict: "Mumbai Suburban",
      locality: "Bandra West",
      cityVillage: "Mumbai",
      pincode: "400050",
      addressLine: "Flat 402, Sea View Apartments, Hill Road",
    });

    assert.equal(addressResult.user.state, "Maharashtra");
    assert.equal(addressResult.user.district, "Mumbai");
    assert.equal(addressResult.user.cityVillage, "Mumbai");
    assert.equal(addressResult.user.pincode, "400050");
    assert.equal(addressResult.completeness.isComplete, true);
  });

  test("3. Sensitive Identity details are masked and encrypted; never exposed raw", async () => {
    const res = await updateClientIdentityService(clientUser._id, {
      aadhaar: "987654321098",
      pan: "ABCDE1234F",
    });

    assert.equal(res.success, true);
    assert.equal(res.identityStatus.aadhaarMasked, "XXXX-XXXX-1098");
    assert.equal(res.identityStatus.panMasked, "XXXXX1234F");

    // Query user profile directly and ensure sensitive encrypted fields are not selected
    const profile = await getUserProfileService(clientUser._id);
    assert.equal(profile.aadhaarMasked, "XXXX-XXXX-1098");
    assert.equal(profile.panMasked, "XXXXX1234F");
    assert.equal(profile.aadhaarEncrypted, undefined);
    assert.equal(profile.panEncrypted, undefined);
    assert.equal(profile.password, undefined);
  });

  test("4. Client Appointments retrieve full lawyer info: headline, bio, rating, reviews, experience, user photo", async () => {
    const appointments = await getMyAppointmentsService(clientUser._id);
    assert.ok(Array.isArray(appointments));
    assert.equal(appointments.length, 1);

    const appt = appointments[0];
    assert.equal(appt.consultationType, "video");
    assert.equal(appt.status, "pending");

    // Verify populated lawyer fields
    assert.ok(appt.lawyer);
    assert.equal(appt.lawyer.headline, "Senior High Court Counsel & Corporate Specialist");
    assert.ok(appt.lawyer.bio.includes("Practicing advocate"));
    assert.equal(appt.lawyer.experienceYears, 12);
    assert.equal(appt.lawyer.consultationFee, 2500);
    assert.equal(appt.lawyer.averageRating, 4.9);
    assert.equal(appt.lawyer.totalReviews, 24);

    // Verify populated lawyer user
    assert.ok(appt.lawyer.user);
    assert.ok(appt.lawyer.user.name.includes("Supreme Lawyer"));
    assert.equal(appt.lawyer.user.profileImage, "https://example.com/lawyer-avatar.jpg");
  });

  test("5. Client can cancel their own pending appointment; cannot cancel other's appointment", async () => {
    // Other client cannot cancel this client's appointment
    await assert.rejects(
      async () => {
        await cancelAppointmentService(anotherClientUser._id, appointmentDoc._id);
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        return true;
      }
    );

    // Legitimate client cancels their own pending appointment
    const cancelled = await cancelAppointmentService(clientUser._id, appointmentDoc._id);
    assert.equal(cancelled.status, "cancelled");

    // Slot is restored to available
    const slotAfterCancel = await LawyerAvailability.findById(slotDoc._id);
    assert.equal(slotAfterCancel.status, "available");
  });
});
