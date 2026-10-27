import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  requestEmailOtp,
  verifyEmailOtp,
  requestPhoneOtp,
  verifyPhoneOtp,
  getVerificationStatus,
} from "../services/authService";
import {
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve pending user from navigation state or sessionStorage
  const [targetUser, setTargetUser] = useState(() => {
    if (location.state?.user) return location.state.user;
    try {
      const saved = sessionStorage.getItem("pendingVerificationUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("email"); // "email" | "phone"
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [emailVerified, setEmailVerified] = useState(
    Boolean(targetUser?.emailVerified)
  );
  const [phoneVerified, setPhoneVerified] = useState(
    Boolean(targetUser?.phoneVerified)
  );

  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devHint, setDevHint] = useState("");

  const timerRef = useRef(null);

  // Load fresh verification status on mount
  useEffect(() => {
    async function loadStatus() {
      if (!targetUser?.id) return;
      try {
        const res = await getVerificationStatus(targetUser.id);
        if (res) {
          setEmailVerified(Boolean(res.emailVerified));
          setPhoneVerified(Boolean(res.phoneVerified));

          if (res.emailVerified && !res.phoneVerified) {
            setActiveTab("phone");
          }
        }
      } catch {
        // Fallback to local state
      }
    }

    loadStatus();
  }, [targetUser?.id]);

  // Handle cooldown countdowns
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setEmailCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setPhoneCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Set initial hint if provided in navigation state
  useEffect(() => {
    if (location.state?.emailChallenge?.devOtpHint) {
      setDevHint(`Demo Email OTP: ${location.state.emailChallenge.devOtpHint}`);
    } else if (location.state?.phoneChallenge?.devOtpHint) {
      setDevHint(`Demo SMS OTP: ${location.state.phoneChallenge.devOtpHint}`);
    }
  }, [location.state]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (emailOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await verifyEmailOtp({
        userId: targetUser?.id,
        otp: emailOtp.trim(),
      });

      setEmailVerified(true);
      setSuccessMsg("Email verified successfully!");
      setDevHint("");

      // Update stored target user
      if (targetUser) {
        const updated = { ...targetUser, emailVerified: true };
        setTargetUser(updated);
        sessionStorage.setItem("pendingVerificationUser", JSON.stringify(updated));
      }

      // If phone is not verified, switch tab automatically
      if (!phoneVerified) {
        setTimeout(() => {
          setActiveTab("phone");
          setSuccessMsg("");
        }, 1200);
      }
    } catch (err) {
      setError(err.message || "Email verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (phoneOtp.length !== 6) {
      setError("Please enter the complete 6-digit mobile verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await verifyPhoneOtp({
        userId: targetUser?.id,
        otp: phoneOtp.trim(),
      });

      setPhoneVerified(true);
      setSuccessMsg("Mobile number verified successfully!");
      setDevHint("");

      if (targetUser) {
        const updated = { ...targetUser, phoneVerified: true };
        setTargetUser(updated);
        sessionStorage.setItem("pendingVerificationUser", JSON.stringify(updated));
      }
    } catch (err) {
      setError(err.message || "Mobile verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (emailCooldown > 0 || resending) return;

    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await requestEmailOtp({
        userId: targetUser?.id,
        email: targetUser?.email,
      });

      setEmailCooldown(res.cooldownSeconds || 60);
      setSuccessMsg(res.message || "A new email verification code has been sent.");
      if (res.devOtpHint) {
        setDevHint(`Demo Email OTP: ${res.devOtpHint}`);
      }
    } catch (err) {
      setError(err.message || "Failed to resend email OTP.");
      if (err.data?.retryAfter) {
        setEmailCooldown(err.data.retryAfter);
      }
    } finally {
      setResending(false);
    }
  };

  const handleResendPhone = async () => {
    if (phoneCooldown > 0 || resending) return;

    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await requestPhoneOtp({
        userId: targetUser?.id,
        phone: targetUser?.phone,
      });

      setPhoneCooldown(res.cooldownSeconds || 60);
      setSuccessMsg(res.message || "A new mobile verification code has been sent.");
      if (res.devOtpHint) {
        setDevHint(`Demo Mobile OTP: ${res.devOtpHint}`);
      }
    } catch (err) {
      setError(err.message || "Failed to resend mobile OTP.");
      if (err.data?.retryAfter) {
        setPhoneCooldown(err.data.retryAfter);
      }
    } finally {
      setResending(false);
    }
  };

  const allVerified = emailVerified && phoneVerified;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link to="/login" className="text-xs font-bold text-blue-800 hover:underline">
            ← Back to Login
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-900">
            <ShieldCheck className="h-3 w-3" /> Account Verification Gate
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
          Verify your account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          To maintain security and trust across LegalConnect, verify both your email address and Indian mobile number.
        </p>

        {/* Verification Status Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div
            onClick={() => setActiveTab("email")}
            className={`cursor-pointer rounded-2xl border p-3.5 transition ${
              activeTab === "email"
                ? "border-blue-700 bg-blue-50/50 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-blue-700" /> Email OTP
              </span>
              {emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pending
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 truncate">
              {targetUser?.email || "Email address"}
            </p>
          </div>

          <div
            onClick={() => setActiveTab("phone")}
            className={`cursor-pointer rounded-2xl border p-3.5 transition ${
              activeTab === "phone"
                ? "border-blue-700 bg-blue-50/50 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-700" /> Mobile OTP
              </span>
              {phoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pending
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 truncate">
              {targetUser?.phone || "Mobile number"}
            </p>
          </div>
        </div>

        {/* Global Alerts */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-800 border border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {devHint && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs font-mono text-indigo-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{devHint}</span>
          </div>
        )}

        {/* ALL VERIFIED BANNER */}
        {allVerified ? (
          <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Contact Verification Complete!
              </h3>
              <p className="mt-1 text-xs text-emerald-800 max-w-sm mx-auto">
                Both your email address and mobile number are verified. You can now log in securely and complete your client profile.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-800 shadow-sm"
              >
                Continue to Login <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* EMAIL OTP TAB */}
            {activeTab === "email" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-blue-700" /> Step 1: Email Verification
                  </h3>
                  <span className="text-[11px] text-slate-500">Delivered via Resend</span>
                </div>

                {emailVerified ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-emerald-900">
                      Email address is successfully verified!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("phone")}
                      className="mt-3 text-xs font-bold text-blue-800 hover:underline"
                    >
                      Proceed to Mobile Verification →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Enter 6-Digit Email Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        autoFocus
                        required
                        className="w-full text-center tracking-[8px] text-xl font-bold font-mono rounded-xl border border-slate-300 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Check your inbox or spam folder for the code sent to {targetUser?.email || "your email"}.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={emailCooldown > 0 || resending}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:underline disabled:text-slate-400 disabled:no-underline"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                        {emailCooldown > 0
                          ? `Resend in ${emailCooldown}s`
                          : resending
                          ? "Sending..."
                          : "Resend Email OTP"}
                      </button>

                      <button
                        type="submit"
                        disabled={loading || emailOtp.length !== 6}
                        className="rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify Email"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* MOBILE OTP TAB */}
            {activeTab === "phone" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-700" /> Step 2: Mobile Verification
                  </h3>
                  <span className="text-[11px] text-slate-500">Delivered via MSG91</span>
                </div>

                {phoneVerified ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-emerald-900">
                      Mobile number is successfully verified!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyPhone} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Enter 6-Digit SMS Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        autoFocus
                        required
                        className="w-full text-center tracking-[8px] text-xl font-bold font-mono rounded-xl border border-slate-300 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Enter the verification code sent to {targetUser?.phone || "your mobile"}.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleResendPhone}
                        disabled={phoneCooldown > 0 || resending}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:underline disabled:text-slate-400 disabled:no-underline"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                        {phoneCooldown > 0
                          ? `Resend in ${phoneCooldown}s`
                          : resending
                          ? "Sending..."
                          : "Resend SMS OTP"}
                      </button>

                      <button
                        type="submit"
                        disabled={loading || phoneOtp.length !== 6}
                        className="rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify Mobile"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
