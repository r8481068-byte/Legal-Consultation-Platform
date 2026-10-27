/**
 * Legacy User Verification & Profile Migration Script
 *
 * Purpose:
 * Safely backfills legacy users who had `isVerified: true` before the dual-verification
 * system was introduced, preventing legitimate existing users and demo accounts from being locked out.
 *
 * Usage:
 *   node src/scripts/migrateLegacyUsers.js
 *   node src/scripts/migrateLegacyUsers.js --dry-run
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { normalizeIndianMobile, maskAadhaar, maskPAN, encryptSensitive } = require("../utils/cryptoUtils");

async function runMigration() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log(`=== LegalConnect Legacy User Migration ===`);
  console.log(`Mode: ${isDryRun ? "DRY RUN (no database writes)" : "LIVE EXECUTION"}`);

  await connectDB();

  try {
    const legacyVerifiedUsers = await User.find({
      isVerified: true,
      $or: [
        { emailVerified: { $ne: true } },
        { phoneVerified: { $ne: true } },
      ],
    });

    console.log(`Found ${legacyVerifiedUsers.length} legacy verified user(s) requiring contact verification backfill.`);

    let updatedCount = 0;

    for (const user of legacyVerifiedUsers) {
      console.log(`- User: ${user.name} (${user.email}) [Role: ${user.role}]`);

      // Normalize phone if present
      let normalizedPhone = user.phone;
      if (user.phone) {
        normalizedPhone = normalizeIndianMobile(user.phone) || user.phone;
      }

      if (!isDryRun) {
        user.emailVerified = true;
        user.phoneVerified = true;
        if (normalizedPhone) {
          user.phone = normalizedPhone;
        }

        // If client demo user, prefill address and identity so booking tests work out of the box
        if (user.email === "client.demo@example.com") {
          user.state = user.state || "Delhi NCR";
          user.district = user.district || "South Delhi";
          user.subDistrict = user.subDistrict || "Hauz Khas";
          user.locality = user.locality || "Green Park Extension";
          user.cityVillage = user.cityVillage || "New Delhi";
          user.pincode = user.pincode || "110016";
          user.addressLine = user.addressLine || "Flat 102, Shanti Niketan Apartments";
          user.aadhaarMasked = user.aadhaarMasked || maskAadhaar("987654321098");
          user.aadhaarEncrypted = user.aadhaarEncrypted || encryptSensitive("987654321098");
          user.aadhaarVerified = true;
          user.panMasked = user.panMasked || maskPAN("ABCDE1234F");
          user.panEncrypted = user.panEncrypted || encryptSensitive("ABCDE1234F");
          user.panVerified = true;
        }

        await user.save();
        updatedCount++;
      }
    }

    console.log(`\nMigration Summary:`);
    console.log(`Total scanned: ${legacyVerifiedUsers.length}`);
    console.log(`Total updated: ${isDryRun ? 0 : updatedCount}`);
    console.log(`Status: COMPLETED SUCCESSFULLY\n`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
