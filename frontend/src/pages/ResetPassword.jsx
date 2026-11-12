import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Scale, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { resetPasswordWithToken } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!token.trim()) {
      setError("Please provide a valid reset token.");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken({
        token: token.trim(),
        password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The token may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-900">
            <Scale className="h-3 w-3" /> LegalConnect
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900">
          Set New Password
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Enter your 15-minute reset token along with your new account password.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                Password Reset Successfully
              </div>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                Your password has been securely updated. You can now log into your account with your new credentials.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="token"
                className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Reset Token
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Paste your 64-character reset token or click link from email"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs font-mono outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating Password..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
