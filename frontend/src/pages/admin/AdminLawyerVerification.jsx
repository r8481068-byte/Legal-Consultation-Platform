import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  X,
  Loader2
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminVerifications,
  updateLawyerVerification
} from "../../services/adminService";

export default function AdminLawyerVerification() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  // Action Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [targetApplication, setTargetApplication] = useState(null);
  const [actionType, setActionType] = useState("approved"); // "approved" | "rejected" | "under_review" | "additional_info_required" | "suspended"
  const [decisionReason, setDecisionReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Detail Modal
  const [detailApp, setDetailApp] = useState(null);

  const loadApplications = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminVerifications({
        page,
        limit: 10,
        status: statusFilter,
        search
      });
      setApplications(res.applications || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load verification applications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadApplications(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadApplications]);

  const handleOpenActionModal = (app, type) => {
    setTargetApplication(app);
    setActionType(type);
    setDecisionReason(app.decisionReason || "");
    setInternalNotes(app.internalNotes || "");
    setActionModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!targetApplication) return;
    if (["rejected", "additional_info_required"].includes(actionType) && !decisionReason.trim()) {
      setError("A specific decision reason is strictly required when rejecting or requesting information.");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      await updateLawyerVerification(
        targetApplication._id,
        actionType,
        decisionReason,
        internalNotes
      );
      setSuccessMessage(`Application status updated to '${actionType}' successfully.`);
      setActionModalOpen(false);
      setTargetApplication(null);
      loadApplications(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update verification status");
    } finally {
      setActionLoading(false);
    }
  };

  const statusTabs = [
    { label: "Pending Review", value: "pending" },
    { label: "Under Review", value: "under_review" },
    { label: "Approved / Verified", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Info Required", value: "additional_info_required" },
    { label: "All Applications", value: "all" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Lawyer Credential Verification
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review bar council certificates, law degrees, identity documents, and assign verified status.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
          Applications Found: {pagination.total}
        </span>
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

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 text-xs font-bold">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-xl px-3.5 py-2 transition ${
              statusFilter === tab.value
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by advocate name, email, or Bar Registration ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Advocate</th>
                <th className="px-4 py-3.5">Bar Registration</th>
                <th className="px-4 py-3.5">Experience & City</th>
                <th className="px-4 py-3.5">Documents</th>
                <th className="px-4 py-3.5">Application Status</th>
                <th className="px-5 py-3.5 text-right">Verification Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-slate-400">
                    No applications in this category.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    {/* Advocate Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {app.user?.profileImage ? (
                          <img
                            src={app.user.profileImage}
                            alt={app.user?.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-900 to-slate-900 text-white font-extrabold text-xs">
                            {app.user?.name ? app.user.name[0].toUpperCase() : "A"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{app.user?.name || "Advocate"}</p>
                          <p className="text-[11px] text-slate-400">{app.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bar Registration */}
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-slate-900 font-mono">
                        {app.barCouncilId}
                      </span>
                      {app.stateOfEnrolment && (
                        <p className="text-[10px] text-slate-400 mt-0.5">State: {app.stateOfEnrolment}</p>
                      )}
                    </td>

                    {/* Experience & City */}
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{app.experienceYears || 0} Years Experience</p>
                      <p className="text-[11px] text-slate-500">{app.city}, {app.state || "India"}</p>
                    </td>

                    {/* Documents Count */}
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setDetailApp(app)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-900 hover:bg-blue-100 transition"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>{app.verificationDocuments?.length || 0} Files</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold capitalize ${
                          app.verificationStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.verificationStatus === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : app.verificationStatus === "under_review"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {app.verificationStatus === "approved" && <ShieldCheck className="h-3 w-3" />}
                        {app.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailApp(app)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                          title="View Application Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(app, "approved")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                          title="Approve & Grant Verified Badge"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(app, "rejected")}
                          className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition"
                          title="Reject Application"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(app, "additional_info_required")}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                          title="Request More Information"
                        >
                          Request Info
                        </button>
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total applications)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadApplications(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadApplications(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {actionModalOpen && targetApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                Verification Decision: {actionType.replace("_", " ")}
              </h3>
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Applying decision to <strong>{targetApplication.user?.name}</strong> (Bar ID: {targetApplication.barCouncilId}).
            </p>

            {/* Decision Status Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Decision Outcome
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
              >
                <option value="approved">Approve & Grant Verified Advocate Badge</option>
                <option value="under_review">Mark Under Review</option>
                <option value="rejected">Reject Application (Reason Required)</option>
                <option value="additional_info_required">Request Additional Information (Reason Required)</option>
                <option value="suspended">Suspend Verification</option>
              </select>
            </div>

            {/* Decision Reason */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Decision Reason / Public Note {["rejected", "additional_info_required"].includes(actionType) && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={3}
                placeholder="Message visible to the advocate explaining this decision..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-900"
              />
            </div>

            {/* Internal Review Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Internal Administrator Notes (Private to Admin)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={2}
                placeholder="Internal verification findings or Bar Council directory confirmation note..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail View Drawer */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6">
          <div className="w-full max-w-xl h-full rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{detailApp.user?.name}</h3>
                <p className="text-xs text-slate-500">Bar ID: {detailApp.barCouncilId}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Credentials Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                  <p className="font-bold text-slate-800 mt-0.5">{detailApp.experienceYears} Years</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">City & State</span>
                  <p className="font-bold text-slate-800 mt-0.5">{detailApp.city}, {detailApp.state}</p>
                </div>
              </div>

              {/* Submitted Verification Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verification Documents ({detailApp.verificationDocuments?.length || 0})
                </h4>
                <div className="space-y-2">
                  {detailApp.verificationDocuments && detailApp.verificationDocuments.length > 0 ? (
                    detailApp.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between text-xs bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-blue-900" />
                          <div>
                            <p className="font-bold text-slate-800">{doc.title || "Credential Document"}</p>
                            <span className="text-[10px] text-slate-400 uppercase">{doc.documentType}</span>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-800 transition"
                        >
                          <span>Open File</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No verification documents attached.</p>
                  )}
                </div>
              </div>

              {/* Verification History Audit */}
              {detailApp.verificationHistory && detailApp.verificationHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Audit & Review History
                  </h4>
                  <div className="space-y-2">
                    {detailApp.verificationHistory.map((h, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 capitalize">Status: {h.status}</span>
                          <span className="text-[10px] text-slate-400">{new Date(h.reviewedAt).toLocaleDateString()}</span>
                        </div>
                        {h.decisionReason && <p className="text-slate-600">Note: {h.decisionReason}</p>}
                        {h.internalNotes && <p className="text-slate-500 italic">Internal: {h.internalNotes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
