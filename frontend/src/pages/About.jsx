import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Scale,
  ShieldCheck,
  Video,
  Award,
  Users,
  HeartHandshake,
  Building2,
  Lock,
  Eye,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ChevronRight,
  Briefcase
} from "lucide-react";

export default function About() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-bold">About Us</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Scale className="h-3.5 w-3.5" /> About LegalConnect
            </span>
            <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight">
              Bridging Citizens & Verified Legal Counsel Across India
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              LegalConnect is an independent consultation and technological scheduling platform designed to make expert legal advice accessible, transparent, and secure for individuals, families, and businesses.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To build India’s most trusted and accessible digital legal consultation ecosystem, where citizens can seek timely counsel with complete dignity, transparency in fees, and absolute peace of mind.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To eliminate barriers of geography and uncertainty by connecting clients directly with verified advocates through secure WebRTC video consultations, private document sharing, and ethical compliance.
            </p>
          </div>
        </div>

        {/* Services for Individuals and Businesses */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Comprehensive Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Legal Services for Individuals & Corporates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Whether you need personal guidance or specialized corporate advisory, LegalConnect accommodates diverse legal requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">For Individuals & Families</h3>
                  <p className="text-[11px] text-slate-500">Protecting your personal rights, family, and assets</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Property Due Diligence:</strong> Verification of title deeds, encumbrance certificates, and RERA disputes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Family & Matrimonial:</strong> Mutual divorce, custody, alimony, and domestic violence protections.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Criminal Defense & Bail:</strong> FIR quashing, anticipatory bail, and Section 41A notice assistance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Consumer & Cyber Protection:</strong> UPI frauds, defective products, and consumer forum complaints.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">For Startups & Businesses</h3>
                  <p className="text-[11px] text-slate-500">Commercial contracts, compliance, and corporate disputes</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Founders & Equity Advisory:</strong> Founders' agreements, ESOP pools, and term sheet vetting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Cheque Bounce & Debt Recovery:</strong> Section 138 statutory notices and summary commercial suits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Intellectual Property:</strong> Trademark objections, copyright licensing, and patent filings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Employment & Labour Law:</strong> POSH compliance, non-compete covenants, and workforce policies.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lawyer Onboarding and Verification Process */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Integrity First
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Our Lawyer Verification Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              We uphold professional standards. Only advocates who complete our administrative credential review are enabled for client appointment scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Profile Submission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advocates provide Bar Council enrollment number, State Bar jurisdiction, practice courts, and years of experience.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Administrative Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform administrators manually review credentials, photo identity, and qualifications before approving the account.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">Slot Configuration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approved advocates define their fixed consultation fee and configure real available calendar slots.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-xs font-bold text-white">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900">Verified Client Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only clients who attended completed sessions can submit ratings and written reviews, preventing manipulation.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <ShieldCheck className="h-7 w-7 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">Integrity & Ethics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adhering strictly to Bar Council ethical guidelines and honest presentation of qualifications.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <Lock className="h-7 w-7 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">Confidentiality</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                End-to-end encrypted video channels and private authorized document repositories.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <Eye className="h-7 w-7 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">Fee Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero surprise charges. Every lawyer profile displays fixed, upfront consultation fees before booking.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <Video className="h-7 w-7 text-blue-900" />
              <h3 className="text-sm font-bold text-slate-900">Accessibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consult leading legal minds from home, eliminating geographical hurdles and travel delays.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment to Professional Ethics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">
            Our Commitment to the Advocates Act, 1961
          </h2>
          <p>
            In compliance with the Advocates Act, 1961 and the Bar Council of India Rules, LegalConnect operates solely as an independent consultation and technological scheduling intermediary. The platform does not solicit legal work on behalf of advocates or engage in case outcome guarantees.
          </p>
          <p>
            Client confidentiality and privileged communications are maintained through private encrypted document storage and end-to-end authorized socket communication channels.
          </p>
        </div>

        {/* Final CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to Discuss Your Legal Requirements?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Browse our verified advocate directory or explore our 19 structured legal service domains today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition-colors"
            >
              <Scale className="h-4 w-4" /> Consult a Lawyer
            </Link>
            <Link
              to="/legal-services"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Browse Legal Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
