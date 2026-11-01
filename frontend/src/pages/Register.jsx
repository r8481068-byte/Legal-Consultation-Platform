import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../services/authService";
import { ShieldCheck, Mail, Phone, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

      setSuccess("Account created successfully! Redirecting to login...");

      const redirectParam = searchParams.get("redirect");
      setTimeout(() => {
        navigate(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login");
      }, 900);
    } catch (err) {
      setError(err.message || "Registration failed. Please check details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
            ← Back to Home
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-900">
            <ShieldCheck className="h-3 w-3" /> Secure Client Registration
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Join LegalConnect for verified legal consultations, online video sessions, and secure case records.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-800 border border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                placeholder="Priya Sharma"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                placeholder="priya@example.com"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Indian Mobile Number *
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-600">
                🇮🇳 +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
                placeholder="9876543210"
                className="w-full rounded-r-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center space-y-2">
            <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              to={searchParams.get("redirect") ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "/login"}
              className="font-bold text-blue-800 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
