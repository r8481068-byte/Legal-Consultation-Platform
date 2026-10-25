import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
  Calendar,
  Briefcase,
  ShieldCheck,
  User,
  Settings,
  ArrowRight,
  Search,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
                  {user?.role ? user.role.toUpperCase() : "CLIENT"} PORTAL
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome back, {user?.name || "Client"}!
                </h1>
                <p className="mt-2 text-sm text-blue-200 max-w-md">
                  Access your scheduled legal appointments, communicate with counsel, and track consultations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
                >
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Role Navigation Cards */}
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user?.role === "client" && (
              <>
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      My Consultations
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      View your booked sessions, confirm status, join online video meetings, and review past legal advice.
                    </p>
                  </div>
                  <Link
                    to="/my-appointments"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                  >
                    Open Appointments <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                      <Search className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      Find Advocates
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Search certified lawyers by specialization, city, experience, ratings, and book available calendar slots.
                    </p>
                  </div>
                  <Link
                    to="/lawyers"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                  >
                    Browse Directory <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      Are you a Lawyer?
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Apply for verified advocate status to publish your public profile, set consultation fees, and accept clients.
                    </p>
                  </div>
                  <Link
                    to="/lawyers"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                  >
                    View Community <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </>
            )}

            {user?.role === "lawyer" && (
              <>
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      Lawyer Dashboard
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Manage client booking requests, confirm upcoming sessions, and host video consultations.
                    </p>
                  </div>
                  <Link
                    to="/lawyer-dashboard"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                  >
                    Launch Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                      Manage Availability
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Open 30-minute bookable consultation slots on your calendar for prospective clients.
                    </p>
                  </div>
                  <Link
                    to="/lawyer-dashboard"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                  >
                    Manage Slots <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </>
            )}

            {user?.role === "admin" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between sm:col-span-2 lg:col-span-3">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-900">
                    Administrator Control Center
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Verify advocate applications, manage user accounts, oversee payments, handle refunds, and moderate client reviews.
                  </p>
                </div>
                <Link
                  to="/admin"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline"
                >
                  Enter Admin Portal <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )}
          </section>

          {/* Account Details Overview */}
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-900" />
              Account Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Account Name</span>
                <p className="font-bold text-slate-900 mt-1 text-sm">{user?.name || "Client"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <p className="font-bold text-slate-900 mt-1 text-sm truncate">{user?.email || "—"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Role</span>
                <p className="font-bold text-blue-900 mt-1 text-sm capitalize">{user?.role || "client"}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {profileModalOpen && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
