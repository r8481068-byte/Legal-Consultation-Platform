import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Users,
  Briefcase,
  Globe,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Clock,
  Sparkles
} from "lucide-react";
import {
  getAdminNotifications,
  broadcastNotification
} from "../../services/adminService";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Broadcast Form
  const [recipientRole, setRecipientRole] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);

  const loadNotificationsData = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminNotifications({ page, limit: 15 });
      setNotifications(res.notifications || []);
      setBroadcastLogs(res.broadcastLogs || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load notification history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotificationsData(1);
  }, [loadNotificationsData]);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Both title and message are required for platform announcements.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const res = await broadcastNotification({
        recipientRole,
        title,
        message,
        link
      });
      setSuccessMessage(res.message || "Announcement broadcasted successfully.");
      setTitle("");
      setMessage("");
      setLink("");
      loadNotificationsData(1);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to broadcast announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Broadcast & Notification Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish announcements directly to clients and advocates in-app, and monitor system notification delivery.
          </p>
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

      {/* Broadcast Composer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Send className="h-5 w-5 text-blue-900" />
          <h3 className="text-base font-bold text-slate-900">
            Send Platform Broadcast Announcement
          </h3>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Audience */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
              >
                <option value="all">All Registered Users (Clients & Advocates)</option>
                <option value="client">Clients Only</option>
                <option value="lawyer">Advocates / Lawyers Only</option>
              </select>
            </div>

            {/* In-app link */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Optional In-App Route Link
              </label>
              <input
                type="text"
                placeholder="e.g. /my-appointments or /lawyer/edit-profile"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {/* Announcement Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Announcement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled System Maintenance / Platform Policy Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-900 font-semibold"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detailed notification message visible in the user's notification feed..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-blue-900"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Send Broadcast Announcement</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recent Broadcasts Audit */}
      {broadcastLogs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Broadcast Audit Log
          </h3>
          <div className="space-y-2">
            {broadcastLogs.map((log) => (
              <div key={log._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{log.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">By {log.adminName}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Notifications Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Recent System Notifications Sent
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-5 py-3.5">Title & Message</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Sent Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-xs text-slate-400">
                    Loading notification logs...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-xs text-slate-400">
                    No system notifications sent yet.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {n.recipient?.name || "User"}
                      <p className="text-[11px] text-slate-400 font-normal">{n.recipient?.email}</p>
                    </td>
                    <td className="px-4 py-4 capitalize font-semibold text-slate-700">
                      {n.recipient?.role || "user"}
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        n.isRead ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700 font-extrabold"
                      }`}>
                        {n.isRead ? "Read" : "Delivered (Unread)"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
