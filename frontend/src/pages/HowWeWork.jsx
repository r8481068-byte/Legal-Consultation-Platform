import { Link } from "react-router-dom";
import {
  Scale,
  Search,
  Calendar,
  CreditCard,
  Video,
  Lock,
  Star,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  PhoneCall,
  Users,
  Shield,
  HelpCircle,
} from "lucide-react";

export default function HowWeWork() {
  const steps = [
    {
      step: 1,
      title: "Explore Practice Areas & Filter Advocates",
      desc: "Begin your consultation journey by selecting your relevant legal category (such as Property, Criminal, Family, Civil, or Corporate Law). Use our directory filters to sort advocates by city jurisdiction, years of trial practice, and transparent fees.",
      badge: "Discovery",
      details: [
        "Filter by practice area, court jurisdiction, and city",
        "View upfront consultation fees with zero hidden surcharges",
        "Inspect verified Advocate credentials before booking"
      ]
    },
    {
      step: 2,
      title: "Inspect Verified Advocate Credentials",
      desc: "Open the advocate's detailed profile to review verified State Bar Council enrolment, educational qualifications (e.g. LL.B., LL.M.), consultation modes (Video or In-Person), and genuine post-consultation client reviews.",
      badge: "Transparency",
      details: [
        "State Bar Council enrolment details and bar ID verification",
        "Degree credentials and years of active court trial practice",
        "100% verified 5-star rating breakdown across communication & advice"
      ]
    },
    {
      step: 3,
      title: "Select an Open Slot from the Live Schedule",
      desc: "Choose an available date and time slot directly from the advocate's live calendar. You don't have to wait for manual phone coordination—what you see is what is available.",
      badge: "Real-Time Booking",
      details: [
        "Direct calendar slot reservation without scheduling friction",
        "Select your preferred consultation mode (WebRTC Video or In-Person)",
        "Add brief, confidential case background notes for the advocate"
      ]
    },
    {
      step: 4,
      title: "Confirm Booking & Complete Secure Payment",
      desc: "Your appointment is logged with pending status for advocate confirmation. Complete the consultation fee securely via integrated Razorpay gateway (supporting UPI, cards, and net banking). All fees are strictly server-calculated directly from the advocate's database rate.",
      badge: "Tamper-Proof Checkout",
      details: [
        "Encrypted payment processing via Razorpay Orders API",
        "HMAC-SHA256 server-side signature verification",
        "Instant digital receipt accessible and printable in your dashboard"
      ]
    },
    {
      step: 5,
      title: "Attend Private WebRTC Video Consultation",
      desc: "At the scheduled consultation time, enter your appointment card and click 'Join Video Consultation'. You enter a secure pre-call waiting room to test camera and microphone permissions before directly connecting with your advocate over encrypted WebRTC.",
      badge: "Encrypted Room",
      details: [
        "Browser-based peer connection without external app downloads",
        "Pre-call device permissions preview and waiting room",
        "Real-time in-call timer and audio/video controls"
      ]
    },
    {
      step: 6,
      title: "Share Confidential Case Files in Private Storage",
      desc: "Upload contracts, agreements, notices, or court pleadings (up to 15MB) directly to your appointment. Files are saved in private isolated server storage and streamed only to authorized session participants.",
      badge: "Private Documents",
      details: [
        "Private storage outside publicly accessible web folders",
        "MIME-validated PDF, Word, and image document uploads",
        "Authenticated streaming downloads restricted to you and your lawyer"
      ]
    },
    {
      step: 7,
      title: "Submit a Verified Review & Rating",
      desc: "Following the conclusion of your consultation, submit verified feedback on communication clarity, punctuality, and professional advice. Reviews are restricted strictly to eligible clients who completed sessions, safeguarding rating integrity.",
      badge: "Accountability",
      details: [
        "Multi-criteria rating: Communication, Advice Clarity, Punctuality",
        "Automatic recalculation of the advocate's platform average score",
        "Help future clients make informed consultation decisions"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="text-xs font-semibold text-amber-400 hover:text-white transition"
          >
            ← Back to Home
          </Link>

          <div className="mt-4 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Scale className="h-3.5 w-3.5" /> Transparent Consultation Process
            </span>
            <h1 className="text-3xl font-black text-white sm:text-5xl">
              How LegalConnect Works
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              LegalConnect bridges citizens with verified advocates through a structured, transparent, and technology-driven workflow. Here is how your consultation journey unfolds from discovery to verified review.
            </p>
          </div>
        </div>
      </section>

      {/* 2. STEP-BY-STEP TIMELINE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 uppercase tracking-wider">
            7-Step Consultation Journey
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            From Search to Professional Legal Advice
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Every step is designed with verified credentials, server-side security, and mutual clarity in mind.
          </p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 sm:before:left-1/2 sm:before:-translate-x-1/2">
          {steps.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={item.step}
                className={`relative flex flex-col sm:flex-row items-start ${
                  isEven ? "sm:flex-row-reverse" : ""
                } gap-6 sm:gap-12`}
              >
                {/* Step Marker Dot */}
                <div className="absolute left-5 sm:left-1/2 -translate-x-1/2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-950 text-amber-400 font-black text-sm border-4 border-slate-50 shadow-md z-10">
                  {item.step}
                </div>

                {/* Content Box */}
                <div className="ml-12 sm:ml-0 sm:w-1/2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-amber-400/15 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Step {item.step} of 7
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Key Features:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {item.details.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. PLATFORM INTEGRITY PILLARS */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
              Platform Standards
            </span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Our Security & Verification Pillars
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">
              Honest commitments regarding how credentials, payments, and communications are safeguarded.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <ShieldCheck className="h-8 w-8 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Bar Council Verification</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Advocates undergo administrative verification of enrollment details and certificates prior to public listing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <Lock className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Private Case Isolation</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Uploaded case files are isolated outside public web directories and streamed only via authenticated session tokens.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <CreditCard className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Server-Calculated Fees</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Prices are fetched exclusively from the advocate's database profile. Client-side price tampering is completely prevented.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <Award className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Eligible Reviews Only</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Review submissions are restricted exclusively to clients who completed verified consultation sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950 text-amber-400 mx-auto shadow-md">
            <Scale className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Ready to Begin Your Consultation?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Browse our directory of approved advocates across 19 legal domains, inspect live open slots, or submit a question to our community legal panel.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/lawyers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-amber-300 transition shadow-md"
            >
              <PhoneCall className="h-4 w-4" /> Find an Advocate
            </Link>

            <Link
              to="/legal-services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-blue-900 transition"
            >
              <Briefcase className="h-4 w-4 text-amber-400" /> Explore 19 Services
            </Link>

            <Link
              to="/ask-question"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Ask a Free Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
