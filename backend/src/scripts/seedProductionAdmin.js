/**
 * Production-Safe Initial Administrator Provisioning Script
 *
 * Reads admin credentials from environment variables:
 *   - ADMIN_NAME (default: "Platform Administrator")
 *   - ADMIN_EMAIL (required)
 *   - ADMIN_PASSWORD (required, min 8 chars)
 *   - ADMIN_PHONE (optional)
 *
 * Usage:
 *   ADMIN_EMAIL="admin@yourcompany.com" ADMIN_PASSWORD="SecurePassword123!" node src/scripts/seedProductionAdmin.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedProductionAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "System Administrator";
  const adminPhone = process.env.ADMIN_PHONE || "+91 99999 00000";

  if (!adminEmail || !adminPassword) {
    console.error("❌ Error: Both ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    console.error("Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourPassword node src/scripts/seedProductionAdmin.js");
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("❌ Error: ADMIN_PASSWORD must be at least 8 characters long for production security.");
    process.exit(1);
  }

  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        console.log(`ℹ️ Admin account already exists for ${adminEmail}. Skipping creation to prevent accidental overwrites.`);
      } else {
        console.warn(`⚠️ Warning: An account with email ${adminEmail} already exists with role "${existingAdmin.role}".`);
        console.warn("For safety, this script will NOT overwrite existing non-admin credentials.");
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    const newAdmin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Triggers bcrypt hash via User pre-save hook
      role: "admin",
      phone: adminPhone,
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    await newAdmin.save();

    console.log("✅ Production administrator account created successfully!");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name:  ${adminName}`);
    console.log("   Role:  admin");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to provision administrator account:", error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedProductionAdmin();
