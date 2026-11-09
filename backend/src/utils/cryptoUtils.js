const crypto = require("crypto");

// Ephemeral fallback keys restricted strictly to isolated automated unit tests (NODE_ENV === "test")
let ephemeralTestKey = null;
let ephemeralTestPepper = null;

/**
 * Derives a consistent 32-byte key for AES-256 encryption.
 * Production and development require a stable IDENTITY_ENCRYPTION_KEY.
 * Ephemeral keys are restricted strictly to isolated unit tests.
 * JWT_SECRET is never reused for identity encryption.
 */
function getEncryptionKey() {
  const secret = process.env.IDENTITY_ENCRYPTION_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "test") {
      if (!ephemeralTestKey) {
        ephemeralTestKey = crypto.randomBytes(32);
      }
      return ephemeralTestKey;
    }

    const error = new Error(
      "IDENTITY_ENCRYPTION_KEY environment variable is required to ensure encrypted data persists across restarts. " +
      "Please set IDENTITY_ENCRYPTION_KEY in your environment or backend/.env file."
    );
    error.statusCode = 500;
    error.code = "CRYPTO_KEY_MISSING";
    throw error;
  }

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Cryptographically secure 6-digit numeric OTP generator.
 */
function generateSixDigitOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Retrieves the OTP pepper secret.
 * Production and development require a stable OTP_PEPPER_SECRET.
 * Ephemeral pepper is restricted strictly to isolated unit tests.
 * JWT_SECRET is never reused for OTP pepper hashing.
 */
function getOtpPepper() {
  const pepper = process.env.OTP_PEPPER_SECRET;

  if (!pepper) {
    if (process.env.NODE_ENV === "test") {
      if (!ephemeralTestPepper) {
        ephemeralTestPepper = crypto.randomBytes(32).toString("hex");
      }
      return ephemeralTestPepper;
    }

    const error = new Error(
      "OTP_PEPPER_SECRET environment variable is required to ensure OTP hashes remain valid across restarts. " +
      "Please set OTP_PEPPER_SECRET in your environment or backend/.env file."
    );
    error.statusCode = 500;
    error.code = "CRYPTO_KEY_MISSING";
    throw error;
  }

  return pepper;
}

/**
 * Computes a keyed HMAC-SHA256 hash for OTP values to prevent brute-force attacks if DB is leaked.
 *
 * @param {string} otp - The plain 6-digit OTP
 * @param {string} purpose - "email_verification"
 * @param {string} destination - Email destination string
 * @returns {string} Hex encoded HMAC hash
 */
function hashOtp(otp, purpose = "email_verification", destination = "") {
  const pepper = getOtpPepper();

  const cleanDest = destination ? destination.toLowerCase().trim() : "";
  return crypto
    .createHmac("sha256", pepper)
    .update(`${otp}:${purpose}:${cleanDest}`)
    .digest("hex");
}

/**
 * Compares an OTP submission against stored HMAC using constant-time equality.
 */
function verifyOtpHash(otp, purpose = "email_verification", destination = "", storedHash = "") {
  if (!otp || !storedHash) return false;

  const expectedHash = hashOtp(otp, purpose, destination);
  const a = Buffer.from(expectedHash, "hex");
  const b = Buffer.from(storedHash, "hex");

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Masks an email for safe display (e.g. "p***a@example.com").
 */
function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!domain) return email;
  if (local.length <= 2) {
    return `${local[0] || "*"}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Encrypts sensitive string (e.g., Aadhaar / PAN) at rest using AES-256-GCM.
 */
function encryptSensitive(text) {
  if (!text || typeof text !== "string") return null;

  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string.
 */
function decryptSensitive(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== "string") return null;

  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return null;
  }
}

/**
 * Normalizes email address to lower-case and trimmed string.
 */
function normalizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Validates and normalizes Indian mobile numbers.
 * Supports: "+919876543210", "9876543210", "09876543210", "+91 98765 43210".
 * Returns "+91XXXXXXXXXX" on success, or null if invalid.
 */
function normalizeIndianMobile(phone) {
  if (!phone || typeof phone !== "string") return null;

  const cleaned = phone.replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);

  if (!match) return null;
  return `+91${match[1]}`;
}

function isValidIndianMobile(phone) {
  return normalizeIndianMobile(phone) !== null;
}

/**
 * Validates Indian 12-digit Aadhaar number format.
 * Must be 12 digits, cannot start with 0 or 1.
 */
function isValidAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== "string") return false;
  const cleaned = aadhaar.replace(/[\s\-]/g, "");
  return /^[2-9]\d{11}$/.test(cleaned);
}

/**
 * Returns masked Aadhaar (e.g., "XXXX-XXXX-1234").
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== "string") return "";
  const cleaned = aadhaar.replace(/[\s\-]/g, "");
  if (cleaned.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = cleaned.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Validates Indian PAN number format (10 alphanumeric characters).
 * Format: 5 uppercase letters, 4 digits, 1 uppercase letter.
 */
function isValidPAN(pan) {
  if (!pan || typeof pan !== "string") return false;
  const cleaned = pan.trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned);
}

/**
 * Returns masked PAN (e.g., "XXXXX1234X").
 */
function maskPAN(pan) {
  if (!pan || typeof pan !== "string") return "";
  const cleaned = pan.trim().toUpperCase();
  if (cleaned.length !== 10) return "XXXXX0000X";
  return `XXXXX${cleaned.slice(5, 9)}${cleaned.slice(9)}`;
}

/**
 * Validates Indian 6-digit PIN code format.
 */
function isValidPinCode(pincode) {
  if (!pincode) return false;
  const cleaned = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(cleaned);
}

module.exports = {
  generateSixDigitOtp,
  hashOtp,
  verifyOtpHash,
  maskEmail,
  encryptSensitive,
  decryptSensitive,
  normalizeEmail,
  normalizeIndianMobile,
  isValidIndianMobile,
  isValidAadhaar,
  maskAadhaar,
  isValidPAN,
  maskPAN,
  isValidPinCode,
};
