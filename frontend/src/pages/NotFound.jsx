import { Link } from "react-router-dom";
import { Scale, ArrowLeft, Search, HelpCircle, FileText, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-900 shadow-sm">
          <Scale className="h-10 w-10 text-blue-900" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Error 404 — Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            This Page Does Not Exist
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The page or resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Quick Nav Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <Link
            to="/legal-services"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-900 font-bold">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">All Legal Services</p>
              <p className="text-[11px] text-slate-500">Explore 19 practice areas</p>
            </div>
          </Link>

          <Link
            to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 font-bold">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Find a Lawyer</p>
              <p className="text-[11px] text-slate-500">Search verified advocates</p>
            </div>
          </Link>

          <Link
            to="/how-we-work"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">How We Work</p>
              <p className="text-[11px] text-slate-500">7-step consultation guide</p>
            </div>
          </Link>

          <Link
            to="/blogs"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-800 font-bold">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Legal Guides</p>
              <p className="text-[11px] text-slate-500">Read statutory insights</p>
            </div>
          </Link>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-3 text-xs font-bold text-white shadow hover:bg-blue-950 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
