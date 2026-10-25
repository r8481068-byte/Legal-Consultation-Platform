import { Link } from "react-router-dom";
import { FileText, Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">LegalConnect Policies</span>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl mt-1">Terms of Use</h1>
            <p className="text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">1. Platform Nature & Scope</h2>
            <p>
              LegalConnect provides a technological communication and scheduling marketplace connecting independent verified advocates and individuals seeking legal counsel. LegalConnect is not a law firm, does not provide legal representation, and does not engage in advocate referral fee sharing prohibited under the Bar Council of India Rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">2. Consultations & Advocate–Client Relationship</h2>
            <p>
              Consultations scheduled through the platform occur directly between the client and the chosen advocate. The formation of a formal advocate–client retainer relationship occurs solely upon mutual agreement between the parties during or following the consultation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">3. Fees & Payment Processing</h2>
            <p>
              Consultation fees are set by the individual advocates. Payments are processed securely via Razorpay in INR. A consultation slot is reserved upon booking and subject to confirmation by the advocate. Cancellations and refunds are governed by the platform cancellation guidelines prior to slot commencement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">4. Code of Conduct & Genuine Feedback</h2>
            <p>
              Clients and advocates agree to maintain professional courtesy during audio/video consultations. Post-consultation reviews must reflect authentic consultation experiences; defamatory, fraudulent, or manipulated reviews are subject to immediate administrative moderation and removal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
