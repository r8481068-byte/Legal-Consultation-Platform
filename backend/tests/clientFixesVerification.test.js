const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/models/User");
const RefreshToken = require("../src/models/RefreshToken");
const {
  updateUserProfileService,
  getUserProfileService,
  updateClientIdentityService,
} = require("../src/services/authService");
const { generateAccessToken, generateRefreshToken } = require("../src/utils/token");
const { connectTestDB, disconnectTestDB } = require("./helpers/testDb");

describe("Client Fixes & Profile Functionality Test Suite", () => {
  let clientUser;
  let refreshTokenDoc;

  before(async () => {
    await connectTestDB();

    const stamp = Date.now();
    clientUser = await User.create({
      name: `Rupesh Singh ${stamp}`,
      email: `rupesh.${stamp}@example.com`,
      password: "Password123!",
      phone: "9876543210",
      role: "client",
      gender: "male",
      dob: new Date("1995-05-10"),
      state: "Bihar",
      district: "Patna",
      cityVillage: "Patna",
      pincode: "800001",
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
      isActive: true,
    });

    const refreshToken = generateRefreshToken();
    refreshTokenDoc = await RefreshToken.create({
      user: clientUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  });

  after(async () => {
    if (clientUser) await User.deleteOne({ _id: clientUser._id });
    if (refreshTokenDoc) await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
    await disconnectTestDB();
  });

  test("1. Profile Save: Update personal info and address without overwriting unedited fields", async () => {
    const updated = await updateUserProfileService(clientUser._id, {
      name: "Rupesh Kumar Singh",
      phone: "9876500000",
      locality: "Kankarbagh",
      addressLine: "Road No 4, Housing Colony",
    });

    assert.equal(updated.name, "Rupesh Kumar Singh");
    assert.equal(updated.phone, "+919876500000");
    assert.equal(updated.locality, "Kankarbagh");
    assert.equal(updated.addressLine, "Road No 4, Housing Colony");

    // Existing fields were preserved and NOT overwritten
    assert.equal(updated.gender, "male");
    assert.equal(updated.state, "Bihar");
    assert.equal(updated.district, "Patna");
    assert.equal(updated.cityVillage, "Patna");
    assert.equal(updated.pincode, "800001");
  });

  test("2. Save About Me: Updates and saves client's about me description up to 1000 chars", async () => {
    const aboutDesc = "Corporate professional seeking legal consultation on contract drafting.";
    const updated = await updateUserProfileService(clientUser._id, {
      about: aboutDesc,
    });

    assert.equal(updated.about, aboutDesc);

    const fresh = await getUserProfileService(clientUser._id);
    assert.equal(fresh.about, aboutDesc);
  });

  test("3. Profile Image Save: Updates client profile image securely", async () => {
    const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfQHzR068XgAAAABJRU5ErkJggg==";
    const updated = await updateUserProfileService(clientUser._id, {
      profileImage: testImage,
    });

    assert.equal(updated.profileImage, testImage);

    const fresh = await getUserProfileService(clientUser._id);
    assert.equal(fresh.profileImage, testImage);
  });

  test("4. Encrypt & Save Identity: Aadhaar & PAN encrypted at rest, masked in response, not marked genuinely verified", async () => {
    const res = await updateClientIdentityService(clientUser._id, {
      aadhaar: "9876 5432 1098",
      pan: "ABCDE1234F",
    });

    assert.equal(res.success, true);
    assert.equal(res.identityStatus.aadhaarMasked, "XXXX-XXXX-1098");
    assert.equal(res.identityStatus.panMasked, "XXXXX1234F");

    // Crucial requirement: Do NOT mark identity as genuinely verified merely because format is valid
    assert.equal(res.identityStatus.aadhaarVerified, false);
    assert.equal(res.identityStatus.panVerified, false);

    // Verify database document: Raw values are NOT stored or selected
    const userDoc = await User.findById(clientUser._id).select("+aadhaarEncrypted +panEncrypted");
    assert.ok(userDoc.aadhaarEncrypted, "Aadhaar must be encrypted at rest");
    assert.ok(userDoc.panEncrypted, "PAN must be encrypted at rest");
    assert.notEqual(userDoc.aadhaarEncrypted, "987654321098");
    assert.notEqual(userDoc.panEncrypted, "ABCDE1234F");
    assert.equal(userDoc.aadhaarVerified, false);
    assert.equal(userDoc.panVerified, false);

    // Profile query never selects encrypted fields
    const profile = await getUserProfileService(clientUser._id);
    assert.equal(profile.aadhaarEncrypted, undefined);
    assert.equal(profile.panEncrypted, undefined);
    assert.equal(profile.aadhaarMasked, "XXXX-XXXX-1098");
    assert.equal(profile.panMasked, "XXXXX1234F");
  });

  test("5. Token Architecture: Expired access token rejection and refresh token validation", async () => {
    // Generate an already expired token (expired 10 minutes ago)
    const expiredToken = jwt.sign(
      { userId: clientUser._id, role: clientUser.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "-10m" }
    );

    // Verifying expired token throws TokenExpiredError
    let threwExpired = false;
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET || "fallback_secret");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        threwExpired = true;
      }
    }
    assert.ok(threwExpired, "Expired access token is rejected with TokenExpiredError");

    // Refresh token in database allows issuing a fresh access token
    const tokenRecord = await RefreshToken.findOne({ token: refreshTokenDoc.token });
    assert.ok(tokenRecord, "Refresh token exists in DB");
    assert.ok(tokenRecord.expiresAt > new Date(), "Refresh token has not expired");

    const freshAccessToken = generateAccessToken(clientUser);
    const decodedFresh = jwt.verify(
      freshAccessToken,
      process.env.JWT_SECRET || "fallback_secret"
    );
    assert.equal(decodedFresh.userId, clientUser._id.toString());
  });
});
