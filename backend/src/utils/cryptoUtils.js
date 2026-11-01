const crypto = require("crypto");

/**
 * Derives a consistent 32-byte key for AES-256 encryption.
 */
function getEncryptionKey() {
  const secret =
    process.env.IDENTITY_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "legalconnect_secure_identity_salt_2026_dev_key";

  return crypto.createHash("sha256").update(secret).digest();
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
