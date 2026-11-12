/**
 * MSG91 SMS Service
 *
 * Provides transactional SMS and mobile OTP delivery using MSG91 Send OTP v5 API.
 * Designed for Indian telecom TRAI DLT compliance.
 *
 * Required environment configuration for live SMS delivery:
 *   - MSG91_AUTH_KEY: API authorization key from MSG91 dashboard
 *   - MSG91_TEMPLATE_ID: DLT-registered SMS OTP template ID
 *   - MSG91_SENDER_ID (optional): 6-character registered DLT sender header
 *
 * If credentials are not configured, methods report clear configuration statuses
 * without breaking user registration or authentication flows.
 */

/**
 * Checks whether MSG91 authentication and template configuration are available.
 *
 * @returns {boolean} True if both auth key and template ID are present and non-empty.
 */
function isMsg91Configured() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  return Boolean(
    authKey &&
    templateId &&
    authKey.trim() !== "" &&
    templateId.trim() !== "" &&
    !authKey.includes("your_") &&
    !templateId.includes("your_")
  );
}

/**
 * Returns a list of missing configuration variables required for MSG91 integration.
 *
 * @returns {Array<string>} List of missing environment variable names
 */
function getMissingMsg91Config() {
  const missing = [];
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || authKey.trim() === "" || authKey.includes("your_")) {
    missing.push("MSG91_AUTH_KEY");
  }
  if (!templateId || templateId.trim() === "" || templateId.includes("your_")) {
    missing.push("MSG91_TEMPLATE_ID");
  }
  return missing;
}

/**
 * Formats a raw phone string into the Indian telecom standard (country code 91 + 10 digits).
 *
 * @param {string} phone - User phone input
 * @returns {string} Normalized 12-digit string starting with 91
 */
function normalizeIndianMobile(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Sends a 6-digit OTP to the specified mobile number via MSG91 Send OTP v5 API.
 * Never logs raw OTP or API credentials.
 *
 * @param {Object} options
 * @param {string} options.phone - Destination mobile number
 * @param {string} options.otp - 6-digit verification code
 * @returns {Promise<{ delivered: boolean, message: string }>}
 */
async function sendSmsOtp({ phone, otp }) {
  if (!isMsg91Configured()) {
    const missing = getMissingMsg91Config();
    const error = new Error(
      `SMS service is not configured. Missing required credentials: ${missing.join(", ")}. Please configure MSG91 credentials and DLT template ID before sending SMS.`
    );
    error.statusCode = 503;
    error.code = "SMS_CONFIG_MISSING";
    error.missingConfig = missing;
    throw error;
  }

  const mobileWithCountryCode = normalizeIndianMobile(phone);
  if (mobileWithCountryCode.length !== 12 || !mobileWithCountryCode.startsWith("91")) {
    const error = new Error("Invalid Indian mobile number. A valid 10-digit number is required.");
    error.statusCode = 400;
    error.code = "INVALID_PHONE_NUMBER";
    throw error;
  }

  const authKey = process.env.MSG91_AUTH_KEY.trim();
  const templateId = process.env.MSG91_TEMPLATE_ID.trim();

  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.append("template_id", templateId);
  url.searchParams.append("mobile", mobileWithCountryCode);
  url.searchParams.append("otp", String(otp));
  url.searchParams.append("otp_expiry", "5");

  if (process.env.MSG91_SENDER_ID && process.env.MSG91_SENDER_ID.trim()) {
    url.searchParams.append("sender", process.env.MSG91_SENDER_ID.trim());
  }

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.type === "error") {
      const errorMsg = data.message || "Failed to dispatch SMS OTP via MSG91";
      const error = new Error(`MSG91 gateway error: ${errorMsg}`);
      error.statusCode = 502;
      error.code = "SMS_GATEWAY_ERROR";
      throw error;
    }

    return {
      delivered: true,
      message: "OTP sent successfully via SMS",
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const netError = new Error(`Failed to contact MSG91 service: ${err.message}`);
    netError.statusCode = 502;
    netError.code = "SMS_NETWORK_ERROR";
    throw netError;
  }
}

module.exports = {
  isMsg91Configured,
  getMissingMsg91Config,
  normalizeIndianMobile,
  sendSmsOtp,
};

