import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { Scale, Briefcase, Shield, User } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get("role") || "";
  const { login } = useAuth();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSuccessfulLogin(result) {
    login(result);

    // Role-aware redirection
    const redirectParam = searchParams.get("redirect");
    const userRole = result.user?.role;
    if (redirectParam && userRole === "client") {
      navigate(redirectParam, { replace: true });
    } else if (userRole === "lawyer") {
      navigate("/lawyer-dashboard", { replace: true });
    } else if (userRole === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!result || !result.accessToken) {
        throw new Error("Login response did not contain an access token.");
      }

      handleSuccessfulLogin(result);
    } catch (err) {
      const isNetworkError =
        (err.name === "TypeError" &&
          typeof err.message === "string" &&
          err.message.toLowerCase().includes("fetch")) ||
        err.message?.includes("Failed to fetch");

      const displayMessage = isNetworkError
        ? "Unable to reach the authentication server. Please verify the backend is running."
        : err.message || "Login failed. Please check your credentials.";

      setError(displayMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }

  // Portal branding configurations
  const portalConfig = {
    lawyer: {
      heading: "Advocate Portal",
      subtitle: "Sign in to manage client bookings, manage availability, and conduct legal consultations.",
      badge: "Advocate Access",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
      icon: Briefcase,
    },
    admin: {
      heading: "System Administration",
      subtitle: "Secure administration portal for verifying advocates, tracking dispute tickets, and system governance.",
      badge: "Administrator Portal",
      badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
      icon: Shield,
    },
    default: {
      heading: "Sign in to LegalConnect",
      subtitle: "Access verified advocates, online video consultations, and your legal document repository.",
      badge: "Client Portal",
      badgeColor: "bg-blue-50 text-blue-900 border-blue-200",
      icon: User,
    },
  };

  const portal = portalConfig[roleHint] || portalConfig.default;
  const Icon = portal.icon;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-[#2457D6] hover:underline"
          >
            ← Back to Home
          </Link>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${portal.badgeColor}`}>
            <Icon className="h-3 w-3" />
            {portal.badge}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B132B] text-white shadow-2xs">
            <Scale className="h-5 w-5 text-[#D9A441]" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
              {portal.heading}
            </h1>
            <p className="text-xs text-slate-500">
              Bar Council of India Compliant
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed">
          {portal.subtitle}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[11px] font-bold text-slate-700 uppercase tracking-wide"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#2457D6] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#2457D6] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2457D6] py-3 text-xs font-bold uppercase tracking-wide text-white shadow-2xs hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            {loading ? "Authenticating..." : `Login to ${portal.badge}`}
          </button>
        </form>

        {/* Portal Switching Links */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Switch Portal:</p>
          <div className="flex items-center justify-center gap-3 text-xs font-semibold">
            {roleHint !== "" && (
              <Link to="/login" className="text-[#2457D6] hover:underline">
                Client
              </Link>
            )}
            {roleHint !== "lawyer" && (
              <Link to="/login?role=lawyer" className="text-amber-800 hover:underline">
                Lawyer
              </Link>
            )}
            {roleHint !== "admin" && (
              <Link to="/login?role=admin" className="text-emerald-800 hover:underline">
                Admin
              </Link>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          New client?{" "}
          <Link
            to={searchParams.get("redirect") ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "/register"}
            className="font-bold text-[#2457D6] hover:underline"
          >
            Create an Account
          </Link>
          {" · "}
          <Link
            to="/lawyer/signup"
            className="font-bold text-[#2457D6] hover:underline"
          >
            Apply as Advocate
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
