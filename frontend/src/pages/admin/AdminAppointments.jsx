import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Filter,
  Eye,
  XCircle,
  Clock,
  Video,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  User,
  Briefcase
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminAppointments,
  getAdminAppointmentDetail,
  cancelAdminAppointment
} from "../../services/adminService";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Detail Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAppointments = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminAppointments({
        page,
        limit: 15,
        search,
        status: statusFilter,
        consultationType: typeFilter
      });
      setAppointments(res.appointments || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadAppointments(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadAppointments]);

  const handleOpenDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminAppointmentDetail(appointmentId);
      setSelectedAppointment(res);
    } catch (err) {
      setError(err.message || "Unable to fetch appointment details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelAction = async (reason) => {
    if (!targetAppointment) return;
    setCancelLoading(true);
    try {
      await cancelAdminAppointment(targetAppointment._id, reason);
      setSuccessMessage("Appointment cancelled successfully. Both parties notified.");
      setCancelModalOpen(false);
      setTargetAppointment(null);
      loadAppointments(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to cancel appointment");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "rejected":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Consultations
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track consultation schedules, video room sessions, status transitions, and administrative cancellations.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
          Total Bookings: {pagination.total}
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
              placeholder="Search by client or advocate name..."
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
              <option value="all">All Consultation Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed / Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="all">All Consultation Modes</option>
              <option value="video">Video Consultation</option>
              <option value="chat">Chat Consultation</option>
              <option value="both">Video + Chat</option>
              <option value="in-person">In-Person Meeting</option>
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
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Advocate</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    No consultations found matching your criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition">
                    {/* Booking ID */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      #{a._id.slice(-6).toUpperCase()}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{a.client?.name || "Client"}</p>
                      <p className="text-[11px] text-slate-400">{a.client?.email}</p>
                    </td>

                    {/* Advocate */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{a.lawyer?.user?.name || "Advocate"}</p>
                      <p className="text-[11px] text-slate-400">{a.lawyer?.specialization?.[0] || "General"}</p>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-4 text-slate-700">
                      <p className="font-semibold">
                        {a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        }) : a.preferredDate || "Flexible"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : a.preferredTime || ""}
                      </p>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 capitalize">
                        {a.consultationType === "video" && <Video className="h-3.5 w-3.5 text-blue-900" />}
                        {a.consultationType === "chat" && <MessageSquare className="h-3.5 w-3.5 text-amber-600" />}
                        {a.consultationType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold border capitalize ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(a._id)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                          title="View Consultation Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {!["completed", "cancelled", "rejected"].includes(a.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetAppointment(a);
                              setCancelModalOpen(true);
                            }}
                            className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 transition"
                            title="Cancel Consultation"
                          >
                            <XCircle className="h-4 w-4" />
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total bookings)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadAppointments(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadAppointments(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Consultation #{selectedAppointment.appointment?._id.slice(-6).toUpperCase()}
                </h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(selectedAppointment.appointment?.status)}`}>
                  {selectedAppointment.appointment?.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <User className="h-3 w-3" /> Client
                </span>
                <p className="font-bold text-slate-900">{selectedAppointment.appointment?.client?.name}</p>
                <p className="text-[11px] text-slate-500">{selectedAppointment.appointment?.client?.email}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Advocate
                </span>
                <p className="font-bold text-slate-900">{selectedAppointment.appointment?.lawyer?.user?.name}</p>
                <p className="text-[11px] text-slate-500">{selectedAppointment.appointment?.lawyer?.user?.email}</p>
              </div>
            </div>

            {/* Payment Record */}
            {selectedAppointment.payment && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Status</span>
                  <p className="font-extrabold text-blue-900 text-sm">₹{selectedAppointment.payment.amountRupees}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                  selectedAppointment.payment.status === "captured" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-700"
                }`}>
                  {selectedAppointment.payment.status}
                </span>
              </div>
            )}

            {selectedAppointment.appointment?.notes && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Notes / Instructions</span>
                <p className="text-slate-700 whitespace-pre-line">{selectedAppointment.appointment.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Consultation"
        message={`Are you sure you want to cancel consultation #${targetAppointment?._id.slice(-6).toUpperCase()}? Both client and advocate will be notified.`}
        confirmText="Cancel Consultation"
        confirmColor="danger"
        requireReason={true}
        reasonPlaceholder="Specify administrative reason for cancelling this appointment..."
        onConfirm={handleCancelAction}
        onClose={() => {
          setCancelModalOpen(false);
          setTargetAppointment(null);
        }}
        loading={cancelLoading}
      />
    </div>
  );
}
