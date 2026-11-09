import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Scale,
  ShieldCheck,
  Lock,
  UserPlus,
  LogIn,
  Video,
  FileCheck,
  PhoneCall,
  ArrowRight,
} from "lucide-react";

export default function TalkToLawyerGate() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Immediate role and authentication enforcement
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/register?redirect=/lawyers", { replace: true });
    } else if (user?.role === "lawyer") {
      navigate("/lawyer-dashboard?restricted=booking", { replace: true });
    } else {
      navigate("/lawyers", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-900 transition"
          >
            ← Back to Home
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
            <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
            Talk To A Lawyer
          </span>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 text-white text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 mb-4">
              <Scale className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
              Authentication Required
            </span>
            <h1 className="text-2xl font-black sm:text-3xl">
              Consult a Verified Advocate
            </h1>
            <p className="mt-3 text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
              An account is required to consult a lawyer on LegalConnect. To protect advocate–client privilege, facilitate secure video consultations, and store case records safely, please create an account or sign in to continue.
            </p>
          </div>

          {/* Action Options */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Option 1: Create Account / Register */}
              <Link
                to="/register?redirect=/lawyers"
                id="btn-gate-register"
                className="group flex flex-col justify-between rounded-2xl border-2 border-blue-900/20 bg-blue-50/40 p-5 transition duration-150 hover:border-blue-900 hover:bg-blue-50 hover:shadow-md"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white mb-3 shadow-xs">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-900">
                    Create Account / Register
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    New to LegalConnect? Create your free client account in 30 seconds to connect with approved advocates.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                  <span>Register Free</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Option 2: Login */}
              <Link
                to="/login?redirect=/lawyers"
                id="btn-gate-login"
                className="group flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 transition duration-150 hover:border-amber-400 hover:bg-amber-50/20 hover:shadow-md"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 mb-3 shadow-xs">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-950">
                    Login to Existing Account
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Already registered? Sign in with your email or mobile number to access your consultation dashboard.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </div>

            {/* Platform Safeguards */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Why Sign In with LegalConnect?
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Bar Council Verified:</strong> Practicing advocates with valid state council enrolment.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Privileged & Confidential:</strong> Secure consultations and authenticated case documents.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Video className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Encrypted Video:</strong> Direct browser consultations with waiting room preview.</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Transparent Fees:</strong> Advocate-fixed pricing with server-verified invoices.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
