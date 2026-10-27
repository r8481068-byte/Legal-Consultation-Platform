/**
 * Development Seed Script for Legal Consultation Platform
 * Creates 3 safe, idempotent demo accounts:
 *   1. Client (client.demo@example.com)
 *   2. Approved Lawyer (lawyer.demo@example.com) with complete profile & bookable slots
 *   3. Admin (admin.demo@example.com)
 *
 * Usage:
 *   npm run seed:demo
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const LawyerAvailability = require("../models/LawyerAvailability");

const DEMO_ACCOUNTS = {
  client: {
    name: "Priya Sharma (Demo Client)",
    email: "client.demo@example.com",
    password: "ClientDemo@123",
    role: "client",
    phone: "+91 98765 43210",
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    isActive: true,
    state: "Delhi NCR",
    district: "South Delhi",
    subDistrict: "Hauz Khas",
    locality: "Green Park Extension",
    cityVillage: "New Delhi",
    pincode: "110016",
    addressLine: "Flat 102, Shanti Niketan Apartments",
    aadhaarMasked: "XXXX-XXXX-9876",
    aadhaarVerified: true,
    panMasked: "XXXXX1234F",
    panVerified: true,
  },
  lawyer: {
    name: "Adv. Rajesh Verma (Demo Lawyer)",
    email: "lawyer.demo@example.com",
    password: "LawyerDemo@123",
    role: "lawyer",
    phone: "+91 98111 22334",
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    isActive: true,
  },
  admin: {
    name: "System Administrator (Demo)",
    email: "admin.demo@example.com",
    password: "AdminDemo@123",
    role: "admin",
    phone: "+91 99999 88888",
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    isActive: true,
  },
};

const LAWYER_PROFILE = {
  bio: "Senior advocate specializing in Corporate, Commercial, and Civil Law with 12+ years of practice before the High Court and NCLT. Dedicated to offering actionable, clear legal counsel.",
  specialization: ["Corporate Law", "Contract Law", "Civil Litigation"],
  experienceYears: 12,
  education: [
    {
      degree: "LL.M. in Commercial Law",
      institution: "National Law School of India University",
      year: 2012,
    },
    {
      degree: "B.A. LL.B. (Hons)",
      institution: "Faculty of Law, University of Delhi",
      year: 2010,
    },
  ],
  barCouncilId: "D/1482/2011",
  consultationFee: 1500,
  languages: ["English", "Hindi"],
  city: "New Delhi",
  stateOfEnrolment: "Bar Council of Delhi",
  lawCollege: "Faculty of Law, University of Delhi",
  graduationYear: 2010,
  consultationModes: ["video", "in_person"],
  courtLevels: ["High Court", "District Court", "Tribunal"],
  practiceCourts: ["Delhi High Court", "NCLT New Delhi", "Saket District Court"],
  verificationStatus: "approved",
  isAvailable: true,
  averageRating: 4.9,
  totalReviews: 8,
  verificationDocuments: [
    {
      title: "Bar Council Certificate of Practice",
      url: "https://example.com/demo/bar-council-cert.pdf",
      documentType: "bar_certificate"
    },
  ],
};

async function seedUser(accountData) {
  const existingUser = await User.findOne({ email: accountData.email.toLowerCase() }).select("+password");

  if (existingUser) {
    // If role differs from demo, report safely without silent overwrite
    if (existingUser.role !== accountData.role) {
      console.log(`[Notice] Account ${accountData.email} exists with role "${existingUser.role}" instead of "${accountData.role}". Updating role.`);
      existingUser.role = accountData.role;
    }
    // Update password to match demo password so developer can log in
    existingUser.name = accountData.name;
    existingUser.phone = accountData.phone;
    existingUser.emailVerified = true;
    existingUser.phoneVerified = true;
    existingUser.isVerified = true;
    existingUser.isActive = true;
    if (accountData.state) existingUser.state = accountData.state;
    if (accountData.district) existingUser.district = accountData.district;
    if (accountData.subDistrict) existingUser.subDistrict = accountData.subDistrict;
    if (accountData.locality) existingUser.locality = accountData.locality;
    if (accountData.cityVillage) existingUser.cityVillage = accountData.cityVillage;
    if (accountData.pincode) existingUser.pincode = accountData.pincode;
    if (accountData.addressLine) existingUser.addressLine = accountData.addressLine;
    if (accountData.aadhaarMasked) {
      existingUser.aadhaarMasked = accountData.aadhaarMasked;
      existingUser.aadhaarVerified = true;
    }
    if (accountData.panMasked) {
      existingUser.panMasked = accountData.panMasked;
      existingUser.panVerified = true;
    }
    existingUser.password = accountData.password; // Triggers pre("save") bcrypt hashing
    await existingUser.save();

    return { user: existingUser, created: false };
  }

  // Create new user
  const newUser = new User({
    name: accountData.name,
    email: accountData.email.toLowerCase(),
    password: accountData.password,
    role: accountData.role,
    phone: accountData.phone,
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
    isActive: true,
    ...(accountData.state ? {
      state: accountData.state,
      district: accountData.district,
      subDistrict: accountData.subDistrict,
      locality: accountData.locality,
      cityVillage: accountData.cityVillage,
      pincode: accountData.pincode,
      addressLine: accountData.addressLine,
      aadhaarMasked: accountData.aadhaarMasked,
      aadhaarVerified: true,
      panMasked: accountData.panMasked,
      panVerified: true,
    } : {}),
  });

  await newUser.save();
  return { user: newUser, created: true };
}

async function seedLawyerProfile(lawyerUserId) {
  let lawyer = await Lawyer.findOne({ user: lawyerUserId });

  if (lawyer) {
    lawyer.verificationStatus = "approved";
    lawyer.isAvailable = true;
    lawyer.consultationFee = LAWYER_PROFILE.consultationFee;
    lawyer.city = LAWYER_PROFILE.city;
    lawyer.specialization = LAWYER_PROFILE.specialization;
    lawyer.experienceYears = LAWYER_PROFILE.experienceYears;
    lawyer.education = LAWYER_PROFILE.education;
    lawyer.languages = LAWYER_PROFILE.languages;
    lawyer.bio = LAWYER_PROFILE.bio;
    lawyer.courtLevels = LAWYER_PROFILE.courtLevels;
    lawyer.practiceCourts = LAWYER_PROFILE.practiceCourts;
    await lawyer.save();
    return { lawyer, created: false };
  }

  lawyer = new Lawyer({
    user: lawyerUserId,
    ...LAWYER_PROFILE,
  });

  await lawyer.save();
  return { lawyer, created: true };
}

async function seedAvailabilitySlots(lawyerId) {
  const now = new Date();
  const existingSlots = await LawyerAvailability.countDocuments({
    lawyer: lawyerId,
    startAt: { $gte: now },
  });

  if (existingSlots >= 3) {
    return { count: existingSlots, created: false };
  }

  // Create slots for tomorrow and day after tomorrow
  const slotsToCreate = [];
  const startDay = 1; // tomorrow

  for (let d = startDay; d <= startDay + 2; d++) {
    const slotTimes = [
      { hour: 10, minute: 0, durationMinutes: 45 },
      { hour: 14, minute: 0, durationMinutes: 45 },
      { hour: 16, minute: 30, durationMinutes: 45 },
    ];

    for (const time of slotTimes) {
      const slotStart = new Date();
      slotStart.setDate(slotStart.getDate() + d);
      slotStart.setHours(time.hour, time.minute, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + time.durationMinutes * 60 * 1000);

      // Check if slot with same start time exists
      const exists = await LawyerAvailability.findOne({
        lawyer: lawyerId,
        startAt: slotStart,
      });

      if (!exists) {
        slotsToCreate.push({
          lawyer: lawyerId,
          startAt: slotStart,
          endAt: slotEnd,
          status: "available",
        });
      }
    }
  }

  if (slotsToCreate.length > 0) {
    await LawyerAvailability.insertMany(slotsToCreate);
    return { count: slotsToCreate.length, created: true };
  }

  return { count: 0, created: false };
}

async function run() {
  console.log("=================================================");
  console.log(" Seeding Demo Accounts for LegalConnect Platform ");
  console.log("=================================================\n");

  try {
    await connectDB();

    // 1. Seed Client
    const clientResult = await seedUser(DEMO_ACCOUNTS.client);
    console.log(
      clientResult.created
        ? "✓ Created Client demo account"
        : "✓ Verified/Updated existing Client demo account"
    );

    // 2. Seed Lawyer User & Profile
    const lawyerUserResult = await seedUser(DEMO_ACCOUNTS.lawyer);
    const lawyerProfileResult = await seedLawyerProfile(lawyerUserResult.user._id);
    const slotsResult = await seedAvailabilitySlots(lawyerProfileResult.lawyer._id);
    console.log(
      lawyerUserResult.created
        ? "✓ Created Lawyer demo account & approved profile"
        : "✓ Verified/Updated Lawyer demo account & approved profile"
    );
    console.log(
      slotsResult.created
        ? `✓ Created ${slotsResult.count} bookable upcoming slots for lawyer`
        : `✓ Lawyer already has ${slotsResult.count} upcoming bookable slots`
    );

    // 3. Seed Admin
    const adminResult = await seedUser(DEMO_ACCOUNTS.admin);
    console.log(
      adminResult.created
        ? "✓ Created Admin demo account"
        : "✓ Verified/Updated existing Admin demo account"
    );

    console.log("\n-------------------------------------------------");
    console.log(" SAFE DEMO CREDENTIALS (LOCAL DEVELOPMENT ONLY) ");
    console.log("-------------------------------------------------");
    console.log("1. CLIENT ACCOUNT:");
    console.log(`   Email:    ${DEMO_ACCOUNTS.client.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.client.password}`);
    console.log(`   Role:     client\n`);

    console.log("2. APPROVED LAWYER ACCOUNT:");
    console.log(`   Email:    ${DEMO_ACCOUNTS.lawyer.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.lawyer.password}`);
    console.log(`   Role:     lawyer`);
    console.log(`   Status:   Approved (discoverable, with slots)\n`);

    console.log("3. ADMINISTRATOR ACCOUNT:");
    console.log(`   Email:    ${DEMO_ACCOUNTS.admin.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.admin.password}`);
    console.log(`   Role:     admin\n`);
    console.log("=================================================");
    console.log(" Seeding completed successfully. Idempotent check OK.");
    console.log("=================================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n[Error during demo account seeding]:", error);
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close error
    }
    process.exit(1);
  }
}

run();
