import { useState } from "react";
import { Star, CheckCircle, AlertCircle, X, ThumbsUp } from "lucide-react";
import { createReview } from "../services/reviewService";

const ratingLabels = {
  1: "Poor — Did not meet expectations",
  2: "Fair — Acceptable but had issues",
  3: "Good — Helpful consultation",
  4: "Very Good — Knowledgeable & professional",
  5: "Excellent — Exceptional legal counsel",
};

const categoryLabels = [
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "clarity", label: "Clarity of Advice" },
  { key: "punctuality", label: "Punctuality" },
];

export default function ReviewModal({ appointment, isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categories, setCategories] = useState({
    communication: 0,
    professionalism: 0,
    clarity: 0,
    punctuality: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen || !appointment) return null;

  const lawyer = appointment.lawyer || {};
  const lawyerUser = lawyer.user || {};
  const lawyerName = lawyerUser.name || "Legal Consultant";
  const lawyerCity = lawyer.city || "Verified Advocate";

  const handleCategorySelect = (catKey, score) => {
    setCategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey] === score ? 0 : score,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select an overall rating (1 to 5 stars).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        appointmentId: appointment._id,
        rating,
        reviewText: reviewText.trim(),
        categories,
      };

      await createReview(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              How was your consultation?
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Your honest feedback helps clients make informed decisions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {success ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Thank you for your review!
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Your feedback has been published and the lawyer&apos;s rating has been updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lawyer Reference Card */}
              <div className="flex items-center gap-4 rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
                {lawyerUser.profileImage ? (
                  <img
                    src={lawyerUser.profileImage}
                    alt={lawyerName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-xl font-bold text-white">
                    {lawyerName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-base">{lawyerName}</h3>
                  <p className="text-xs text-slate-600">{lawyerCity}</p>
                  <p className="text-[11px] text-blue-800 font-medium mt-1">
                    Consultation on{" "}
                    {new Date(appointment.scheduledAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 shrink-0">
                  Completed
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating Section */}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Select your overall rating
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${star} star`}
                      >
                        <Star
                          className={`h-9 w-9 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs font-medium text-slate-600 h-5">
                  {ratingLabels[hoverRating || rating] || "Click to rate from 1 to 5 stars"}
                </p>
              </div>

              {/* Category Breakdown (Optional) */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Ratings (Optional)
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {categoryLabels.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-100"
                    >
                      <span className="text-xs font-semibold text-slate-700">
                        {label}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleCategorySelect(key, s)}
                            className={`h-6 w-6 rounded-md text-xs font-bold transition ${
                              categories[key] >= s
                                ? "bg-amber-400 text-slate-900"
                                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div className="border-t border-slate-100 pt-4">
                <label
                  htmlFor="reviewText"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Written Feedback
                </label>
                <textarea
                  id="reviewText"
                  rows={4}
                  maxLength={1000}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience with the consultation, advice received, or key takeaways..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 p-3.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Minimum 10 characters recommended</span>
                  <span>{reviewText.length}/1000</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
