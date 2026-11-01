import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Star,
  Eye,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  X,
  ExternalLink
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminLawyers,
  getAdminLawyerDetail,
  toggleLawyerBlock
} from "../../services/adminService";

export default function AdminLawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");

  // Detail drawer
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Block modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [targetLawyer, setTargetLawyer] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);

  const loadLawyers = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminLawyers({
        page,
        limit: 10,
        search,
        status: statusFilter,
        verificationStatus: verificationFilter,
        specialization: specializationFilter
      });
      setLawyers(res.lawyers || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load advocates");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, verificationFilter, specializationFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLawyers(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadLawyers]);

  const handleOpenDetail = async (lawyerId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminLawyerDetail(lawyerId);
      setSelectedLawyer(res);
    } catch (err) {
      setError(err.message || "Unable to fetch advocate details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlockAction = async (reason) => {
    if (!targetLawyer) return;
    setBlockLoading(true);
    try {
      const isBlocked = targetLawyer.user?.isActive;
      await toggleLawyerBlock(targetLawyer._id, isBlocked, reason);
      setSuccessMessage(
        isBlocked
          ? `Advocate ${targetLawyer.user?.name || "account"} has been blocked.`
          : `Advocate ${targetLawyer.user?.name || "account"} has been unblocked.`
      );
      setBlockModalOpen(false);
      setTargetLawyer(null);
      loadLawyers(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update lawyer block status");
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Advocates
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered advocates, inspect practice credentials, fees, ratings, and manage verification states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/lawyer-verification"
            className="rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Review Applications</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by advocate name, email, or Bar Council ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition"
            />
          </div>

          {/* Verification Status */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="">All Verification States</option>
              <option value="approved">Approved & Verified</option>
              <option value="pending">Pending Review</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
              <option value="additional_info_required">Additional Info Required</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Account Status (Active/Blocked) */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by specialization..."
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Lawyers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Advocate</th>
                <th className="px-4 py-3.5">Practice Info</th>
                <th className="px-4 py-3.5">Consultation Fee</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Appointments</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    Loading advocates...
                  </td>
                </tr>
              ) : lawyers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    No advocates found matching the query.
                  </td>
                </tr>
              ) : (
                lawyers.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/80 transition">
                    {/* Advocate Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {l.user?.profileImage ? (
                          <img
                            src={l.user.profileImage}
                            alt={l.user?.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-900 to-slate-900 text-white font-extrabold text-xs">
                            {l.user?.name ? l.user.name[0].toUpperCase() : "A"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{l.user?.name || "Advocate"}</p>
                          <p className="text-[11px] text-slate-400">Bar: {l.barCouncilId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Practice info */}
                    <td className="px-4 py-4 space-y-1">
                      <p className="font-semibold text-slate-800">
                        {Array.isArray(l.specialization) ? l.specialization.slice(0, 2).join(", ") : l.specialization || "General"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {l.experienceYears || 0} yrs exp • {l.city || "India"}
                      </p>
                    </td>

                    {/* Fee */}
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-blue-900 text-sm">
                        ₹{l.consultationFee || 0}
                      </span>
                    </td>

                    {/* Verification status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          l.verificationStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : l.verificationStatus === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {l.verificationStatus === "approved" && <ShieldCheck className="h-3 w-3" />}
                        {l.verificationStatus}
                      </span>
                    </td>

                    {/* Account status */}
                    <td className="px-4 py-4">
                      {l.user?.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          Blocked
                        </span>
                      )}
                    </td>

                    {/* Appointments */}
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                        {l.totalAppointments || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(l._id)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="View Profile & Credentials"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {l.user?.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetLawyer(l);
                              setBlockModalOpen(true);
                            }}
                            className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 transition"
                            title="Block Advocate"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetLawyer(l);
                              setBlockModalOpen(true);
                            }}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Unblock Advocate"
                          >
                            <Unlock className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total advocates)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadLawyers(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadLawyers(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lawyer Detail Slide-over / Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6">
          <div className="w-full max-w-xl h-full rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-900 to-slate-900 text-white font-extrabold text-base shadow-xs">
                  {selectedLawyer.lawyer?.user?.name ? selectedLawyer.lawyer.user.name[0].toUpperCase() : "A"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedLawyer.lawyer?.user?.name}</h3>
                  <p className="text-xs text-slate-500">Bar ID: {selectedLawyer.lawyer?.barCouncilId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Banner */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verification State</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    selectedLawyer.lawyer?.verificationStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {selectedLawyer.lawyer?.verificationStatus}
                  </span>
                </div>
                {selectedLawyer.lawyer?.decisionReason && (
                  <p className="text-xs text-slate-600">
                    Decision Note: {selectedLawyer.lawyer.decisionReason}
                  </p>
                )}
              </div>

              {/* Core Credentials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Credentials & Practice
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedLawyer.lawyer?.experienceYears} Years</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</span>
                    <p className="font-bold text-blue-900 mt-0.5">₹{selectedLawyer.lawyer?.consultationFee}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">City & State</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedLawyer.lawyer?.city}, {selectedLawyer.lawyer?.state || "India"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Average Rating</span>
                    <p className="font-bold text-amber-600 mt-0.5">★ {selectedLawyer.lawyer?.averageRating || 5} ({selectedLawyer.lawyer?.totalReviews || 0} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Submitted Verification Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submitted Verification Documents ({selectedLawyer.lawyer?.verificationDocuments?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedLawyer.lawyer?.verificationDocuments?.length > 0 ? (
                    selectedLawyer.lawyer.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-900" />
                          <div>
                            <p className="font-bold text-slate-800">{doc.title || "Document"}</p>
                            <span className="text-[10px] text-slate-400 uppercase">{doc.documentType}</span>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No verification documents attached.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirm Modal */}
      <ConfirmModal
        isOpen={blockModalOpen}
        title={targetLawyer?.user?.isActive ? "Block Advocate Account" : "Unblock Advocate Account"}
        message={
          targetLawyer?.user?.isActive
            ? `Are you sure you want to block ${targetLawyer.user?.name || "this advocate"}? Blocked advocates will immediately be prevented from taking appointments and accessing protected functionality.`
            : `Are you sure you want to unblock ${targetLawyer?.user?.name}? They will be able to log in and resume consultations.`
        }
        confirmText={targetLawyer?.user?.isActive ? "Block Advocate" : "Unblock Advocate"}
        confirmColor={targetLawyer?.user?.isActive ? "danger" : "primary"}
        requireReason={targetLawyer?.user?.isActive}
        reasonPlaceholder="Specify administrative reason for blocking this advocate..."
        onConfirm={handleBlockAction}
        onClose={() => {
          setBlockModalOpen(false);
          setTargetLawyer(null);
        }}
        loading={blockLoading}
      />
    </div>
  );
}
