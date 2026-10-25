import { Printer, X, CheckCircle, ShieldCheck } from "lucide-react";

export default function ReceiptModal({ appointment, isOpen, onClose }) {
  if (!isOpen || !appointment) return null;

  const payment = appointment.payment || {};
  const lawyer = appointment.lawyer || {};
  const lawyerUser = lawyer.user || {};
  const lawyerName = lawyerUser.name || "Advocate";
  const amountPaise = payment.amount || Math.round((lawyer.consultationFee || 0) * 100);
  const amountRupees = (amountPaise / 100).toLocaleString("en-IN");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-bold text-slate-900">Payment Receipt</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-900 uppercase tracking-wide">
                  Payment Captured Successfully
                </p>
                <p className="text-xs text-green-700">
                  Transaction verified through Razorpay Gateway
                </p>
              </div>
            </div>
            <span className="text-xl font-extrabold text-green-900">
              ₹{amountRupees}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {payment.razorpayPaymentId || "Recorded on booking"}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Razorpay Order ID</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {payment.razorpayOrderId || "N/A"}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Appointment Reference</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {appointment._id}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Consultation With</span>
              <span className="font-semibold text-slate-800">{lawyerName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Consultation Date & Time</span>
              <span className="font-semibold text-slate-800">
                {new Date(appointment.scheduledAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Type & Duration</span>
              <span className="font-semibold text-slate-800 capitalize">
                {appointment.consultationType} ({appointment.durationMinutes || 30} mins)
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-800">Total Paid</span>
              <span className="text-base font-extrabold text-blue-900">₹{amountRupees}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 text-center">
            This is an official electronic payment acknowledgment for legal consultation services booked via LegalConnect.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
