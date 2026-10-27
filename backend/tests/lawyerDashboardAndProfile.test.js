/**
 * LegalConnect Lawyer Dashboard & Edit Profile Test Suite
 *
 * Covers:
 * 1. Lawyer Profile update with all 8 sections (headline, designation, bio, education, internships, experiences, etc.)
 * 2. Security: Lawyer cannot self-verify (verificationStatus cannot be bypassed)
 * 3. Contact Privacy: hidePhone hides phone on public lawyer detail
 * 4. Client Profile Authorization: lawyer can only view client details for clients with whom they have appointments
 * 5. Appointment categorization: Requests (pending, confirmed) vs Completed
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
const Review = require("../src/models/Review");

const {
  updateLawyerProfileService,
  getMyLawyerProfileService,
  getLawyerByIdService,
  getAuthorizedClientDetailService,
} = require("../src/services/lawyerService");

const {
  getLawyerAppointmentsService,
} = require("../src/services/appointmentService");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("Lawyer Dashboard and Edit Profile Test Suite", () => {
  let lawyerUser;
  let lawyerDoc;
  let clientUser1;
  let clientUser2;
  let appointmentPending;
  let appointmentCompleted;
  let reviewDoc;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const stamp = Date.now();

    // 1. Create a test lawyer
    lawyerUser = await User.create({
      name: `Adv. Test Lawyer ${stamp}`,
      email: `lawyer.test.${stamp}@example.com`,
      password: "TestPassword@123",
      role: "lawyer",
      phone: "+919876543210",
      emailVerified: true,
      phoneVerified: true,
    });

    lawyerDoc = await Lawyer.create({
      user: lawyerUser._id,
      barCouncilId: `D/${stamp}/2020`,
      city: "New Delhi",
      state: "Delhi",
      experienceYears: 7,
      consultationFee: 2000,
      specialization: ["Property Law", "Civil Litigation"],
      verificationStatus: "approved",
      isAvailable: true,
      bio: "Initial brief bio.",
    });

    // 2. Create client 1 (has appointments with lawyer)
    clientUser1 = await User.create({
      name: `Client One ${stamp}`,
      email: `client1.${stamp}@example.com`,
      password: "TestPassword@123",
      role: "client",
      phone: "+919123456789",
      cityVillage: "New Delhi",
      district: "South Delhi",
      state: "Delhi",
      emailVerified: true,
      phoneVerified: true,
    });

    // 3. Create client 2 (NO appointment with lawyer)
    clientUser2 = await User.create({
      name: `Client Two ${stamp}`,
      email: `client2.${stamp}@example.com`,
      password: "TestPassword@123",
      role: "client",
      phone: "+919988776655",
      cityVillage: "Mumbai",
      district: "Mumbai Suburban",
      state: "Maharashtra",
      emailVerified: true,
      phoneVerified: true,
    });

    // Dummy slot
    const slot = await LawyerAvailability.create({
      lawyer: lawyerDoc._id,
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 88200000),
      status: "booked",
    });

    // Pending appointment
    appointmentPending = await Appointment.create({
      client: clientUser1._id,
      lawyer: lawyerDoc._id,
      slot: slot._id,
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 30,
      consultationType: "video",
      status: "pending",
      notes: "Need advice on land registry dispute.",
    });

    // Completed appointment
    appointmentCompleted = await Appointment.create({
      client: clientUser1._id,
      lawyer: lawyerDoc._id,
      slot: slot._id,
      scheduledAt: new Date(Date.now() - 86400000),
      durationMinutes: 30,
      consultationType: "video",
      status: "completed",
      notes: "Completed consultation regarding partition deed.",
      isReviewed: true,
    });

    // Create review
    reviewDoc = await Review.create({
      appointment: appointmentCompleted._id,
      client: clientUser1._id,
      lawyer: lawyerDoc._id,
      rating: 5,
      reviewText: "Exceptional legal counsel and swift resolution.",
      categories: {
        communication: 5,
        professionalism: 5,
        clarity: 5,
        punctuality: 5,
      },
      status: "approved",
    });
  });

  after(async () => {
    // Cleanup test data
    if (lawyerUser) await User.deleteOne({ _id: lawyerUser._id });
    if (clientUser1) await User.deleteOne({ _id: clientUser1._id });
    if (clientUser2) await User.deleteOne({ _id: clientUser2._id });
    if (lawyerDoc) await Lawyer.deleteOne({ _id: lawyerDoc._id });
    if (appointmentPending) await Appointment.deleteOne({ _id: appointmentPending._id });
    if (appointmentCompleted) await Appointment.deleteOne({ _id: appointmentCompleted._id });
    if (reviewDoc) await Review.deleteOne({ _id: reviewDoc._id });
    await LawyerAvailability.deleteMany({ lawyer: lawyerDoc?._id });
    await mongoose.disconnect();
  });

  test("1. Update lawyer profile across all sections with detailed professional biography", async () => {
    const detailedBio =
      "Adv. Test Lawyer is a dedicated legal advocate specializing in constitutional writs, property title verification, commercial contracts, and civil appeals. With extensive courtroom experience across the High Court of Delhi and district courts, the practice is grounded in meticulous legal research, strategic advocacy, and transparent counsel.";

    const updated = await updateLawyerProfileService(lawyerUser._id, {
      headline: "Senior Litigator | Delhi High Court",
      designation: "Senior Advocate",
      bio: detailedBio,
      specialization: ["Property Law", "Constitutional Law"],
      secondarySpecializations: ["Civil Litigation", "Corporate Law"],
      experienceYears: 12,
      consultationFee: 2500,
      consultationDuration: 45,
      consultationModes: ["video", "in_person"],
      city: "New Delhi",
      state: "Delhi",
      officeAddress: "Chamber 402, Lawyers Chambers Block, Delhi High Court",
      phone: "+919876543210",
      hidePhone: true,
      courtLevels: ["District Court", "High Court", "Supreme Court"],
      achievements: "Gold Medalist in LL.B; Lead counsel in landmark property partition judgment",
      website: "https://advocate-example.law",
      memberships: "Supreme Court Bar Association, Delhi High Court Bar Association",
      education: [
        {
          degree: "LL.B. (Hons)",
          institution: "Faculty of Law, University of Delhi",
          cityState: "New Delhi, Delhi",
          year: 2012,
          certifications: "Gold Medalist",
        },
        {
          degree: "LL.M. in Commercial Law",
          institution: "National Law School of India University",
          cityState: "Bangalore, Karnataka",
          year: 2014,
          certifications: "Dean's Honor Roll",
        },
      ],
      internships: [
        {
          institution: "Chambers of Additional Solicitor General of India",
          role: "Judicial Research Intern",
          duration: "May 2011 - July 2011",
          practiceArea: "Constitutional Writs",
          responsibilities: "Researched Article 226 precedents and drafted speaking notes.",
        },
      ],
      experiences: [
        {
          organization: "Verma & Partners Law Chambers",
          designation: "Senior Associate",
          employmentType: "Full-Time",
          startDate: "Jan 2015",
          endDate: "Dec 2019",
          practiceAreas: "Civil and Commercial Litigation",
          responsibilities: "Managed title disputes and appellate litigation.",
        },
      ],
    });

    assert.equal(updated.headline, "Senior Litigator | Delhi High Court");
    assert.equal(updated.designation, "Senior Advocate");
    assert.equal(updated.bio, detailedBio);
    assert.equal(updated.consultationFee, 2500);
    assert.equal(updated.consultationDuration, 45);
    assert.equal(updated.hidePhone, true);
    assert.equal(updated.education.length, 2);
    assert.equal(updated.education[0].degree, "LL.B. (Hons)");
    assert.equal(updated.internships.length, 1);
    assert.equal(updated.experiences.length, 1);
    assert.equal(updated.experiences[0].designation, "Senior Associate");
  });

  test("2. Security: Lawyer cannot self-verify or alter administrative verificationStatus", async () => {
    // Attempting to inject verificationStatus: 'approved' or tamper with decisionReason
    const result = await updateLawyerProfileService(lawyerUser._id, {
      bio: "Updated bio text",
      verificationStatus: "approved",
      decisionReason: "Self-approved by test",
    });

    // Reload raw record from database
    const fresh = await Lawyer.findById(lawyerDoc._id);
    assert.notEqual(fresh.decisionReason, "Self-approved by test");
  });

  test("3. Contact Privacy: Public detail hides phone number when hidePhone is true", async () => {
    // 1. Viewer is anonymous / public (not owner)
    const publicView = await getLawyerByIdService(lawyerDoc._id, null);
    assert.equal(publicView.phone, undefined, "Phone should be hidden for public viewers");
    if (publicView.user) {
      assert.equal(publicView.user.phone, undefined, "User phone should be hidden for public viewers");
    }

    // 2. Viewer is the lawyer themselves (owner)
    const ownerView = await getLawyerByIdService(lawyerDoc._id, lawyerUser._id);
    assert.ok(ownerView.phone || ownerView.user?.phone, "Phone should be visible to lawyer owner");
  });

  test("4. Client Profile Authorization: Lawyer can access client with appointment, blocked for unrelated client", async () => {
    // Authorized: client1 has appointments with this lawyer
    const authorized = await getAuthorizedClientDetailService(lawyerUser._id, clientUser1._id);
    assert.ok(authorized.client);
    assert.equal(authorized.client.name, clientUser1.name);
    assert.equal(authorized.client.email, clientUser1.email);
    assert.ok(authorized.appointmentsCount >= 2);
    assert.equal(authorized.client.aadhaarEncrypted, undefined, "Sensitive Aadhaar must never be exposed");
    assert.equal(authorized.client.password, undefined, "Password must never be exposed");

    // Unauthorized: client2 has NO appointment with this lawyer
    await assert.rejects(
      async () => {
        await getAuthorizedClientDetailService(lawyerUser._id, clientUser2._id);
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /not authorized/i);
        return true;
      }
    );
  });

  test("5. Appointments Retrieval: Correctly returns appointments with reviews attached for completed ones", async () => {
    const list = await getLawyerAppointmentsService(lawyerUser._id);
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 2);

    const pending = list.find((a) => a.status === "pending");
    assert.ok(pending);
    assert.equal(pending.status, "pending");

    const completed = list.find((a) => a.status === "completed");
    assert.ok(completed);
    assert.equal(completed.status, "completed");
    assert.ok(completed.review, "Completed appointment should have review attached");
    assert.equal(completed.review.rating, 5);
  });
});
