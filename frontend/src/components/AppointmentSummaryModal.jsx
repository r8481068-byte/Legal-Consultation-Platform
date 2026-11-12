import {
  FileText,
  Video,
  CheckCircle,
  X,
  Printer,
} from "lucide-react";

export default function AppointmentSummaryModal({
  appointment,
  isOpen,
  onClose,
  onOpenDocuments,
  onOpenChat,
}) {
  if (!isOpen || !appointment) return null;

  const client = appointment.client || {};
  const isVideo = appointment.consultationType === "video";

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    if (!date) return "Not recorded";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Consultation Summary</h2>
              <p className="text-xs text-blue-200">Ref #{appointment._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 print:p-0">
          {/* Status banner */}
          <div
            className={`flex items-center justify-between rounded-2xl p-4 border ${
              appointment.status === "completed"
                ? "bg-green-50 border-green-200 text-green-900"
                : appointment.status === "confirmed"
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-5 w-5 shrink-0 ${
                  appointment.status === "completed"
                    ? "text-green-700"
                    : appointment.status === "confirmed"
                    ? "text-blue-700"
                    : "text-amber-600"
                }`}
              />
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    appointment.status === "completed"
                      ? "text-green-800"
                      : appointment.status === "confirmed"
                      ? "text-blue-800"
                      : "text-amber-800"
                  }`}
                >
                  Status: {appointment.status || "Completed"}
                </p>
                <p
                  className={`text-xs ${
                    appointment.status === "completed"
                      ? "text-green-700"
                      : appointment.status === "confirmed"
                      ? "text-blue-700"
                      : "text-amber-700"
                  }`}
                >
                  {appointment.status === "confirmed"
                    ? "This consultation session is confirmed and ready for consultation."
                    : appointment.status === "pending"
                    ? "This consultation request is pending advocate confirmation."
                    : "This legal consultation session was successfully concluded."}
                </p>
              </div>
            </div>

            {appointment.isPaid ? (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 shrink-0">
                Fee Paid
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shrink-0">
                Fee Pending
              </span>
            )}
          </div>

          {/* Advocate Details (If populated) */}
          {appointment.lawyer && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Advocate Details
              </h3>
              <div className="flex items-center gap-3">
                {appointment.lawyer.user?.profileImage ? (
                  <img
                    src={appointment.lawyer.user.profileImage}
                    alt="Advocate"
                    className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white font-bold text-sm">
                    {appointment.lawyer.user?.name
                      ? appointment.lawyer.user.name.charAt(0)
                      : "A"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Advocate {appointment.lawyer.user?.name || "Verified Counsel"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {Array.isArray(appointment.lawyer.specialization)
                      ? appointment.lawyer.specialization.join(", ")
                      : appointment.lawyer.specialization || "Legal Counsel"}
                    {appointment.lawyer.city && ` • ${appointment.lawyer.city}`}
                    {appointment.lawyer.barCouncilId &&
                      ` • Bar ID: ${appointment.lawyer.barCouncilId}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Client Details
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white font-bold text-sm">
                {client.name ? client.name.charAt(0) : "C"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {client.name || "Client Name"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {client.email || "No email available"}
                </p>
              </div>
            </div>
          </div>

          {/* Consultation Session Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Session Metadata
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Scheduled Date & Time</span>
                <span className="font-bold text-slate-800">{formatDate(appointment.scheduledAt)}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Consultation Mode</span>
                <span className="font-bold text-slate-800 capitalize flex items-center gap-1">
                  {isVideo ? <Video className="h-3.5 w-3.5 text-blue-700" /> : null}
                  {appointment.consultationType} ({appointment.durationMinutes || 30} mins)
                </span>
              </div>

              {appointment.callStartedAt && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Call Commenced</span>
                  <span className="font-bold text-slate-800">{formatDate(appointment.callStartedAt)}</span>
                </div>
              )}

              {appointment.callEndedAt && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Call Concluded</span>
                  <span className="font-bold text-slate-800">{formatDate(appointment.callEndedAt)}</span>
                </div>
              )}

              {appointment.meetingRoomId && (
                <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Encrypted WebRTC Room ID</span>
                  <span className="font-mono text-xs font-bold text-blue-900">{appointment.meetingRoomId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Issue & Consultation Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Case Issue / Initial Client Notes
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {appointment.notes || "No additional case notes provided by the client."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Printer className="h-4 w-4" />
            Print Summary
          </button>

          <div className="flex items-center gap-2">
            {onOpenDocuments && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDocuments(appointment);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Case Documents
              </button>
            )}
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(appointment);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Chat
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
