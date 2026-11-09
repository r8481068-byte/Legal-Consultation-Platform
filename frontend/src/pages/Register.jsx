import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../services/authService";
import {
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  User,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Scale,
  Award,
  CalendarCheck,
  CreditCard,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get("role") || searchParams.get("type");
  const [activeRole, setActiveRole] = useState(
    roleParam === "lawyer" || roleParam === "advocate" ? "lawyer" : "client",
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectParam = searchParams.get("redirect") || "/lawyers";

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      return "Full name must be between 2 and 50 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please provide a valid email address.";
    }

    const cleanedPhone = formData.phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(?:\+91|91|0)?([6-9]\d{9})$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Confirm password does not match password.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "client",
      };

      await registerUser(payload);

      setSuccess(
        "Account created successfully! Redirecting to login to verify and access your destination...",
      );
      setTimeout(() => {
        navigate(
          `/login?role=client&redirect=${encodeURIComponent(redirectParam)}`,
        );
      }, 1400);
    } catch (err) {
      setError(err.message || "Registration failed. Please check details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-[#2457D6] hover:underline"
          >
            ← Back to Home
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#2457D6]">
            <ShieldCheck className="h-3.5 w-3.5" /> BCI Compliant Platform
          </span>
        </div>

        {/* Brand Header */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B132B] text-white shadow-2xs shrink-0">
            <Scale className="h-5 w-5 text-[#D9A441]" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-slate-500">
              Select your role to get started on LegalConnect
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TWO PROMINENT ACCOUNT OPTIONS: Option 1 Client / Option 2 Advocate */}
        {/* ============================================================== */}
        <div className="mt-6 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveRole("client")}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeRole === "client"
                ? "bg-[#2457D6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Option 1</span>
            </div>
            <span className="text-[11px] font-extrabold mt-0.5">
              Register as Client
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("lawyer")}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeRole === "lawyer"
                ? "bg-[#0B132B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-[#D9A441]" />
              <span>Option 2</span>
            </div>
            <span className="text-[11px] font-extrabold mt-0.5">
              Register as Advocate
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* OPTION 1: CLIENT REGISTRATION FORM                             */}
        {/* ============================================================== */}
        {activeRole === "client" ? (
          <div className="mt-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-slate-700 leading-relaxed mb-4">
              <p className="font-bold text-[#1D4ED8]">
                For Clients Seeking Legal Counsel:
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Find verified advocates, search by legal specialization, inspect
                verified open slots, and schedule consultations.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                >
                  Full Legal Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    minLength={2}
                    maxLength={50}
                    autoComplete="name"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                >
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                    placeholder="9876543210 (10 digits)"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      autoComplete="new-password"
                      required
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={6}
                      autoComplete="new-password"
                      required
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2457D6] py-3 text-xs font-bold uppercase tracking-wide text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
              >
                <span>
                  {loading ? "Creating Account..." : "Create Client Account"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          /* ============================================================== */
          /* OPTION 2: ADVOCATE REGISTRATION INFORMATION & LINK             */
          /* ============================================================== */
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-slate-800 leading-relaxed space-y-2">
              <p className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#D9A441]" />
                For Advocates & Legal Counsel:
              </p>
              <p className="text-slate-700 text-xs">
                Join India’s premier verified LegalTech marketplace. Build your
                digital chamber profile, set your consultation fee, publish
                availability slots, and consult clients securely.
              </p>
              <div className="pt-2 grid grid-cols-1 gap-2 border-t border-amber-200/80 text-[11px]">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>State Bar Council Enrolment ID verification</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    Integrated calendar slot scheduling & WebRTC video
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCard className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>Autonomous consultation pricing & direct payouts</span>
                </div>
              </div>
            </div>

            <Link
              to="/lawyer/signup"
              className="w-full rounded-xl bg-[#0B132B] py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>Proceed to Advocate Registration Form</span>
              <ArrowRight className="h-4 w-4 text-[#D9A441]" />
            </Link>

            <p className="text-[11px] text-center text-slate-500">
              Registration requires your Bar Council certificate and law degree
              for administrative review.
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* ALREADY HAVE AN ACCOUNT? LOGIN (CLIENT AND ADVOCATE)           */}
        {/* ============================================================== */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2.5">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Already have an account? Login
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to={
                redirectParam
                  ? `/login?role=client&redirect=${encodeURIComponent(redirectParam)}`
                  : "/login?role=client"
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-[#2457D6] hover:bg-blue-100 transition shadow-2xs"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login as Client</span>
            </Link>
            <Link
              to="/login?role=lawyer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-amber-700" />
              <span>Login as Advocate</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
