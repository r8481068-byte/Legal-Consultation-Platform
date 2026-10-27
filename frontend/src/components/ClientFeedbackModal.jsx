import { Star, MessageSquare, ShieldCheck, X, Calendar, User } from "lucide-react";

export default function ClientFeedbackModal({ appointment, isOpen, onClose }) {
  if (!isOpen || !appointment) return null;

  const review = appointment.review;
  const client = appointment.client || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Client Feedback & Rating</h2>
              <p className="text-xs text-slate-500">
                Verified consultation review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {review ? (
            <div className="space-y-5">
              {/* Top rating header */}
              <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-lg">
                    {review.rating}.0
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            review.rating >= s
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      Submitted on{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Review
                </span>
              </div>

              {/* Review Testimonial Text */}
              {review.reviewText && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Client Testimonial
                  </p>
                  <p className="text-sm text-slate-800 italic leading-relaxed">
                    &ldquo;{review.reviewText}&rdquo;
                  </p>
                </div>
              )}

              {/* Criteria Ratings Breakdown */}
              {review.categories && Object.keys(review.categories).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Evaluation Criteria
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {Object.entries(review.categories).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 capitalize font-medium text-slate-700"
                      >
                        <span>{key}</span>
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {val}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Review Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                The client has not yet submitted feedback for this consultation session.
                When the client rates this session, their review and ratings breakdown will automatically display here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
