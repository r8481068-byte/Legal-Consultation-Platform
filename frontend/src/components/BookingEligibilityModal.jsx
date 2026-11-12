import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  MapPin,
  Lock,
} from "lucide-react";

export default function BookingEligibilityModal({
  isOpen,
  onClose,
  eligibility,
  pendingSelection = null,
}) {
  const navigate = useNavigate();

  if (!isOpen || !eligibility) return null;

  const checks = eligibility.checks || {};

  const handleAction = (route) => {
    if (pendingSelection) {
      sessionStorage.setItem(
        "pendingConsultation",
        JSON.stringify(pendingSelection)
      );
    }
    onClose();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-snug">
                Please complete your client profile to 100% before booking a consultation.
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mandatory legal compliance gate before appointment confirmation
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

        {/* Body Checklist */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Legal consultations require authentic client credentials to adhere to Bar Council and information privacy guidelines. Please complete the following requirements:
          </p>

          <div className="space-y-2.5">
            {/* 1. Address Profile */}
            <div
              className={`p-3.5 rounded-2xl border text-xs ${
                checks.profileCompleted
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-950"
                  : "border-amber-200 bg-amber-50/40 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin
                    className={`h-4 w-4 ${
                      checks.profileCompleted ? "text-emerald-700" : "text-amber-700"
                    }`}
                  />
                  <div>
                    <span className="font-bold">Client Address & Personal Information</span>
                    <p className="text-[11px] text-slate-500">
                      {checks.profileCompleted
                        ? "Full profile & Indian PIN code complete (100%)"
                        : `${checks.profilePercentage || 0}% Complete`}
                    </p>
                  </div>
                </div>
                {checks.profileCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
              </div>

              {!checks.profileCompleted && checks.missingProfileLabels?.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900">
                  <span className="font-bold">Remaining required fields:</span>{" "}
                  {checks.missingProfileLabels.join(", ")}
                </div>
              )}
            </div>

            {/* 2. Identity Gate (Aadhaar & PAN) */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${
                checks.identityCompleted
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-950"
                  : "border-amber-200 bg-amber-50/40 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock
                  className={`h-4 w-4 ${
                    checks.identityCompleted ? "text-emerald-700" : "text-amber-700"
                  }`}
                />
                <div>
                  <span className="font-bold">Aadhaar & PAN Identity Compliance</span>
                  <p className="text-[11px] text-slate-500">
                    {checks.identityCompleted
                      ? "Aadhaar & PAN details on file and encrypted"
                      : "Aadhaar number and PAN number required"}
                  </p>
                </div>
              </div>
              {checks.identityCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleAction("/dashboard?tab=profile")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 shadow-sm transition"
          >
            Complete My Profile <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
