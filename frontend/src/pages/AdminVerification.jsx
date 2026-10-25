import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getAdminMetrics,
  getPendingLawyers,
  verifyLawyer,
  getAdminUsers,
  toggleUserStatus,
  getAdminAppointments,
  getAdminPayments,
  processRefund
} from "../services/adminService";
import { adminGetReviews, adminModerateReview } from "../services/reviewService";
import Navbar from "../components/Navbar";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
  ShieldAlert,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  FileText
} from "lucide-react";

export default function AdminVerification() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "verifications" | "users" | "appointments" | "payments" | "reviews"

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Loading & feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // 1. Load Overview Metrics
  const loadMetrics = useCallback(async () => {
    try {
      const res = await getAdminMetrics();
      setMetrics(res.metrics);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 2. Load Pending Lawyers
  const loadPendingLawyers = useCallback(async () => {
    try {
      const res = await getPendingLawyers();
      setLawyers(res.lawyers || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 3. Load Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    }
  }, [userSearch, userRoleFilter]);

  // 4. Load Appointments
  const loadAppointments = useCallback(async () => {
    try {
      const res = await getAdminAppointments({
        status: appointmentStatusFilter,
      });
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error(err);
    }
  }, [appointmentStatusFilter]);

  // 5. Load Payments
  const loadPayments = useCallback(async () => {
    try {
      const res = await getAdminPayments({
        status: paymentStatusFilter,
      });
      setPayments(res.payments || []);
    } catch (err) {
      console.error(err);
    }
  }, [paymentStatusFilter]);

  // 6. Load Reviews
  const loadReviews = useCallback(async () => {
    try {
      const res = await adminGetReviews();
      setReviews(res.reviews || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadMetrics(),
      loadPendingLawyers(),
      loadUsers(),
      loadAppointments(),
      loadPayments(),
      loadReviews(),
    ]).finally(() => setLoading(false));
  }, [loadMetrics, loadPendingLawyers, loadUsers, loadAppointments, loadPayments, loadReviews]);

  // Lawyer Verification Action
  const handleVerifyLawyer = async (lawyerId, status) => {
    let reason = "";
    if (status === "rejected") {
      const input = window.prompt(
        "Enter the reason for rejecting this application:",
        "Bar Council credentials could not be verified against the official roll."
      );
      if (input === null) return;
      reason = input.trim();
    } else if (status === "additional_info_required") {
      const input = window.prompt(
        "Enter specific correction instructions for the applicant:",
        "Please re-upload a clear, uncropped copy of your State Bar Council Certificate of Practice."
      );
      if (input === null) return;
      reason = input.trim();
    } else {
      if (!window.confirm("Are you sure you want to approve this lawyer? They will immediately become publicly discoverable to clients.")) {
        return;
      }
    }

    try {
      setProcessingId(lawyerId);
      setError("");
      setMessage("");
      const res = await verifyLawyer(lawyerId, status, reason);
      setLawyers((prev) => prev.filter((l) => l._id !== lawyerId));
      setMessage(res.message || `Lawyer application status updated to ${status}.`);
      loadMetrics();
    } catch (err) {
      setError(err.message || `Failed to update lawyer verification.`);
    } finally {
      setProcessingId("");
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId) => {
    try {
      setProcessingId(userId);
      setError("");
      setMessage("");
      const res = await toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: res.isActive } : u))
      );
      setMessage(res.message);
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    } finally {
      setProcessingId("");
    }
  };

  // Process Refund Action
  const handleRefund = async (paymentId) => {
    const reason = window.prompt("Enter reason for refund:", "Administrative resolution");
    if (reason === null) return;

    try {
      setProcessingId(paymentId);
      setError("");
      setMessage("");
      const res = await processRefund(paymentId, reason);
      setPayments((prev) =>
        prev.map((p) => (p._id === paymentId ? { ...p, status: "refunded" } : p))
      );
      setMessage(res.message || "Refund processed.");
      loadMetrics();
    } catch (err) {
      setError(err.message || "Failed to process refund.");
    } finally {
      setProcessingId("");
    }
  };

  // Moderate Review Action
  const handleModerateReview = async (reviewId, newStatus) => {
    try {
      setProcessingId(reviewId);
      setError("");
      setMessage("");
      await adminModerateReview(reviewId, newStatus, "Administrator moderation");
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
      setMessage(`Review status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || "Failed to moderate review.");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Platform Administration Portal
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Oversight of users, lawyer credentials, appointments, financial settlements, and review integrity.
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "overview", label: "Overview Metrics", icon: TrendingUp },
              { id: "verifications", label: "Lawyer Verifications", icon: UserCheck, count: lawyers.length },
              { id: "users", label: "User Accounts", icon: Users, count: users.length },
              { id: "appointments", label: "Appointments", icon: Calendar, count: appointments.length },
              { id: "payments", label: "Payments & Refunds", icon: CreditCard, count: payments.length },
              { id: "reviews", label: "Review Moderation", icon: Star, count: reviews.length },
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === id
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.2 text-xs font-bold ${
                      activeTab === id ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <section className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics?.users?.total ?? 0}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics?.users?.clients ?? 0} Clients • {metrics?.users?.lawyers ?? 0} Lawyers
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Applications</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-600">
                    {metrics?.lawyerVerifications?.pending ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics?.lawyerVerifications?.approved ?? 0} Approved Advocates
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Appointments</p>
                  <p className="mt-2 text-3xl font-extrabold text-blue-700">{metrics?.appointments?.total ?? 0}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics?.appointments?.completed ?? 0} Completed • {metrics?.appointments?.confirmed ?? 0} Active
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue (10%)</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                    ₹{(metrics?.financials?.platformRevenueRupees ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Gross Volume: ₹{(metrics?.financials?.grossVolumeRupees ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Action summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-amber-600" />
                    Pending Lawyer Applications ({lawyers.length})
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Lawyers awaiting administrative review before they can accept consultation bookings.
                  </p>
                  <div className="mt-4">
                    {lawyers.slice(0, 3).map((l) => (
                      <div key={l._id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{l.user?.name || "Lawyer"}</p>
                          <p className="text-slate-500">{l.city} • {l.experienceYears} yrs experience</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("verifications")}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Review →
                        </button>
                      </div>
                    ))}
                    {lawyers.length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">No pending applications</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Recent Transactions ({payments.length})
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest consultation fee charges and settlement statuses.
                  </p>
                  <div className="mt-4">
                    {payments.slice(0, 3).map((p) => (
                      <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{p.client?.name || "Client"}</p>
                          <p className="text-slate-500">₹{Math.round(p.amount / 100)} • {p.status}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("payments")}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Inspect →
                        </button>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded yet</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: LAWYER VERIFICATIONS */}
          {activeTab === "verifications" && (
            <section className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Applications Awaiting Review ({lawyers.length})
                </h2>
                <button
                  type="button"
                  onClick={loadPendingLawyers}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Refresh Applications
                </button>
              </div>

              {lawyers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
                  <p className="mt-2 text-base font-bold text-slate-800">All applications processed</p>
                  <p className="mt-1 text-xs text-slate-500">No pending lawyer applications at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lawyers.map((lawyer) => {
                    const applicant = lawyer.user || {};
                    const specializations = Array.isArray(lawyer.specialization)
                      ? lawyer.specialization
                      : [lawyer.specialization].filter(Boolean);

                    return (
                      <article
                        key={lawyer._id}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {applicant.name || "Applicant Name"}
                            </h3>
                            <p className="text-xs text-slate-600">{applicant.email}</p>
                            <p className="mt-1 text-[11px] font-mono text-slate-400">
                              App ID: {lawyer._id}
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold capitalize text-amber-800">
                            {lawyer.verificationStatus || "pending"}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4 text-xs">
                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">Bar Council ID</span>
                            <p className="font-mono font-bold text-blue-900 mt-0.5">
                              {lawyer.barCouncilId || "Pending Verification"}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">State Bar Council</span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {lawyer.stateOfEnrolment || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">City / Jurisdiction</span>
                            <p className="font-semibold text-slate-900 mt-0.5">{lawyer.city || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">Experience</span>
                            <p className="font-semibold text-slate-900 mt-0.5">{lawyer.experienceYears ?? 0} years</p>
                          </div>
                        </div>

                        {/* Education & Modes */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">Education & College</span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {lawyer.education?.[0]?.degree || "LL.B."}
                              {lawyer.lawCollege || lawyer.education?.[0]?.institution ? ` • ${lawyer.lawCollege || lawyer.education?.[0]?.institution}` : ""}
                              {lawyer.graduationYear || lawyer.education?.[0]?.year ? ` (${lawyer.graduationYear || lawyer.education?.[0]?.year})` : ""}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">Consultation Fee</span>
                            <p className="font-bold text-blue-900 mt-0.5">
                              ₹{Number(lawyer.consultationFee || 0).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400">Consultation Modes</span>
                            <p className="font-semibold text-slate-900 mt-0.5 capitalize">
                              {Array.isArray(lawyer.consultationModes) ? lawyer.consultationModes.join(", ") : "Video, In-Person"}
                            </p>
                          </div>
                        </div>

                        {/* Specializations */}
                        <div className="mt-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Specializations</span>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {specializations.map((spec, i) => (
                              <span key={i} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-800 border border-blue-100">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Verification Documents */}
                        {Array.isArray(lawyer.verificationDocuments) && lawyer.verificationDocuments.length > 0 && (
                          <div className="mt-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification Documents</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {lawyer.verificationDocuments.map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 transition"
                                >
                                  <FileText className="h-3.5 w-3.5 text-blue-800" />
                                  <span>{doc.title || `Document ${idx + 1}`}</span>
                                  <ExternalLink className="h-3 w-3 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {lawyer.bio && (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
                            <span className="font-bold uppercase tracking-wider text-slate-400">Biography</span>
                            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{lawyer.bio}</p>
                          </div>
                        )}

                        {lawyer.decisionReason && (
                          <div className="mt-4 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                            <span className="font-bold uppercase tracking-wider text-amber-800">Previous Reviewer Reason:</span>
                            <p className="mt-1 font-mono text-[11px]">{lawyer.decisionReason}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => handleVerifyLawyer(lawyer._id, "approved")}
                            disabled={processingId === lawyer._id}
                            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition disabled:opacity-50"
                          >
                            {processingId === lawyer._id ? "Processing..." : "Approve Lawyer"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerifyLawyer(lawyer._id, "additional_info_required")}
                            disabled={processingId === lawyer._id}
                            className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition disabled:opacity-50"
                          >
                            Request Additional Info
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerifyLawyer(lawyer._id, "rejected")}
                            disabled={processingId === lawyer._id}
                            className="rounded-xl border border-red-200 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Reject Application
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: USER ACCOUNTS */}
          {activeTab === "users" && (
            <section className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">User Accounts Management</h2>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="outline-none text-xs w-40"
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="client">Clients</option>
                    <option value="lawyer">Lawyers</option>
                    <option value="admin">Admins</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadUsers}
                    className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-300"
                  >
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Registered</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold uppercase text-[10px] text-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{u.phone || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u._id)}
                            disabled={processingId === u._id}
                            className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                              u.isActive
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {processingId === u._id
                              ? "..."
                              : u.isActive
                              ? "Suspend"
                              : "Reactivate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <section className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">All Platform Consultations</h2>

                <div className="flex items-center gap-2">
                  <select
                    value={appointmentStatusFilter}
                    onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadAppointments}
                    className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-300"
                  >
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Lawyer</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {a.client?.name || "Client"}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {a.lawyer?.user?.name || "Lawyer"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {new Date(a.scheduledAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-5 py-3.5 capitalize">{a.consultationType}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold capitalize text-slate-700">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: PAYMENTS & REFUNDS */}
          {activeTab === "payments" && (
            <section className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">Transaction History & Dispute Refunds</h2>

                <div className="flex items-center gap-2">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="captured">Captured</option>
                    <option value="refunded">Refunded</option>
                    <option value="created">Created (Pending)</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadPayments}
                    className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-300"
                  >
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Razorpay Order ID</th>
                      <th className="px-5 py-3">Payment ID</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Dispute Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => {
                      const canRefund = p.status === "captured";

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{p.client?.name || "Client"}</p>
                            <p className="text-slate-500">{p.client?.email}</p>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-blue-900">
                            ₹{(p.amount / 100).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                            {p.razorpayOrderId || "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                            {p.razorpayPaymentId || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                p.status === "captured"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.status === "refunded"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {canRefund ? (
                              <button
                                type="button"
                                onClick={() => handleRefund(p._id)}
                                disabled={processingId === p._id}
                                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                              >
                                {processingId === p._id ? "Processing..." : "Initiate Refund"}
                              </button>
                            ) : p.status === "refunded" ? (
                              <span className="text-[11px] font-semibold text-purple-700">Refunded</span>
                            ) : (
                              <span className="text-[11px] text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 6: REVIEW MODERATION */}
          {activeTab === "reviews" && (
            <section className="mt-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Review Moderation Queue</h2>
              <p className="text-xs text-slate-500">
                Inspect written client reviews to enforce community guidelines against abusive or fraudulent content.
              </p>

              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <Star className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-base font-bold text-slate-800">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
                            {r.client?.name ? r.client.name.charAt(0) : "C"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {r.client?.name || "Client"} reviewed {r.lawyer?.user?.name || "Lawyer"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {r.rating} / 5
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              r.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "hidden"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>

                      {r.reviewText && (
                        <p className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          &ldquo;{r.reviewText}&rdquo;
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        {r.status === "approved" ? (
                          <button
                            type="button"
                            onClick={() => handleModerateReview(r._id, "hidden")}
                            className="rounded-xl border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                          >
                            Hide Review
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleModerateReview(r._id, "approved")}
                            className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Restore Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
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
