import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit password reset request.");
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
          Reset Your Password
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Enter the email address registered with your LegalConnect account to receive password reset instructions.
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
                Reset Instructions Generated
              </div>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a reset token valid for 15 minutes has been generated.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">Have a reset token?</p>
              <p>
                If you already received or retrieved your reset token, you can proceed to the reset page now.
              </p>
              <Link
                to="/reset-password"
                className="inline-block mt-2 font-bold text-blue-800 hover:underline"
              >
                Go to Reset Password Form →
              </Link>
            </div>

            <Link
              to="/login"
              className="block w-full text-center rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Send Reset Instructions"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
