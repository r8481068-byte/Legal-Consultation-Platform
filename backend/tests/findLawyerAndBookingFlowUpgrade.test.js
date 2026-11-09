const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const LawyerAvailability = require("../src/models/LawyerAvailability");
const Appointment = require("../src/models/Appointment");
const Review = require("../src/models/Review");
const {
  updateLawyerProfileService,
  searchLawyersService,
  getLawyerByIdService,
} = require("../src/services/lawyerService");
const {
  bookAppointmentService,
} = require("../src/services/appointmentService");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("Find Lawyer, Public Profile & Appointment Booking Upgrade Suite", () => {
  let incompleteClient;
  let completeClient;
  let seniorLawyerUser;
  let seniorLawyerDoc;
  let juniorLawyerUser;
  let juniorLawyerDoc;
  let configuredSlot;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const stamp = Date.now();

    // 1. Incomplete Client (missing address and identity)
    incompleteClient = await User.create({
      name: `Incomplete User ${stamp}`,
      email: `incomplete.${stamp}@test.com`,
      password: "Password123!",
      phone: "9811122233",
      role: "client",
      isActive: true,
    });

    // 2. Complete Client (100% complete: personal, full address + PIN, Aadhaar & PAN)
    completeClient = await User.create({
      name: `Complete User ${stamp}`,
      email: `complete.${stamp}@test.com`,
      password: "Password123!",
      phone: "9811122234",
      role: "client",
      gender: "male",
      dob: new Date("1992-04-15"),
      state: "Maharashtra",
      district: "Mumbai Suburban",
      subDistrict: "Bandra",
      locality: "Bandra West",
      cityVillage: "Mumbai",
      pincode: "400050",
      addressLine: "Flat 4B, Hill Road Apartments",
      aadhaarMasked: "XXXXXXXX1234",
      panMasked: "ABCDE1234F",
      isActive: true,
    });

    // 3. Senior Advocate (Corporate & Arbitration, 15 yrs, 3500 fee, Mumbai)
    seniorLawyerUser = await User.create({
      name: `Adv. Vikramaditya Singhania ${stamp}`,
      email: `vikram.${stamp}@firm.com`,
      password: "Password123!",
      phone: "9822233344",
      role: "lawyer",
      isActive: true,
      profileImage: "https://example.com/vikram.jpg",
    });

    seniorLawyerDoc = await Lawyer.create({
      user: seniorLawyerUser._id,
      barCouncilId: `MAH/${stamp}/2009`,
      specialization: ["Corporate Law", "Arbitration"],
      experienceYears: 15,
      consultationFee: 3500,
      city: "Mumbai",
      state: "Maharashtra",
      bio: "Senior corporate strategist and high-stakes arbitration specialist.",
      verificationStatus: "approved",
      isAvailable: true,
      averageRating: 4.8,
      totalReviews: 12,
      education: [
        {
          degree: "LL.B. (Hons)",
          institution: "National Law School of India University",
          year: 2008,
        },
        {
          degree: "LL.M. in Corporate Law",
          institution: "University of Cambridge",
          year: 2010,
        },
      ],
      internships: [
        {
          organization: "Amarchand Mangaldas",
          role: "Senior Associate",
          duration: "2010 - 2016",
          description: "Led cross-border mergers and joint venture negotiations.",
        },
      ],
      awards: [
        {
          name: "Arbitrator of the Year",
          organization: "Indian Arbitration Bar",
          year: 2022,
          description: "Recognized for excellence in international commercial arbitration.",
        },
      ],
    });

    // 4. Junior Advocate (Family & Criminal Law, 4 yrs, 1200 fee, Pune)
    juniorLawyerUser = await User.create({
      name: `Adv. Ananya Sharma ${stamp}`,
      email: `ananya.${stamp}@chambers.com`,
      password: "Password123!",
      phone: "9833344455",
      role: "lawyer",
      isActive: true,
      profileImage: "https://example.com/ananya.jpg",
    });

    juniorLawyerDoc = await Lawyer.create({
      user: juniorLawyerUser._id,
      barCouncilId: `MAH/${stamp}/2020`,
      specialization: ["Family Law", "Criminal Law"],
      experienceYears: 4,
      consultationFee: 1200,
      city: "Pune",
      state: "Maharashtra",
      bio: "Advocate focusing on domestic relations, mediation, and trial defense.",
      verificationStatus: "approved",
      isAvailable: true,
      averageRating: 4.3,
      totalReviews: 5,
    });

    // Configured slot for senior advocate
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(14, 0, 0, 0);

    const slotEnd = new Date(tomorrow);
    slotEnd.setHours(15, 0, 0, 0);

    configuredSlot = await LawyerAvailability.create({
      lawyer: seniorLawyerDoc._id,
      startAt: tomorrow,
      endAt: slotEnd,
      status: "available",
    });
  });

  after(async () => {
    // Cleanup created records
    const userIds = [
      incompleteClient._id,
      completeClient._id,
      seniorLawyerUser._id,
      juniorLawyerUser._id,
    ];
    await User.deleteMany({ _id: { $in: userIds } });
    await Lawyer.deleteMany({ _id: { $in: [seniorLawyerDoc._id, juniorLawyerDoc._id] } });
    await LawyerAvailability.deleteMany({ lawyer: seniorLawyerDoc._id });
    await Appointment.deleteMany({ client: { $in: [incompleteClient._id, completeClient._id] } });
  });

  // =========================================================================
  // SCENARIO 1 & 2: Available Advocates & Search / Filter Combinations
  // =========================================================================

  test("1. Available Advocates listing returns dynamic lawyer account data", async () => {
    const results = await searchLawyersService({
      location: "Mumbai",
    });

    const seniorFound = results.lawyers.find(
      (l) => l._id.toString() === seniorLawyerDoc._id.toString()
    );
    assert.ok(seniorFound, "Senior lawyer should appear in Mumbai search results");
    assert.equal(seniorFound.user.name, seniorLawyerUser.name);
    assert.equal(seniorFound.user.profileImage, "https://example.com/vikram.jpg");
    assert.equal(seniorFound.experienceYears, 15);
    assert.equal(seniorFound.consultationFee, 3500);
    assert.equal(seniorFound.verificationStatus, "approved");
    assert.equal(seniorFound.averageRating, 4.8);
    assert.equal(seniorFound.totalReviews, 12);
  });

  test("2. Combined Filters: name search works with lawyer name", async () => {
    const results = await searchLawyersService({
      name: "Vikramaditya",
    });

    assert.ok(results.lawyers.length >= 1, "Should find lawyer by first/last name");
    assert.equal(
      results.lawyers[0]._id.toString(),
      seniorLawyerDoc._id.toString()
    );
  });

  test("3. Combined Filters: specialization, fee range, and experience filters", async () => {
    // Search with multiple filters combined: Corporate Law, fee between 2000-4000, experience >= 10
    const results = await searchLawyersService({
      specialization: "Corporate Law",
      minExperience: 10,
      maxFee: 4000,
      minFee: 2000,
    });

    assert.ok(results.lawyers.length >= 1);
    const found = results.lawyers.find(
      (l) => l._id.toString() === seniorLawyerDoc._id.toString()
    );
    assert.ok(found, "Senior lawyer meets all combined filter criteria");

    // Junior lawyer should NOT match because specialization and experience differ
    const juniorFound = results.lawyers.find(
      (l) => l._id.toString() === juniorLawyerDoc._id.toString()
    );
    assert.equal(juniorFound, undefined, "Junior lawyer should be filtered out");
  });

  test("4. Sorting: fee ascending vs fee descending", async () => {
    const ascResults = await searchLawyersService({
      sortBy: "fee_asc",
    });
    const descResults = await searchLawyersService({
      sortBy: "fee_desc",
    });

    assert.ok(ascResults.lawyers.length >= 2);
    assert.ok(descResults.lawyers.length >= 2);

    const firstFeeAsc = ascResults.lawyers[0].consultationFee;
    const secondFeeAsc = ascResults.lawyers[1].consultationFee;
    assert.ok(firstFeeAsc <= secondFeeAsc, "Fee asc sort should order lowest first");

    const firstFeeDesc = descResults.lawyers[0].consultationFee;
    const secondFeeDesc = descResults.lawyers[1].consultationFee;
    assert.ok(firstFeeDesc >= secondFeeDesc, "Fee desc sort should order highest first");
  });

  // =========================================================================
  // SCENARIO 3, 4, 5: Public Profile Details, Awards & Dynamic Updates
  // =========================================================================

  test("5. Public Profile retrieves education, internships, and awards accurately", async () => {
    const profile = await getLawyerByIdService(seniorLawyerDoc._id.toString());

    assert.equal(profile.education.length, 2);
    assert.equal(profile.education[0].degree, "LL.B. (Hons)");
    assert.equal(profile.internships.length, 1);
    assert.equal(profile.internships[0].organization, "Amarchand Mangaldas");
    assert.equal(profile.awards.length, 1);
    assert.equal(profile.awards[0].name, "Arbitrator of the Year");
    assert.equal(profile.awards[0].organization, "Indian Arbitration Bar");
    assert.equal(profile.awards[0].year, 2022);
  });

  test("6. Dynamic Lawyer Profile Update: adding an award reflects immediately", async () => {
    const updated = await updateLawyerProfileService(seniorLawyerUser._id.toString(), {
      awards: [
        {
          name: "Arbitrator of the Year",
          organization: "Indian Arbitration Bar",
          year: 2022,
          description: "Recognized for excellence.",
        },
        {
          name: "Top 40 Under 40 Counsel",
          organization: "Legal Era",
          year: 2023,
          description: "Distinguished legal practice award.",
        },
      ],
      consultationFee: 4000,
    });

    assert.equal(updated.consultationFee, 4000);
    assert.equal(updated.awards.length, 2);
    assert.equal(updated.awards[1].name, "Top 40 Under 40 Counsel");

    // Fetch again via public profile getter
    const publicProfile = await getLawyerByIdService(seniorLawyerDoc._id.toString());
    assert.equal(publicProfile.consultationFee, 4000);
    assert.equal(publicProfile.awards.length, 2);
  });

  // =========================================================================
  // SCENARIO 7, 8: Booking with Configured Slot
  // =========================================================================

  test("7. 100% completed client can book a consultation with a configured slot", async () => {
    const appointment = await bookAppointmentService({
      clientId: completeClient._id.toString(),
      slotId: configuredSlot._id.toString(),
      consultationType: "video",
      documents: ["https://example.com/doc1.pdf"],
      issueDescription: "Breach of contract dispute in commercial arbitration.",
    });

    assert.ok(appointment._id);
    assert.equal(appointment.consultationType, "video");
    assert.equal(appointment.fee, 4000);
    assert.equal(appointment.status, "confirmed");

    // Verify slot marked as booked
    const updatedSlot = await LawyerAvailability.findById(configuredSlot._id);
    assert.equal(updatedSlot.isBooked, true);
  });

  // =========================================================================
  // SCENARIO 9 & 10: Preferred / Flexible Time Booking Without Preconfigured Slots
  // =========================================================================

  test("8. Booking request without configured slot creates unconfirmed preferred appointment marked pending", async () => {
    // Junior lawyer has no configured slots
    const appointment = await bookAppointmentService({
      clientId: completeClient._id.toString(),
      lawyerId: juniorLawyerDoc._id.toString(),
      consultationType: "chat",
      isPreferredTime: true,
      preferredDate: "2026-11-15",
      preferredTime: "11:30 AM",
      issueDescription: "Family mediation and estate division consultation.",
    });

    assert.ok(appointment._id);
    assert.equal(appointment.consultationType, "chat");
    assert.equal(appointment.fee, 1200);
    assert.equal(appointment.isPreferredTime, true);
    assert.equal(appointment.preferredDate, "2026-11-15");
    assert.equal(appointment.preferredTime, "11:30 AM");
    // Strictly unconfirmed - must remain pending
    assert.equal(appointment.status, "pending");
  });

  test("9. Booking with consultationType 'both' is supported and valid", async () => {
    const appointment = await bookAppointmentService({
      clientId: completeClient._id.toString(),
      lawyerId: juniorLawyerDoc._id.toString(),
      consultationType: "both",
      isFlexibleTime: true,
      issueDescription: "Initial chat consultation followed by deep video conference.",
    });

    assert.ok(appointment._id);
    assert.equal(appointment.consultationType, "both");
    assert.equal(appointment.isFlexibleTime, true);
    assert.equal(appointment.status, "pending");
  });

  // =========================================================================
  // SCENARIO 11 & 12: Backend Booking Security (Mandatory 100% Profile Completion)
  // =========================================================================

  test("10. Incomplete client CANNOT bypass booking restriction through direct API request", async () => {
    await assert.rejects(
      async () => {
        await bookAppointmentService({
          clientId: incompleteClient._id.toString(),
          lawyerId: juniorLawyerDoc._id.toString(),
          consultationType: "video",
          isPreferredTime: true,
          preferredDate: "2026-11-20",
          preferredTime: "10:00 AM",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(
          err.message,
          /Profile must be 100% complete before booking a consultation/
        );
        return true;
      }
    );
  });
});
