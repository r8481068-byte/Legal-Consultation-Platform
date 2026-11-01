import { useState, useEffect, useCallback } from "react";
import {
  MessageSquareWarning,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Send,
  User,
  ShieldCheck
} from "lucide-react";
import {
  getAdminComplaints,
  getAdminComplaintDetail,
  updateAdminComplaint
} from "../../services/adminService";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Detail / Update Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("open");
  const [updatePriority, setUpdatePriority] = useState("medium");
  const [adminReply, setAdminReply] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const loadComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminComplaints({
        page,
        limit: 15,
        search,
        status: statusFilter,
        priority: priorityFilter
      });
      setComplaints(res.complaints || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load support complaints");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadComplaints(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadComplaints]);

  const handleOpenDetail = async (complaintId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminComplaintDetail(complaintId);
      setSelectedComplaint(res.complaint);
      setUpdateStatus(res.complaint.status);
      setUpdatePriority(res.complaint.priority);
      setAdminReply(res.complaint.adminResponse || "");
    } catch (err) {
      setError(err.message || "Unable to fetch complaint details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveComplaintUpdate = async () => {
    if (!selectedComplaint) return;
    setUpdateLoading(true);
    try {
      await updateAdminComplaint(selectedComplaint._id, {
        status: updateStatus,
        priority: updatePriority,
        adminResponse: adminReply
      });
      setSuccessMessage(`Ticket ${selectedComplaint.complaintId} updated successfully.`);
      setSelectedComplaint(null);
      loadComplaints(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update complaint");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200 font-extrabold";
      case "high":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-300";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Complaints & Support Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resolve dispute tickets submitted by clients and advocates, assign priority, and reply with administrative resolutions.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
          Open Tickets: {complaints.filter((c) => c.status === "open").length}
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

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="all">All Ticket Statuses</option>
              <option value="open">Open (Requires Action)</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Ticket ID</th>
                <th className="px-4 py-3.5">Submitted By</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-5 py-3.5">Subject & Preview</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-xs text-slate-400">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-xs text-slate-400">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    {/* Ticket ID */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {c.complaintId}
                    </td>

                    {/* Submitted by */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{c.submittedBy?.name || "User"}</p>
                      <p className="text-[11px] text-slate-400">{c.submittedBy?.email}</p>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {c.role}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{c.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] border capitalize ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold border capitalize ${getStatusBadge(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(c._id)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </button>
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total tickets)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadComplaints(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadComplaints(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Complaint Detail & Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-900">
                  {selectedComplaint.complaintId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedComplaint.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Submitter Box */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Submitted By</span>
                <p className="font-bold text-slate-900">{selectedComplaint.submittedBy?.name}</p>
                <p className="text-[11px] text-slate-500">{selectedComplaint.submittedBy?.email}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">User Role & Category</span>
                <p className="font-bold text-slate-900 capitalize">{selectedComplaint.role}</p>
                <p className="text-[11px] text-slate-500 capitalize">{selectedComplaint.category?.replace("_", " ")}</p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">Issue Description</span>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">{selectedComplaint.description}</p>
            </div>

            {/* Resolution Form */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Administrative Response & Action
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Update Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Set Priority</label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Official Admin Response (Visible to Submitter)
                </label>
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  rows={4}
                  placeholder="Enter response or resolution details sent to the user..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveComplaintUpdate}
                  disabled={updateLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs disabled:opacity-50"
                >
                  {updateLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Resolution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
