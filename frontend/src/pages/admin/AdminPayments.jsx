import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  IndianRupee,
  ExternalLink,
  Eye,
  X,
  TrendingUp,
  ShieldCheck,
  Receipt
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminPayments,
  getAdminPaymentDetail,
  processRefund
} from "../../services/adminService";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ grossRupees: 0, refundRupees: 0, netRupees: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [targetPayment, setTargetPayment] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  // Detail Modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminPayments({
        page,
        limit: 15,
        search,
        status: statusFilter
      });
      setPayments(res.payments || []);
      setSummary(res.summary || { grossRupees: 0, refundRupees: 0, netRupees: 0 });
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadPayments(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadPayments]);

  const handleRefundAction = async (reason) => {
    if (!targetPayment) return;
    setRefundLoading(true);
    try {
      const res = await processRefund(targetPayment._id, reason);
      setSuccessMessage(`Refund of ₹${targetPayment.amountRupees} processed successfully. Reference: ${res.refundId}`);
      setRefundModalOpen(false);
      setTargetPayment(null);
      loadPayments(pagination.page);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to process refund");
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "captured":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-900" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Payments & Financial Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile consultation fees, verify Razorpay gateway transactions, and process administrative refunds safely.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
          Total Transactions: {pagination.total}
        </span>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Captured</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{summary.grossRupees.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-block">
            Captured Payments Only
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Processed Refunds</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            ₹{summary.refundRupees.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 inline-block">
            Returned to Clients
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-blue-900 to-slate-900 text-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Net Platform Revenue</p>
          <p className="text-2xl font-extrabold text-white mt-1">
            ₹{summary.netRupees.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 inline-block">
            Net Collected Volume
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Razorpay ID, or Refund reference..."
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
              <option value="all">All Payment Statuses</option>
              <option value="captured">Captured (Successful)</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
              <option value="created">Created (Pending Gateway)</option>
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
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Advocate</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    {/* Transaction ID */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900">
                        {p.razorpayPaymentId || `#${p._id.slice(-6).toUpperCase()}`}
                      </span>
                      {p.refundId && (
                        <p className="text-[10px] text-purple-600 font-mono mt-0.5">
                          Ref: {p.refundId}
                        </p>
                      )}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{p.client?.name || "Client"}</p>
                      <p className="text-[11px] text-slate-400">{p.client?.email}</p>
                    </td>

                    {/* Advocate */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">
                        {p.appointment?.lawyer?.user?.name || "Advocate"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.appointment?.lawyer?.city || "India"}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-blue-900 text-sm">
                        ₹{p.amountRupees}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold border capitalize ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(p)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                          title="View Transaction Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {p.status === "captured" && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetPayment(p);
                              setRefundModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition"
                            title="Process Refund"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Refund</span>
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total payments)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadPayments(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadPayments(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Payment Breakdown
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment ID</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedPayment.razorpayPaymentId || selectedPayment._id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount</span>
                  <p className="font-extrabold text-blue-900 text-sm mt-0.5">₹{selectedPayment.amountRupees}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                  <p className="font-bold text-slate-800 capitalize mt-0.5">{selectedPayment.status}</p>
                </div>
              </div>

              {selectedPayment.refundId && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                  <span className="text-[10px] text-purple-700 uppercase font-semibold">Refund Reference ID</span>
                  <p className="font-mono font-bold text-purple-900 mt-0.5">{selectedPayment.refundId}</p>
                  {selectedPayment.failureReason && (
                    <p className="text-[11px] text-purple-800 mt-1">{selectedPayment.failureReason}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirm Modal */}
      <ConfirmModal
        isOpen={refundModalOpen}
        title="Issue Administrative Refund"
        message={`Are you sure you want to refund ₹${targetPayment?.amountRupees} to ${targetPayment?.client?.name}? This action cannot be reversed.`}
        confirmText="Confirm Refund"
        confirmColor="danger"
        requireReason={true}
        reasonPlaceholder="Specify reason for refund (e.g., advocate unfulfilled appointment, client dispute)..."
        onConfirm={handleRefundAction}
        onClose={() => {
          setRefundModalOpen(false);
          setTargetPayment(null);
        }}
        loading={refundLoading}
      />
    </div>
  );
}
