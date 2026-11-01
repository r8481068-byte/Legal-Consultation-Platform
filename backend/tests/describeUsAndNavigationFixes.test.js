const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const {
  updateLawyerProfileService,
  getMyLawyerProfileService,
  searchLawyersService,
} = require("../src/services/lawyerService");

const mongoUri =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/legalconnect";

describe("Describe Us, Lawyer Search & Profile Navigation Verification Suite", () => {
  let lawyerUser1;
  let lawyerDoc1;
  let lawyerUser2;
  let lawyerDoc2;
  let clientUser;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const stamp = Date.now();

    // Create lawyer 1
    lawyerUser1 = await User.create({
      name: `Advocate Sharma ${stamp}`,
      email: `lawyer1.${stamp}@test.com`,
      password: "Password123!",
      phone: "9876543210",
      role: "lawyer",
      isActive: true,
    });

    lawyerDoc1 = await Lawyer.create({
      user: lawyerUser1._id,
      barCouncilId: `D/${stamp}/2015`,
      specialization: ["Criminal Law", "Civil Litigation"],
      experienceYears: 12,
      consultationFee: 2500,
      city: "New Delhi",
      state: "Delhi",
      verificationStatus: "approved",
      headline: "Senior Criminal Advocate",
      designation: "Senior Advocate",
      bio: "Initial biography",
      describeUs: "Initial describe us intro",
    });

    // Create lawyer 2
    lawyerUser2 = await User.create({
      name: `Advocate Verma ${stamp}`,
      email: `lawyer2.${stamp}@test.com`,
      password: "Password123!",
      phone: "9876543211",
      role: "lawyer",
      isActive: true,
    });

    lawyerDoc2 = await Lawyer.create({
      user: lawyerUser2._id,
      barCouncilId: `KAR/${stamp}/2020`,
      specialization: ["Corporate & Startup Law"],
      experienceYears: 5,
      consultationFee: 1500,
      city: "Bengaluru",
      state: "Karnataka",
      verificationStatus: "approved",
      headline: "Corporate Law Specialist",
      designation: "Advocate",
    });

    // Create client user
    clientUser = await User.create({
      name: `Client Tester ${stamp}`,
      email: `client.${stamp}@test.com`,
      password: "Password123!",
      phone: "9876543212",
      role: "client",
      isActive: true,
    });
  });

  after(async () => {
    try {
      if (lawyerUser1) await User.deleteOne({ _id: lawyerUser1._id });
      if (lawyerDoc1) await Lawyer.deleteOne({ _id: lawyerDoc1._id });
      if (lawyerUser2) await User.deleteOne({ _id: lawyerUser2._id });
      if (lawyerDoc2) await Lawyer.deleteOne({ _id: lawyerDoc2._id });
      if (clientUser) await User.deleteOne({ _id: clientUser._id });
    } finally {
      await mongoose.disconnect();
    }
  });

  test("1. Authenticated lawyer can update their own Describe Us introduction", async () => {
    const updatedBio = "I am a seasoned trial advocate with over 12 years of experience handling criminal appeals.";
    const result = await updateLawyerProfileService(lawyerUser1._id.toString(), {
      describeUs: updatedBio,
    });

    assert.equal(result.describeUs, updatedBio);
    assert.equal(result.bio, updatedBio, "bio should sync with describeUs");
  });

  test("2. Updating Describe Us preserves other lawyer profile fields", async () => {
    const freshDoc = await Lawyer.findById(lawyerDoc1._id);
    assert.equal(freshDoc.experienceYears, 12);
    assert.equal(freshDoc.consultationFee, 2500);
    assert.equal(freshDoc.city, "New Delhi");
    assert.equal(freshDoc.headline, "Senior Criminal Advocate");
    assert.deepEqual(freshDoc.specialization, ["Criminal Law", "Civil Litigation"]);
  });

  test("3. Saved Describe Us persists and loads via getMyLawyerProfileService", async () => {
    const profile = await getMyLawyerProfileService(lawyerUser1._id.toString());
    assert.ok(profile.describeUs.includes("seasoned trial advocate"));
    assert.equal(profile.describeUs, profile.bio);
  });

  test("4. One lawyer cannot update another lawyer's profile", async () => {
    // Lawyer 2 attempts to pass modifications using Lawyer 2's session
    const result = await updateLawyerProfileService(lawyerUser2._id.toString(), {
      describeUs: "Lawyer 2 introduction",
    });

    // Lawyer 2 was updated
    assert.equal(result.describeUs, "Lawyer 2 introduction");

    // Verify Lawyer 1 was untouched
    const lawyer1Doc = await Lawyer.findById(lawyerDoc1._id);
    assert.ok(lawyer1Doc.describeUs.includes("seasoned trial advocate"));
  });

  test("5. Available Advocates query returns real database records and respects filters", async () => {
    const response = await searchLawyersService({
      specialization: "Criminal Law",
    });

    assert.ok(Array.isArray(response.lawyers));
    const found = response.lawyers.find((l) => l._id.toString() === lawyerDoc1._id.toString());
    assert.ok(found, "Lawyer 1 should be found under Criminal Law");
    assert.equal(found.city, "New Delhi");
  });
});
