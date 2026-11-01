import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Search,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  User,
  Briefcase
} from "lucide-react";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getAdminReviews,
  moderateAdminReview
} from "../../services/adminService";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("");

  // Moderation Modal
  const [modModalOpen, setModModalOpen] = useState(false);
  const [targetReview, setTargetReview] = useState(null);
  const [targetStatus, setTargetStatus] = useState("hidden");
  const [modLoading, setModLoading] = useState(false);

  const loadReviews = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminReviews({
        page,
        limit: 15,
        search,
        status: statusFilter,
        rating: ratingFilter
      });
      setReviews(res.reviews || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, ratingFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadReviews(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadReviews]);

  const handleModerateAction = async (reason) => {
    if (!targetReview) return;
    setModLoading(true);
    try {
      await moderateAdminReview(targetReview._id, targetStatus, reason);
      setSuccessMessage(
        targetStatus === "hidden"
          ? "Review hidden from public view."
          : "Review approved and restored to public view."
      );
      setModModalOpen(false);
      setTargetReview(null);
      loadReviews(pagination.page);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to moderate review");
    } finally {
      setModLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Reviews & Ratings Moderation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit client feedback, moderate inappropriate comments, and restore reviews.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
          Total Reviews: {pagination.total}
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
              placeholder="Search in review feedback..."
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
              <option value="all">All Moderation Statuses</option>
              <option value="approved">Approved & Visible</option>
              <option value="hidden">Hidden from Public</option>
              <option value="flagged">Flagged for Review</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 bg-white"
            >
              <option value="">All Star Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Client</th>
                <th className="px-4 py-3.5">Advocate</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Review Feedback</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    No reviews found matching your criteria.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition">
                    {/* Client */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {r.client?.name || "Client"}
                    </td>

                    {/* Advocate */}
                    <td className="px-4 py-4 text-slate-800 font-medium">
                      {r.lawyer?.user?.name || "Advocate"}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {r.rating}.0
                      </span>
                    </td>

                    {/* Review text */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                        {r.reviewText || <span className="italic text-slate-400">No written comment</span>}
                      </p>
                      {r.moderationReason && (
                        <p className="text-[10px] text-red-600 mt-1 italic">
                          Moderation note: {r.moderationReason}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                          r.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "hidden"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {r.status === "approved" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetReview(r);
                            setTargetStatus("hidden");
                            setModModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition"
                          title="Hide Inappropriate Review"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetReview(r);
                            setTargetStatus("approved");
                            setModModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                          title="Restore Review to Public View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total reviews)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadReviews(pagination.page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadReviews(pagination.page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Moderation Confirm Modal */}
      <ConfirmModal
        isOpen={modModalOpen}
        title={targetStatus === "hidden" ? "Hide Inappropriate Review" : "Restore Review"}
        message={
          targetStatus === "hidden"
            ? "Are you sure you want to hide this review from the public advocate profile? The rating will be excluded from the lawyer's average rating calculation."
            : "Are you sure you want to approve and restore this review? It will become visible on the public lawyer profile."
        }
        confirmText={targetStatus === "hidden" ? "Hide Review" : "Restore Review"}
        confirmColor={targetStatus === "hidden" ? "danger" : "primary"}
        requireReason={targetStatus === "hidden"}
        reasonPlaceholder="Specify reason for moderation (e.g., abusive language, irrelevant content)..."
        onConfirm={handleModerateAction}
        onClose={() => {
          setModModalOpen(false);
          setTargetReview(null);
        }}
        loading={modLoading}
      />
    </div>
  );
}
