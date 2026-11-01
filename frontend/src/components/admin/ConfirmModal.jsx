import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "danger", // "danger" | "primary" | "warning"
  requireReason = false,
  reasonPlaceholder = "Please enter reason...",
  onConfirm,
  onClose,
  loading = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError("A specific reason is strictly required for this administrative action.");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  const colorStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    primary: "bg-blue-900 hover:bg-blue-800 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
  }[confirmColor] || "bg-red-600 hover:bg-red-700 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                confirmColor === "danger"
                  ? "bg-red-50 text-red-600"
                  : confirmColor === "warning"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-900"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">{message}</p>

        {requireReason && (
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason for Action <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              placeholder={reasonPlaceholder}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition"
            />
            {error && <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-50 ${colorStyles}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
