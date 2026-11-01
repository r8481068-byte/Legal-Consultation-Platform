import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  X
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminClients,
  getAdminClientDetail,
  toggleClientBlock
} from "../../services/adminService";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Selected client for detail modal
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Block/Unblock modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [targetClient, setTargetClient] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);

  const loadClients = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminClients({
        page,
        limit: 10,
        search,
        status: statusFilter,
        sortBy
      });
      setClients(res.clients || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadClients(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadClients]);

  const handleOpenDetail = async (clientId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminClientDetail(clientId);
      setSelectedClient(res);
    } catch (err) {
      setError(err.message || "Unable to fetch client details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlockAction = async (reason) => {
    if (!targetClient) return;
    setBlockLoading(true);
    try {
      const isBlocked = targetClient.isActive; // if active, we are blocking
      await toggleClientBlock(targetClient._id, isBlocked, reason);
      setSuccessMessage(
        isBlocked
          ? `Client ${targetClient.name} has been blocked.`
          : `Client ${targetClient.name} has been unblocked.`
      );
      setBlockModalOpen(false);
      setTargetClient(null);
      loadClients(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update client block status");
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
            <Users className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Clients
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, inspect credentials, view consultation history, and manage client access states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
            Total Clients: {pagination.total}
          </span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Accounts Only</option>
              <option value="blocked">Blocked Accounts Only</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="newest">Sort by Registration: Newest First</option>
              <option value="oldest">Sort by Registration: Oldest First</option>
              <option value="name_asc">Sort by Name: A to Z</option>
              <option value="name_desc">Sort by Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Client</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Registration Date</th>
                <th className="px-4 py-3.5">Appointments</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-slate-400">
                    No clients found matching the query.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    {/* Client info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {c.profileImage ? (
                          <img
                            src={c.profileImage}
                            alt={c.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-white font-extrabold text-xs">
                            {c.name ? c.name[0].toUpperCase() : "C"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <span className="text-[10px] text-slate-400">ID: {c._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4 space-y-0.5">
                      <p className="text-xs text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{c.email}</span>
                      </p>
                      {c.phone && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-600">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    {/* Appointments */}
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                        {c.totalAppointments || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Blocked
                          </span>
                          {c.blockReason && (
                            <p className="text-[10px] text-red-600 truncate max-w-[150px]" title={c.blockReason}>
                              {c.blockReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c._id)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="View Complete Client Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {c.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetClient(c);
                              setBlockModalOpen(true);
                            }}
                            className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 transition"
                            title="Block Client"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetClient(c);
                              setBlockModalOpen(true);
                            }}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Unblock Client"
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total clients)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadClients(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadClients(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slide-over / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6">
          <div className="w-full max-w-xl h-full rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-900 text-white font-extrabold text-base shadow-xs">
                  {selectedClient.client?.name ? selectedClient.client.name[0].toUpperCase() : "C"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedClient.client?.name}</h3>
                  <p className="text-xs text-slate-500">{selectedClient.client?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account State Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Account State</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedClient.client?.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {selectedClient.client?.isActive ? "Active" : "Blocked"}
                  </span>
                </div>
                {!selectedClient.client?.isActive && selectedClient.client?.blockReason && (
                  <p className="text-xs text-red-700 font-medium">
                    Reason: {selectedClient.client.blockReason}
                  </p>
                )}
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Phone</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedClient.client?.phone || "Not specified"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Gender</span>
                    <p className="font-bold text-slate-800 mt-0.5 capitalize">{selectedClient.client?.gender || "Not specified"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {[selectedClient.client?.addressLine, selectedClient.client?.cityVillage, selectedClient.client?.district, selectedClient.client?.state, selectedClient.client?.pincode].filter(Boolean).join(", ") || "No address provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Consultation History ({selectedClient.appointments?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedClient.appointments?.length > 0 ? (
                    selectedClient.appointments.map((a) => (
                      <div key={a._id} className="rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{a.lawyer?.user?.name || "Advocate"}</p>
                          <p className="text-[11px] text-slate-500">{a.consultationType} • {new Date(a.scheduledAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold capitalize text-[10px]">
                          {a.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No appointments booked yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Block / Unblock Modal */}
      <ConfirmModal
        isOpen={blockModalOpen}
        title={targetClient?.isActive ? "Block Client Account" : "Unblock Client Account"}
        message={
          targetClient?.isActive
            ? `Are you sure you want to block ${targetClient.name}? Blocked clients will immediately be denied access to consultation booking and platform features.`
            : `Are you sure you want to restore access for ${targetClient?.name}? They will be able to log in and use platform features again.`
        }
        confirmText={targetClient?.isActive ? "Block Client" : "Unblock Client"}
        confirmColor={targetClient?.isActive ? "danger" : "primary"}
        requireReason={targetClient?.isActive}
        reasonPlaceholder="Specify administrative reason for blocking this client..."
        onConfirm={handleBlockAction}
        onClose={() => {
          setBlockModalOpen(false);
          setTargetClient(null);
        }}
        loading={blockLoading}
      />
    </div>
  );
}
