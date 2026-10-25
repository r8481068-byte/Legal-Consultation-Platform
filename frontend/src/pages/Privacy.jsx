import { Link } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Data Governance & Confidentiality</span>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl mt-1">Privacy Policy</h1>
            <p className="text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">1. Information Collection</h2>
            <p>
              We collect account registration data (name, email address, phone number), advocate professional credentials (Bar Council enrollment ID, education, specialization), and appointment consultation notes strictly for the facilitation of legal consultation services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">2. Document Security & Storage Isolation</h2>
            <p>
              Case documents shared by clients and advocates (PDFs, images, contracts) are stored in private, non-public directory storage with server-side authorization. Download access is strictly limited to authenticated consultation participants via streaming endpoints. Documents are never exposed through indexable public URLs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">3. Real-Time Video & WebRTC Privacy</h2>
            <p>
              Real-time video consultations utilize peer-to-peer WebRTC connections. Media streams (audio and video) are encrypted end-to-end between the participants' devices and are not recorded or archived on platform servers without express statutory consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase">4. Financial Data Protection</h2>
            <p>
              Payment processing is executed via Razorpay compliant with PCI-DSS standards. LegalConnect does not store complete debit/credit card numbers or sensitive banking credentials on internal databases.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
