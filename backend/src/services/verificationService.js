const crypto = require("crypto");
const User = require("../models/User");
const VerificationChallenge = require("../models/VerificationChallenge");
const {
  generateSixDigitOtp,
  hashOtp,
  verifyOtpHash,
  normalizeEmail,
  normalizeIndianMobile,
} = require("../utils/cryptoUtils");

const RESEND_API_URL = "https://api.resend.com/emails";
const MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";
const COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

// In-memory store for development/testing when live third-party keys are not provided
const devSimulatedOtps = new Map();

/**
 * ============================================================================
 * EMAIL OTP WORKFLOW (RESEND)
 * ============================================================================
 */

/**
 * Initiates or resends an email verification OTP challenge using Resend.
 */
async function initiateEmailVerification(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    return {
      success: true,
      alreadyVerified: true,
      message: "Email is already verified",
      emailVerified: true,
    };
  }

  const destination = normalizeEmail(user.email);
  const now = new Date();

  // Find recent unconsumed challenge to enforce cooldown & attempt limits
  const existingChallenge = await VerificationChallenge.findOne({
    user: user._id,
    purpose: "email_verification",
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (existingChallenge) {
    const elapsedSeconds = Math.floor(
      (now.getTime() - new Date(existingChallenge.lastSentAt).getTime()) / 1000
    );

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = COOLDOWN_SECONDS - elapsedSeconds;
      const error = new Error(
        `Please wait ${waitTime} seconds before requesting a new email verification code.`
      );
      error.statusCode = 429;
      error.retryAfter = waitTime;
      throw error;
    }
  }

  const otp = generateSixDigitOtp();
  const tokenHash = hashOtp(otp, "email_verification", user._id.toString());
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Expire any existing active challenges for this purpose
  await VerificationChallenge.updateMany(
    {
      user: user._id,
      purpose: "email_verification",
      consumedAt: null,
    },
    { $set: { consumedAt: now } }
  );

  const challenge = await VerificationChallenge.create({
    user: user._id,
    purpose: "email_verification",
    destination,
    tokenHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resendCount: existingChallenge ? existingChallenge.resendCount + 1 : 0,
    lastSentAt: now,
  });

  // Dispatch email via Resend
  let deliveryResult = { provider: "mock", delivered: false };

  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "mock_resend_key") {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "LegalConnect <onboarding@resend.dev>";

      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [destination],
          subject: "Your LegalConnect Email Verification Code",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0;">Verify your email address</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hello <strong>${user.name}</strong>,<br/>
                Use the following six-digit code to verify your LegalConnect account:
              </p>
              <div style="margin: 24px 0; text-align: center;">
                <span style="display: inline-block; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #1e3a8a; background: #eff6ff; padding: 12px 24px; border-radius: 12px; border: 1px solid #bfdbfe;">
                  ${otp}
                </span>
              </div>
              <p style="color: #64748b; font-size: 13px;">
                This code will expire in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resend API response error:", errorData);
        throw new Error(
          errorData.message || "Email provider failed to dispatch OTP"
        );
      }

      deliveryResult = { provider: "resend", delivered: true };
    } catch (sendError) {
      console.error("Failed to send OTP via Resend:", sendError.message);
      // If live send fails, inform the user cleanly
      const error = new Error(
        "Failed to send email verification code. Please verify email configuration or try again shortly."
      );
      error.statusCode = 502;
      throw error;
    }
  } else {
    // Development / Test Simulation mode (no live Resend API key configured)
    devSimulatedOtps.set(`email_${user._id.toString()}`, otp);
    deliveryResult = { provider: "mock_simulation", delivered: true };
  }

  return {
    success: true,
    message: "Verification code sent to your registered email address.",
    destination: maskEmail(destination),
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    cooldownSeconds: COOLDOWN_SECONDS,
    // Only exposed in non-production environments when mock simulation is active for test suites
    ...(process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY
      ? { devOtpHint: otp }
      : {}),
  };
}

/**
 * Verifies submitted Email OTP against stored HMAC challenge.
 */
async function verifyEmailOtp(userId, submittedOtp) {
  if (!submittedOtp || typeof submittedOtp !== "string") {
    const error = new Error("Verification code is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanOtp = submittedOtp.trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    const error = new Error("Verification code must be exactly 6 digits");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    return {
      success: true,
      message: "Email is already verified",
      emailVerified: true,
      phoneVerified: user.phoneVerified,
    };
  }

  // Retrieve active challenge including hidden tokenHash
  const challenge = await VerificationChallenge.findOne({
    user: user._id,
    purpose: "email_verification",
    consumedAt: null,
  })
    .select("+tokenHash")
    .sort({ createdAt: -1 });

  if (!challenge) {
    const error = new Error(
      "No active verification challenge found. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  // Check expiration
  if (now > new Date(challenge.expiresAt)) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Verification code has expired. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check max attempts
  if (challenge.attempts >= challenge.maxAttempts) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Maximum verification attempts exceeded. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check constant-time HMAC match
  const isMatch = verifyOtpHash(
    cleanOtp,
    "email_verification",
    user._id.toString(),
    challenge.tokenHash
  );

  if (!isMatch) {
    challenge.attempts += 1;
    await challenge.save();

    const remainingAttempts = Math.max(0, challenge.maxAttempts - challenge.attempts);
    const error = new Error(
      remainingAttempts > 0
        ? `Incorrect verification code. ${remainingAttempts} attempts remaining.`
        : "Incorrect code. Maximum attempts reached. Please request a new code."
    );
    error.statusCode = 400;
    error.remainingAttempts = remainingAttempts;
    throw error;
  }

  // Mark challenge consumed (single-use, prevent replay)
  challenge.consumedAt = now;
  await challenge.save();

  // Update user verification state
  user.emailVerified = true;
  // If phone is also verified, update legacy isVerified for backward compatibility
  if (user.phoneVerified) {
    user.isVerified = true;
  }
  await user.save();

  devSimulatedOtps.delete(`email_${user._id.toString()}`);

  return {
    success: true,
    message: "Email verified successfully!",
    emailVerified: true,
    phoneVerified: user.phoneVerified,
    isVerified: user.isVerified,
  };
}

/**
 * ============================================================================
 * MOBILE OTP WORKFLOW (MSG91)
 * ============================================================================
 */

/**
 * Initiates or resends a mobile verification OTP challenge via MSG91.
 */
async function initiatePhoneVerification(userId, mobileOverride = null) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.phoneVerified && !mobileOverride) {
    return {
      success: true,
      alreadyVerified: true,
      message: "Mobile number is already verified",
      phoneVerified: true,
    };
  }

  const rawPhone = mobileOverride || user.phone;
  const normalizedPhone = normalizeIndianMobile(rawPhone);

  if (!normalizedPhone) {
    const error = new Error(
      "A valid 10-digit Indian mobile number is required for phone verification"
    );
    error.statusCode = 400;
    throw error;
  }

  // Update user's phone if normalized or overridden
  if (user.phone !== normalizedPhone) {
    user.phone = normalizedPhone;
    user.phoneVerified = false;
    await user.save();
  }

  const now = new Date();

  // Enforce cooldown
  const existingChallenge = await VerificationChallenge.findOne({
    user: user._id,
    purpose: "phone_verification",
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (existingChallenge) {
    const elapsedSeconds = Math.floor(
      (now.getTime() - new Date(existingChallenge.lastSentAt).getTime()) / 1000
    );

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = COOLDOWN_SECONDS - elapsedSeconds;
      const error = new Error(
        `Please wait ${waitTime} seconds before requesting a new mobile verification code.`
      );
      error.statusCode = 429;
      error.retryAfter = waitTime;
      throw error;
    }
  }

  const otp = generateSixDigitOtp();
  const tokenHash = hashOtp(otp, "phone_verification", user._id.toString());
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any previous open challenges
  await VerificationChallenge.updateMany(
    {
      user: user._id,
      purpose: "phone_verification",
      consumedAt: null,
    },
    { $set: { consumedAt: now } }
  );

  await VerificationChallenge.create({
    user: user._id,
    purpose: "phone_verification",
    destination: normalizedPhone,
    tokenHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resendCount: existingChallenge ? existingChallenge.resendCount + 1 : 0,
    lastSentAt: now,
  });

  // Provider Dispatch (MSG91)
  const phoneWithoutPlus = normalizedPhone.replace("+", "");

  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_AUTH_KEY !== "mock_msg91_key") {
    try {
      const templateId = process.env.MSG91_TEMPLATE_ID;
      const authKey = process.env.MSG91_AUTH_KEY;

      const url = `${MSG91_OTP_URL}?template_id=${templateId}&mobile=${phoneWithoutPlus}&authkey=${authKey}&otp_expiry=${OTP_EXPIRY_MINUTES}&otp_length=6`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok || responseData.type === "error") {
        console.error("MSG91 API response error:", responseData);
        throw new Error(
          responseData.message || "SMS provider failed to send verification OTP"
        );
      }
    } catch (msg91Error) {
      console.error("Failed to send OTP via MSG91:", msg91Error.message);
      const error = new Error(
        "Failed to send SMS verification code. Please check mobile number or try again later."
      );
      error.statusCode = 502;
      throw error;
    }
  } else {
    // Simulation / test fallback
    devSimulatedOtps.set(`phone_${user._id.toString()}`, otp);
  }

  return {
    success: true,
    message: "Verification code sent to your registered mobile number.",
    destination: maskMobile(normalizedPhone),
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    cooldownSeconds: COOLDOWN_SECONDS,
    ...(process.env.NODE_ENV !== "production" && !process.env.MSG91_AUTH_KEY
      ? { devOtpHint: otp }
      : {}),
  };
}

/**
 * Verifies submitted Mobile OTP using MSG91 verification endpoint or secure HMAC fallback.
 */
async function verifyPhoneOtp(userId, submittedOtp) {
  if (!submittedOtp || typeof submittedOtp !== "string") {
    const error = new Error("Verification code is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanOtp = submittedOtp.trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    const error = new Error("Verification code must be exactly 6 digits");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.phoneVerified) {
    return {
      success: true,
      message: "Mobile number is already verified",
      emailVerified: user.emailVerified,
      phoneVerified: true,
    };
  }

  const challenge = await VerificationChallenge.findOne({
    user: user._id,
    purpose: "phone_verification",
    consumedAt: null,
  })
    .select("+tokenHash")
    .sort({ createdAt: -1 });

  if (!challenge) {
    const error = new Error(
      "No active mobile verification challenge found. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (now > new Date(challenge.expiresAt)) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Verification code has expired. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Maximum verification attempts exceeded. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check MSG91 verification endpoint if credentials configured
  let isVerified = false;

  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_AUTH_KEY !== "mock_msg91_key") {
    try {
      const authKey = process.env.MSG91_AUTH_KEY;
      const phoneWithoutPlus = challenge.destination.replace("+", "");
      const verifyUrl = `${MSG91_OTP_URL}/verify?mobile=${phoneWithoutPlus}&otp=${cleanOtp}`;

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          authkey: authKey,
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.type === "success") {
        isVerified = true;
      } else {
        isVerified = false;
      }
    } catch (msg91Error) {
      console.error("MSG91 verification request error:", msg91Error.message);
      // Fallback to internal HMAC check if provider network times out
      isVerified = verifyOtpHash(
        cleanOtp,
        "phone_verification",
        user._id.toString(),
        challenge.tokenHash
      );
    }
  } else {
    // Internal HMAC verification check (Simulation / tests)
    isVerified = verifyOtpHash(
      cleanOtp,
      "phone_verification",
      user._id.toString(),
      challenge.tokenHash
    );
  }

  if (!isVerified) {
    challenge.attempts += 1;
    await challenge.save();

    const remainingAttempts = Math.max(0, challenge.maxAttempts - challenge.attempts);
    const error = new Error(
      remainingAttempts > 0
        ? `Incorrect verification code. ${remainingAttempts} attempts remaining.`
        : "Incorrect code. Maximum attempts reached. Please request a new code."
    );
    error.statusCode = 400;
    error.remainingAttempts = remainingAttempts;
    throw error;
  }

  // Consume challenge
  challenge.consumedAt = now;
  await challenge.save();

  user.phoneVerified = true;
  if (user.emailVerified) {
    user.isVerified = true;
  }
  await user.save();

  devSimulatedOtps.delete(`phone_${user._id.toString()}`);

  return {
    success: true,
    message: "Mobile number verified successfully!",
    emailVerified: user.emailVerified,
    phoneVerified: true,
    isVerified: user.isVerified,
  };
}

/**
 * Returns current verification status for a given user.
 */
async function getVerificationStatus(userId) {
  const user = await User.findById(userId).select(
    "name email phone emailVerified phoneVerified isVerified role isActive"
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    isVerified: Boolean(user.isVerified),
    role: user.role,
    isActive: user.isActive,
    verificationComplete: Boolean(user.emailVerified && user.phoneVerified),
  };
}

/**
 * Utility helpers to mask contact details for frontend display.
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function maskMobile(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return "******";
  return `+91 ******${cleaned.slice(-4)}`;
}

module.exports = {
  initiateEmailVerification,
  verifyEmailOtp,
  initiatePhoneVerification,
  verifyPhoneOtp,
  getVerificationStatus,
  maskEmail,
  maskMobile,
  devSimulatedOtps,
};
