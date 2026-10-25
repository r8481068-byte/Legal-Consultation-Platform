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

      // Store auth session
      login(result);

      // Role-aware redirection
      const userRole = result.user?.role;
      if (userRole === "lawyer") {
        navigate("/lawyer-dashboard", { replace: true });
      } else if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/my-appointments", { replace: true });
      }
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

  const getPortalInfo = () => {
    if (roleHint === "lawyer") {
      return {
        badge: "Lawyer Portal",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
        icon: Briefcase,
        heading: "Lawyer Portal Login",
        subtitle: "Access your consultations, client appointments, and bookable slots.",
      };
    }
    if (roleHint === "admin") {
      return {
        badge: "Admin Portal",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
        icon: Shield,
        heading: "Administrator Login",
        subtitle: "Platform moderation, lawyer verification, and metrics.",
      };
    }
    return {
      badge: "Client Portal",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      icon: User,
      heading: "Client Login",
      subtitle: "Sign in to book consultations, chat with advocates, and view receipts.",
    };
  };

  const portal = getPortalInfo();
  const Icon = portal.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-blue-800 hover:underline"
          >
            ← Back to Home
          </Link>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${portal.badgeColor}`}>
            <Icon className="h-3 w-3" />
            {portal.badge}
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
          {portal.heading}
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          {portal.subtitle}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-800 hover:underline"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Authenticating..." : `Login to ${portal.badge}`}
          </button>
        </form>

        {/* Portal Switching Links */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500 mb-2">Access other accounts:</p>
          <div className="flex items-center justify-center gap-3 text-xs font-semibold">
            {roleHint !== "" && (
              <Link to="/login" className="text-blue-700 hover:underline">
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
            to="/register"
            className="font-bold text-blue-800 hover:underline"
          >
            Create an Account
          </Link>
          {" · "}
          <Link
            to="/lawyer/signup"
            className="font-bold text-blue-800 hover:underline"
          >
            Apply as Lawyer
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
