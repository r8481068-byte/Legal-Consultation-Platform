const { Resend } = require("resend");
const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const RefreshToken = require("../models/RefreshToken");
const VerificationChallenge = require("../models/VerificationChallenge");
const {
  generateSixDigitOtp,
  hashOtp,
  verifyOtpHash,
  maskEmail,
  normalizeEmail,
  encryptSensitive,
  decryptSensitive,
} = require("../utils/cryptoUtils");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

const OTP_EXPIRY_MINUTES = 5;
const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// In-memory simulation map for non-production environments when live Resend API key is omitted
const devSimulatedOtps = new Map();

// Test helper to simulate email delivery failure during tests
let simulateEmailDeliveryFailure = false;

function setSimulateEmailDeliveryFailure(val) {
  simulateEmailDeliveryFailure = Boolean(val);
}

function getDevSimulatedOtp(email) {
  return devSimulatedOtps.get(normalizeEmail(email)) || null;
}

/**
 * Sends a clean, professional LegalConnect-branded email containing the OTP and expiry details.
 */
async function sendVerificationEmail({ name, email, otp }) {
  if (simulateEmailDeliveryFailure) {
    const error = new Error("Failed to send verification email (simulated delivery failure).");
    error.statusCode = 502;
    throw error;
  }

  const destination = normalizeEmail(email);
  const displayName = name ? name.trim() : "Valued User";
  const apiKey = process.env.RESEND_API_KEY;
  const isLiveKey = apiKey && apiKey.startsWith("re_") && apiKey !== "re_xxxxxxxxxxxxxxxxxxxx";

  // Resend free tier onboarding@resend.dev only allows sending to the account owner or verified domains.
  // Domains like @example.com and @test.com or test runner suites use local simulation.
  const isTestRecipient =
    destination.endsWith("@example.com") ||
    destination.endsWith("@test.com") ||
    process.env.NODE_ENV === "test";

  if (isLiveKey && !isTestRecipient) {
    try {
      const resend = new Resend(apiKey);
      const fromEmail =
        process.env.EMAIL_FROM ||
        process.env.RESEND_FROM_EMAIL ||
        "LegalConnect <onboarding@resend.dev>";

      const result = await resend.emails.send({
        from: fromEmail,
        to: [destination],
        subject: "Your LegalConnect Email Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      ⚖️ LegalConnect
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      Verified Legal Consultation Platform
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                      Verify Your Email Address
                    </h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                      Hello <strong>${displayName}</strong>,<br/>
                      Thank you for joining LegalConnect. Please use the 6-digit verification code below to verify your email address and activate your account.
                    </p>

                    <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; border: 1px dashed #cbd5e1;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; color: #1e3a8a; letter-spacing: 8px;">
                        ${otp}
                      </span>
                    </div>

                    <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
                      ⏱️ <strong>This code expires in 5 minutes</strong> and can only be used once.
                    </p>
                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
                      If you did not request this verification code, please disregard this email or contact support if you suspect unauthorized access.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                    © ${new Date().getFullYear()} LegalConnect. All rights reserved.
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      if (result.error) {
        console.error("Resend API error:", result.error.message);
        const err = new Error(
          result.error.message || "Failed to dispatch verification email via Resend"
        );
        err.statusCode = 502;
        throw err;
      }
    } catch (sendError) {
      console.error("Failed to deliver email through Resend:", sendError.message);
      if (sendError.statusCode) {
        throw sendError;
      }
      const err = new Error(
        "Failed to send email verification code. Please check email address or try again shortly."
      );
      err.statusCode = 502;
      throw err;
    }
  } else {
    // Non-production fallback / simulation store
    devSimulatedOtps.set(destination, otp);
  }

  return { delivered: true };
}

/**
 * Escapes characters for safe interpolation into HTML email content.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends a clean, professional LegalConnect-branded password reset email containing the reset link and token.
 */
async function sendPasswordResetEmail({ name, email, resetToken }) {
  if (simulateEmailDeliveryFailure) {
    const error = new Error("Failed to send password reset email (simulated delivery failure).");
    error.statusCode = 502;
    error.code = "EMAIL_DELIVERY_FAILED";
    throw error;
  }

  const destination = normalizeEmail(email);
  if (!destination) {
    const error = new Error("A valid destination email is required");
    error.statusCode = 400;
    error.code = "INVALID_EMAIL";
    throw error;
  }

  const cleanName = name ? name.trim() : "Valued User";
  const displayName = escapeHtml(cleanName);
  const safeToken = escapeHtml(resetToken);

  const apiKey = process.env.RESEND_API_KEY;
  const isLiveKey = Boolean(apiKey && apiKey.startsWith("re_") && apiKey !== "re_xxxxxxxxxxxxxxxxxxxx");
  const isProd = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";

  // Production requirement: missing or invalid email config must throw a structured error
  if (isProd && !isLiveKey) {
    const error = new Error("Email service is not configured for production environment");
    error.statusCode = 503;
    error.code = "EMAIL_CONFIG_INVALID";
    throw error;
  }

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const safeResetUrl = escapeHtml(resetUrl);

  const isTestRecipient =
    !isProd &&
    (destination.endsWith("@example.com") ||
      destination.endsWith("@test.com") ||
      isTest);

  if (isLiveKey && !isTestRecipient) {
    let result;
    try {
      const resend = new Resend(apiKey);
      const fromEmail =
        process.env.EMAIL_FROM ||
        process.env.RESEND_FROM_EMAIL ||
        "LegalConnect <onboarding@resend.dev>";

      result = await resend.emails.send({
        from: fromEmail,
        to: [destination],
        subject: "Reset Your LegalConnect Password",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      LegalConnect
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      Verified Legal Consultation Platform
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                      Password Reset Request
                    </h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                      Hello <strong>${displayName}</strong>,<br/>
                      We received a request to reset your LegalConnect account password. Click the button below to choose a new password:
                    </p>

                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${safeResetUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                        Reset My Password
                      </a>
                    </div>

                    <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
                      <strong>This link is valid for 15 minutes</strong>. If the button above does not work, copy and paste this URL into your browser:<br/>
                      <span style="font-family: monospace; font-size: 11px; color: #2563eb; word-break: break-all;">${safeResetUrl}</span>
                    </p>

                    <div style="margin: 20px 0; padding: 16px; background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1;">
                      <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Manual Reset Token:</div>
                      <div style="font-family: monospace; font-size: 12px; color: #0f172a; word-break: break-all;">${safeToken}</div>
                    </div>

                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
                      If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} LegalConnect. All rights reserved.
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (sendError) {
      console.error("Failed to deliver password reset email through Resend:", sendError.message);
      const err = new Error(sendError.message || "Failed to deliver password reset email");
      err.statusCode = 502;
      err.code = "EMAIL_DELIVERY_FAILED";
      err.cause = sendError;
      throw err;
    }

    if (result && result.error) {
      console.error("Resend API error sending password reset:", result.error.message);
      const err = new Error(
        result.error.message || "Failed to dispatch password reset email via Resend"
      );
      err.statusCode = 502;
      err.code = "EMAIL_DELIVERY_FAILED";
      throw err;
    }
  } else {
    // Development-only token/link logging when email delivery is intentionally unavailable
    if (isDev) {
      console.log(`[PASSWORD RESET DEV/SIMULATION] Token for ${destination}: ${resetToken}`);
      console.log(`[PASSWORD RESET DEV/SIMULATION] Reset Link: ${resetUrl}`);
    }
  }

  return { delivered: true };
}

/**
 * Creates or updates an active email challenge for a pending registration or existing unverified user.
 */
async function createOrUpdateEmailChallenge({
  email,
  name,
  phone,
  password,
  role = "client",
  lawyerData = null,
  existingUserId = null,
}) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  // Enforce 60-second resend cooldown
  const recentChallenge = await VerificationChallenge.findOne({
    destination: normalizedEmail,
    purpose: "email_verification",
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (recentChallenge) {
    const elapsedSeconds = Math.floor(
      (now.getTime() - new Date(recentChallenge.lastSentAt).getTime()) / 1000
    );

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = COOLDOWN_SECONDS - elapsedSeconds;
      const error = new Error(
        `Please wait ${waitTime} seconds before requesting a new verification code.`
      );
      error.statusCode = 429;
      error.retryAfter = waitTime;
      throw error;
    }
  }

  const otp = generateSixDigitOtp();
  const tokenHash = hashOtp(otp, "email_verification", normalizedEmail);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const passwordEncrypted = password ? encryptSensitive(password) : null;

  // Dispatch email FIRST. If delivery fails, this throws and no challenge is activated
  await sendVerificationEmail({
    name,
    email: normalizedEmail,
    otp,
  });

  // Expire previous active challenges for this email
  await VerificationChallenge.updateMany(
    {
      destination: normalizedEmail,
      purpose: "email_verification",
      consumedAt: null,
    },
    { $set: { consumedAt: now } }
  );

  await VerificationChallenge.create({
    user: existingUserId || null,
    purpose: "email_verification",
    destination: normalizedEmail,
    tokenHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resendCount: recentChallenge ? recentChallenge.resendCount + 1 : 0,
    lastSentAt: now,
    consumedAt: null,
    pendingRegistration: {
      name: name ? name.trim() : null,
      phone: phone ? phone.trim() : null,
      role: role === "lawyer" ? "lawyer" : "client",
      passwordEncrypted,
      lawyerData,
    },
  });

  return {
    success: true,
    verificationRequired: true,
    message: "Verification code sent to your email address.",
    email: normalizedEmail,
    destination: maskEmail(normalizedEmail),
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    cooldownSeconds: COOLDOWN_SECONDS,
  };
}

/**
 * Verifies submitted Email OTP.
 * On success:
 * - If pending registration: creates User (with emailVerified: true, phoneVerified: false, isActive: true)
 * - If existing unverified user: marks emailVerified: true
 * - Issues JWT session tokens
 */
async function verifyEmailOtpService({ email, otp }) {
  if (!email || typeof email !== "string") {
    const error = new Error("Email address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!otp || typeof otp !== "string") {
    const error = new Error("Verification code is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const cleanOtp = otp.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    const error = new Error("Verification code must be exactly 6 digits");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  // Retrieve latest unconsumed challenge for this email
  const challenge = await VerificationChallenge.findOne({
    destination: normalizedEmail,
    purpose: "email_verification",
    consumedAt: null,
  })
    .select("+tokenHash +pendingRegistration.passwordEncrypted")
    .sort({ createdAt: -1 });

  if (!challenge) {
    const error = new Error(
      "No active verification challenge found. Please request a new code."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (now > new Date(challenge.expiresAt)) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Verification code has expired. Please request a new one."
    );
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (challenge.attempts >= challenge.maxAttempts) {
    challenge.consumedAt = now;
    await challenge.save();
    const error = new Error(
      "Maximum verification attempts exceeded. Please request a new code."
    );
    error.statusCode = 429;
    throw error;
  }

  // Verify HMAC hash
  const isValid = verifyOtpHash(
    cleanOtp,
    "email_verification",
    normalizedEmail,
    challenge.tokenHash
  );

  if (!isValid) {
    challenge.attempts += 1;
    await challenge.save();
    const remaining = challenge.maxAttempts - challenge.attempts;
    const msg =
      remaining > 0
        ? `Invalid verification code. ${remaining} attempt(s) remaining.`
        : "Invalid verification code. Maximum attempts reached. Please request a new code.";
    const error = new Error(msg);
    error.statusCode = 400;
    throw error;
  }

  // OTP is valid - consume challenge immediately (one-time use)
  challenge.consumedAt = now;
  await challenge.save();

  let user = null;

  if (challenge.user) {
    // Existing user (e.g. provisioned admin or existing unverified user)
    user = await User.findById(challenge.user);
    if (!user) {
      const error = new Error("User account not found");
      error.statusCode = 404;
      throw error;
    }

    user.emailVerified = true;
    user.isVerified = user.role === "admin" ? true : user.isVerified;
    await user.save();
  } else {
    // Check if an account was already created for this email in the meantime
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      existingUser.emailVerified = true;
      await existingUser.save();
      user = existingUser;
    } else {
      // Pending registration flow: create actual user account now
      const { name, phone, role, passwordEncrypted, lawyerData } =
        challenge.pendingRegistration || {};

      if (!passwordEncrypted) {
        const error = new Error(
          "Registration session expired. Please submit registration again."
        );
        error.statusCode = 400;
        throw error;
      }

      const plainPassword = decryptSensitive(passwordEncrypted);
      if (!plainPassword) {
        const error = new Error(
          "Failed to process registration credentials securely. Please re-register."
        );
        error.statusCode = 500;
        throw error;
      }

      user = new User({
        name,
        email: normalizedEmail,
        password: plainPassword, // Handled by pre-save bcrypt hook in User.js
        phone,
        role: role === "lawyer" ? "lawyer" : "client",
        emailVerified: true,
        phoneVerified: false,
        isVerified: false,
        isActive: true,
      });

      await user.save();

      // If lawyer data was supplied, create Lawyer application record
      if (lawyerData && typeof lawyerData === "object") {
        try {
          await Lawyer.create({
            user: user._id,
            barCouncilId: lawyerData.barCouncilId || `PND/${Date.now()}`,
            stateOfEnrolment: lawyerData.stateOfEnrolment || "Bar Council of Delhi",
            city: lawyerData.city || "New Delhi",
            experienceYears: Number(lawyerData.experienceYears) || 1,
            consultationFee: Number(lawyerData.consultationFee) || 500,
            specialization: lawyerData.specialization || ["Civil Litigation"],
            languages: lawyerData.languages || ["English", "Hindi"],
            bio: lawyerData.bio || "Advocate profile awaiting verification.",
            lawCollege: lawyerData.lawCollege || "Law College",
            graduationYear: Number(lawyerData.graduationYear) || 2020,
            consultationModes: lawyerData.consultationModes || ["video"],
            education: lawyerData.education || [],
            verificationDocuments: lawyerData.verificationDocuments || [],
            verificationStatus: "pending",
            isAvailable: false,
          });
        } catch (lawyerErr) {
          console.error("Failed to initialize lawyer profile from challenge:", lawyerErr.message);
        }
      }
    }
  }

  // Issue authentication tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    success: true,
    message: "Email verified successfully! You are now logged in.",
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: true,
      phoneVerified: Boolean(user.phoneVerified),
      isVerified: Boolean(user.isVerified),
      isActive: Boolean(user.isActive),
    },
  };
}

/**
 * Resends an email OTP for an existing pending registration or unverified user.
 */
async function resendEmailOtpService({ email }) {
  if (!email || typeof email !== "string") {
    const error = new Error("Email address is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);

  // Check if unverified user exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.emailVerified) {
    return {
      success: true,
      alreadyVerified: true,
      message: "Email is already verified. You can log in directly.",
    };
  }

  // Find latest challenge
  const latestChallenge = await VerificationChallenge.findOne({
    destination: normalizedEmail,
    purpose: "email_verification",
  })
    .select("+pendingRegistration.passwordEncrypted")
    .sort({ createdAt: -1 });

  if (!latestChallenge && !existingUser) {
    const error = new Error(
      "No pending registration or account found for this email address."
    );
    error.statusCode = 404;
    throw error;
  }

  // Prepare parameters for new challenge
  const name =
    latestChallenge?.pendingRegistration?.name || existingUser?.name || "User";
  const phone =
    latestChallenge?.pendingRegistration?.phone || existingUser?.phone || "";
  const role =
    latestChallenge?.pendingRegistration?.role || existingUser?.role || "client";
  const passwordEncrypted =
    latestChallenge?.pendingRegistration?.passwordEncrypted || null;
  const plainPassword = passwordEncrypted ? decryptSensitive(passwordEncrypted) : null;
  const lawyerData = latestChallenge?.pendingRegistration?.lawyerData || null;
  const existingUserId = existingUser ? existingUser._id : null;

  return await createOrUpdateEmailChallenge({
    email: normalizedEmail,
    name,
    phone,
    password: plainPassword,
    role,
    lawyerData,
    existingUserId,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  createOrUpdateEmailChallenge,
  verifyEmailOtpService,
  resendEmailOtpService,
  getDevSimulatedOtp,
  setSimulateEmailDeliveryFailure,
};
