import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Scale,
  ChevronRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  PhoneCall,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Home as HomeIcon,
  Gavel,
  Heart,
  Users,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Globe,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";
import { getLegalServiceBySlug, LEGAL_SERVICES } from "../data/legalServicesData";
import { getLawyers } from "../services/lawyerService";
import LawyerCard from "../components/LawyerCard";

const iconMap = {
  Home: HomeIcon,
  Gavel: Gavel,
  Scale: Scale,
  Heart: Heart,
  Users: Users,
  Briefcase: Briefcase,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  CreditCard: CreditCard,
  Globe: Globe,
};

export default function LegalServiceDetail() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const service = useMemo(() => getLegalServiceBySlug(categorySlug), [categorySlug]);
  const [matchingLawyers, setMatchingLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchMatchingLawyers() {
      if (!service) return;
      setLoadingLawyers(true);
      try {
        const res = await getLawyers({
          specialization: service.specialization,
        });
        if (isMounted) {
          setMatchingLawyers(res.lawyers || []);
        }
      } catch {
        if (isMounted) setMatchingLawyers([]);
      } finally {
        if (isMounted) setLoadingLawyers(false);
      }
    }
    fetchMatchingLawyers();
    return () => {
      isMounted = false;
    };
  }, [service]);

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h1 className="text-xl font-bold text-slate-900">
            Legal Category Not Found
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            The legal service category you are looking for does not exist or has been moved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/legal-services"
              className="rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
            >
              All Legal Services
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const Icon = iconMap[service.iconName] || Scale;

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. BREADCRUMBS & HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-amber-400 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/legal-services" className="hover:text-amber-400 transition">
              Legal Services
            </Link>
            <span>/</span>
            <span className="text-amber-300 font-semibold">{service.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                    Specialized Practice Area
                  </span>
                  <h1 className="mt-1 text-2xl font-black text-white sm:text-4xl">
                    {service.title}
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                {service.fullDescription}
              </p>

              {/* Statutory Framework Badges */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                  Governing Acts & Statutes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.statutoryFramework.map((act) => (
                    <span
                      key={act}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-slate-200 border border-white/10"
                    >
                      <Scale className="h-3 w-3 text-amber-400" />
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Need Legal Consultation?
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Connect with verified advocates specializing in {service.shortTitle} for case assessment, document review, and strategic guidance.
              </p>

              <div className="mt-5 space-y-2.5">
                <Link
                  to={`/lawyers?specialization=${encodeURIComponent(service.specialization)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-950 hover:bg-amber-300 transition shadow-md"
                >
                  <Calendar className="h-4 w-4" /> Book {service.shortTitle} Lawyer
                </Link>

                <Link
                  to="/ask-question"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  <HelpCircle className="h-4 w-4 text-amber-400" /> Ask a Free Question
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct Slot Booking</span>
                <span>Fixed Rate</span>
                <span>Encrypted Video</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT BODY */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        {/* A. COMMON LEGAL ISSUES & ADVOCATE ASSISTANCE */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Common Issues */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" /> Common Legal Issues Handled
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Matters and dispute categories typically requiring advocate representation in {service.shortTitle}:
            </p>

            <ul className="space-y-3">
              {service.commonIssues.map((issue) => (
                <li key={issue} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    {issue}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Types of Lawyer Assistance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-blue-700" /> How a Qualified Advocate Helps You
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Legal remedies, documentation, and court actions provided by our panel lawyers:
            </p>

            <ul className="space-y-3">
              {service.lawyerAssistance.map((assist) => (
                <li key={assist} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-900">
                    ✓
                  </span>
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    {assist}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* B. GENERAL LEGAL PROCESS TIMELINE */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 uppercase tracking-wider">
              Visual Workflow
            </span>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              General Process for {service.shortTitle} Matters
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A general informational outline of how legal disputes in this area are resolved through counsel:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.processSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950 text-amber-400 text-xs font-bold">
                    Step {step.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Phase {step.step}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-slate-400 italic">
            *Note: Procedural timelines vary depending on court jurisdiction, evidentiary requirements, and factual complexity. This represents general legal information, not tailored legal counsel.
          </p>
        </section>

        {/* C. COMMONLY RELEVANT DOCUMENTS CHECKLIST */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900">
                Commonly Relevant Documents Checklist
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Having these papers ready can significantly accelerate your advocate's review during your consultation:
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {service.checklistDocuments.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-start gap-2 rounded-xl bg-white p-3 border border-amber-200/80 shadow-xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {doc}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                You can securely upload confidential PDF, Word, or image copies of these documents directly to your appointment card after booking.
              </p>
            </div>
          </div>
        </section>

        {/* D. LIVE MATCHING LAWYERS FROM DATABASE */}
        <section>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Available Advocates
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Verified {service.shortTitle} Advocates on LegalConnect
              </h2>
            </div>
            <Link
              to={`/lawyers?specialization=${encodeURIComponent(service.specialization)}`}
              className="text-xs font-bold text-blue-800 hover:text-blue-900"
            >
              View Filtered Directory →
            </Link>
          </div>

          {loadingLawyers ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading verified advocates...
            </div>
          ) : matchingLawyers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingLawyers.slice(0, 3).map((lawyer) => (
                <LawyerCard key={lawyer._id} lawyer={lawyer} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-lg mx-auto">
              <Scale className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                No Specific {service.shortTitle} Advocates Listed Yet
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Browse our complete lawyer discovery directory to consult multi-disciplinary advocates or post your query for free.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  to="/lawyers"
                  className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  All Advocates
                </Link>
                <Link
                  to="/ask-question"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ask a Free Question
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* E. FREQUENTLY ASKED QUESTIONS */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">
                Frequently Asked Questions about {service.shortTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Key questions answered regarding legal rights, timelines, and court remedies:
              </p>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-900"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-slate-500 transition-transform ${
                          isOpen ? "rotate-90 text-blue-700" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* F. BOTTOM NAVIGATION FOOTNOTE */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/legal-services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:underline"
          >
            ← Back to All Legal Services
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/lawyers"
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Browse Lawyers
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to="/blogs"
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Legal Guide
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to="/how-we-work"
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              How We Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
