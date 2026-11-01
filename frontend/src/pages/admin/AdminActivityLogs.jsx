import React, { useState, useEffect, useCallback } from "react";
import { getAdminActivityLogs } from "../../services/adminService";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        limit: 20,
        search: search.trim(),
        action: actionFilter,
        targetType: targetFilter,
        startDate: startDate ? new Date(startDate).toISOString() : "",
        endDate: endDate ? new Date(endDate).toISOString() : ""
      };
      const res = await getAdminActivityLogs(params);
      if (res.success) {
        setLogs(res.logs || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 20 });
      } else {
        setError(res.message || "Failed to load activity logs");
      }
    } catch (err) {
      setError(err.message || "Network error fetching logs");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, targetFilter, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearch("");
    setActionFilter("all");
    setTargetFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getActionBadgeClass = (action) => {
    if (!action) return "bg-gray-100 text-gray-700";
    if (action.includes("BLOCK") || action.includes("CANCEL") || action.includes("REJECT")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    if (action.includes("UNBLOCK") || action.includes("VERIFY") || action.includes("APPROVE")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (action.includes("REFUND") || action.includes("MODERATE")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (action.includes("BROADCAST") || action.includes("NOTIFICATION")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Activity Audit Logs</h1>
          <p className="text-sm text-slate-500">
            Immutable system logs tracking every administrative action, user modification, verification decision, and platform update.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search admin, email, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Action Types</option>
              <option value="CLIENT_BLOCK">Client Block</option>
              <option value="CLIENT_UNBLOCK">Client Unblock</option>
              <option value="LAWYER_BLOCK">Lawyer Block</option>
              <option value="LAWYER_UNBLOCK">Lawyer Unblock</option>
              <option value="LAWYER_VERIFY">Lawyer Verification Update</option>
              <option value="APPOINTMENT_CANCEL">Appointment Cancellation</option>
              <option value="REVIEW_MODERATE">Review Moderation</option>
              <option value="PAYMENT_REFUND">Payment Refund</option>
              <option value="COMPLAINT_UPDATE">Complaint Update</option>
              <option value="BROADCAST_NOTIFICATION">Notification Broadcast</option>
              <option value="PROFILE_UPDATE">Admin Profile Update</option>
              <option value="PASSWORD_CHANGE">Password Change</option>
              <option value="SETTINGS_UPDATE">Platform Settings Update</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <select
              value={targetFilter}
              onChange={(e) => {
                setTargetFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Target Resources</option>
              <option value="Client">Client</option>
              <option value="Lawyer">Lawyer</option>
              <option value="Appointment">Appointment</option>
              <option value="Review">Review</option>
              <option value="Payment">Payment</option>
              <option value="Complaint">Complaint</option>
              <option value="Notification">Notification</option>
              <option value="Settings">Settings / Admin</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="w-full px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-sm text-slate-600">
          <span className="font-medium text-xs uppercase tracking-wider text-slate-400">Date Range:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="ml-auto text-xs text-slate-500 font-medium">
            Showing {logs.length} of {pagination.total} recorded actions
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-64"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-6 bg-slate-200 rounded w-14 ml-auto"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-base font-medium text-slate-600">No activity logs found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or date range.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{log.adminName || "Administrator"}</div>
                      <div className="text-xs text-slate-400">{log.adminEmail || "admin@legalconnect.com"}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{log.targetType || "System"}</div>
                      {log.targetId && (
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]" title={log.targetId}>
                          ID: {log.targetId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {log.ipAddress || "::1"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getActionBadgeClass(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Description</label>
                <p className="mt-1 text-slate-900 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-400 block font-medium">Administrator</span>
                  <p className="font-semibold text-slate-800">{selectedLog.adminName || "Admin"}</p>
                  <p className="text-xs text-slate-500">{selectedLog.adminEmail}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-400 block font-medium">Target Entity</span>
                  <p className="font-semibold text-slate-800">{selectedLog.targetType}</p>
                  <p className="text-xs font-mono text-slate-500 truncate" title={selectedLog.targetId}>
                    ID: {selectedLog.targetId || "N/A"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="font-mono text-slate-800">{selectedLog.ipAddress || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">User Agent:</span>
                  <span className="font-mono text-slate-800 truncate max-w-xs" title={selectedLog.userAgent}>
                    {selectedLog.userAgent || "Browser Client"}
                  </span>
                </div>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Payload Details
                  </label>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
