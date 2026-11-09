import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Scale,
  PhoneCall,
  HelpCircle,
  ShieldCheck,
  Video,
  FileCheck,
  Users,
  Award,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Home as HomeIcon,
  Heart,
  Gavel,
  CheckCircle2,
  Clock,
  Lock,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Search,
  FileText,
  ArrowRight,
  Calendar,
  Sparkles,
  Globe,
  MapPin,
  Check,
  Zap,
} from "lucide-react";
import { LEGAL_SERVICES } from "../data/legalServicesData";

// Icon mapping helper
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

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  // Top 8 services for homepage grid
  const featuredServices = LEGAL_SERVICES.slice(0, 8);

  const howItWorksSteps = [
    {
      step: 1,
      title: "Explore Services or Find a Lawyer",
      desc: "Filter approved advocates across India by court jurisdiction, specialization, trial experience, and transparent fees.",
      icon: Search,
    },
    {
      step: 2,
      title: "View Verified Profile & Ratings",
      desc: "Inspect Bar Council enrollment credentials, degrees, languages, and 100% genuine post-consultation reviews.",
      icon: ShieldCheck,
    },
    {
      step: 3,
      title: "Select an Open Calendar Slot",
      desc: "Choose an available date and time slot directly from the advocate's live schedule without back-and-forth calls.",
      icon: Calendar,
    },
    {
      step: 4,
      title: "Book & Pay Fixed Fee Safely",
      desc: "Confirm your appointment and pay the advocate's exact consultation fee through integrated Razorpay with instant receipt.",
      icon: CreditCard,
    },
    {
      step: 5,
      title: "Attend Video Consultation",
      desc: "Join the private WebRTC consultation room with camera/mic check, live waiting room, and in-call timer.",
      icon: Video,
    },
    {
      step: 6,
      title: "Share Case Documents Securely",
      desc: "Upload confidential agreements, notices, or pleadings to isolated authenticated storage accessible only to your lawyer.",
      icon: Lock,
    },
  ];

  const whyChooseBenefits = [
    {
      title: "Access to Relevant Legal Expertise",
      desc: "Connect directly with practicing advocates specializing in property, criminal, civil, family, corporate, and cyber law nationwide.",
      icon: Scale,
      tag: "Practicing Advocates",
    },
    {
      title: "Convenience & Zero Travel Friction",
      desc: "Consult top advocates across Delhi, Mumbai, Bengaluru, and other cities from the comfort of your home via encrypted video or audio.",
      icon: Clock,
      tag: "Time Saving",
    },
    {
      title: "Transparent Consultation Fees",
      desc: "Fixed fees set directly by advocates on their profile. Server-validated checkout with zero hidden surcharges or surprise billing.",
      icon: CreditCard,
      tag: "Fixed Pricing",
    },
    {
      title: "Confidential Handling of Information",
      desc: "End-to-end authorized sessions, authenticated document downloads, and strict adherence to client–advocate confidentiality.",
      icon: Lock,
      tag: "Private & Secure",
    },
    {
      title: "Ability to Explore Legal Options First",
      desc: "Evaluate strategies, understand court jurisdictions, and clarify statutory remedies before committing to physical court litigation.",
      icon: ShieldCheck,
      tag: "Strategic Clarity",
    },
    {
      title: "Reviews From Eligible Clients Only",
      desc: "Feedback is strictly gated to clients with completed consultations, preventing fake testimonials or distorted star ratings.",
      icon: Award,
      tag: "100% Genuine",
    },
  ];

  const faqs = [
    {
      q: "How can I find the right lawyer on LegalConnect?",
      a: "You can search by legal practice area (such as Property, Criminal, Family, Civil, Corporate), city jurisdiction, years of experience, and consultation fee using our discovery directory. Each approved advocate profile displays verified Bar Council enrolment, education, languages, and genuine client ratings.",
    },
    {
      q: "How do online legal consultations work?",
      a: "Once you select an advocate and book an available slot, your appointment is recorded. Upon lawyer confirmation and payment, you can click 'Join Video Consultation' from your appointments page at the scheduled time to enter the WebRTC room with waiting room and device previews.",
    },
    {
      q: "Can I share legal documents with my advocate?",
      a: "Yes. From your appointment card, click 'Documents' to upload PDF, Word, or image case files up to 15MB. All files are stored outside public web directories and can only be accessed or downloaded by you and your booked advocate.",
    },
    {
      q: "How are consultation fees calculated and paid?",
      a: "All consultation fees are fixed by advocates and calculated strictly on the backend from the advocate's profile rate. Payments are processed securely via Razorpay (supporting UPI, cards, and net banking) with instant digital receipts.",
    },
    {
      q: "Are lawyers on the platform verified?",
      a: "Yes. Advocates submitting applications on LegalConnect provide their State Bar Council ID, law college, graduation year, and enrollment certificates. Platform administrators review these credentials before approving profiles for public discovery.",
    },
    {
      q: "Can I cancel an appointment or seek a refund?",
      a: "Clients can cancel pending appointments directly from their dashboard. For confirmed bookings or disputed consultations, our administrative dispute team reviews refund requests based on our fair cancellation policy.",
    },
    {
      q: "How can I submit a review after my consultation?",
      a: "As soon as your consultation session concludes or is marked complete, your appointment card displays a 'Review Consultation' button. You can rate communication, advice clarity, professionalism, and punctuality with descriptive feedback.",
    },
    {
      q: "How can an advocate join the LegalConnect panel?",
      a: "Practicing advocates enrolled with any State Bar Council in India can apply via our 'Register as Advocate' portal. Complete the 4-step onboarding wizard with enrollment documents for administrative review.",
    },
  ];

  return (
    <div className="bg-[#F8FAFC]">
      {/* 1. HERO SECTION (Deep Navy Atmosphere with Sovereign Gold Highlights) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070D1E] via-[#0B132B] to-[#101C3A] px-4 pt-16 pb-20 text-white sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        {/* Subtle radial ambient light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/12 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-[#D9A441] shadow-2xs">
              <Scale className="h-4 w-4 text-[#D9A441]" />
              <span>India's Verified Online Legal Consultation Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
              Expert Legal Advice & Consultation <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-200 via-[#F5BE57] to-[#D9A441] bg-clip-text text-transparent">
                From Verified Advocates Online
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mx-auto max-w-2xl text-base font-normal text-slate-300 sm:text-lg leading-relaxed">
              Connect directly with verified legal practitioners across India. Book confidential video consultations, review legal agreements, and receive authoritative guidance on your legal concerns.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col items-center justify-center gap-3.5 sm:flex-row flex-wrap">
              <Link
                to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-7 py-3.5 text-xs font-black tracking-wide text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-[#c89432] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D9A441]"
              >
                <PhoneCall className="h-4 w-4 text-slate-950" />
                <span>TALK TO A LAWYER</span>
              </Link>

              <Link
                to="/legal-services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs font-bold tracking-wide text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Briefcase className="h-4 w-4 text-[#2457D6]" />
                <span>EXPLORE LEGAL SERVICES</span>
              </Link>

              <Link
                to={!user ? "/register?redirect=/ask-question" : "/ask-question"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-7 py-3.5 text-xs font-bold tracking-wide text-amber-300 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <HelpCircle className="h-4 w-4 text-amber-300" />
                <span>ASK A FREE QUESTION</span>
              </Link>
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-10 grid grid-cols-2 gap-4 border-t border-slate-800/80 text-left sm:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Bar Verified</p>
                  <p className="text-[11px] text-slate-400">Enrolled Advocates</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Encrypted Video</p>
                  <p className="text-[11px] text-slate-400">Private WebRTC Rooms</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D9A441] shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Genuine Reviews</p>
                  <p className="text-[11px] text-slate-400">Verified Client Feedback</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Fixed Rates</p>
                  <p className="text-[11px] text-slate-400">Zero Hidden Surcharges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Illustration Image */}
          <div className="mt-12 text-center">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-700/60 shadow-2xl shadow-black/60">
              <img
                src="/images/legalconnect_hero.jpg"
                alt="LegalConnect Online Legal Consultation"
                className="w-full object-cover max-h-[460px]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR ONLINE LEGAL CONSULTATION SERVICES */}
      <section className="py-20 bg-white border-t border-slate-200" id="services">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2457D6] border border-blue-200">
              Practice Specializations
            </span>
            <h2 className="font-heading mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Our Online Legal Consultation Services
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              LegalConnect enables you to explore specialized legal areas, review common legal issues, and connect directly with verified advocates having trial, advisory, and appellate experience across India.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredServices.map((service) => {
              const Icon = iconMap[service.iconName] || Scale;
              return (
                <article
                  key={service.slug}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B132B] to-[#101C3A] text-[#D9A441] shadow-2xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading mt-4 text-base font-bold text-slate-900 group-hover:text-[#2457D6] transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {service.summary}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Common Matters:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.commonIssues.slice(0, 3).map((issue) => (
                          <span
                            key={issue}
                            className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to={`/legal-services/${service.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 px-3 text-xs font-bold text-slate-900 shadow-2xs transition hover:bg-[#D9A441] hover:text-slate-950"
                    >
                      <span>Consult {service.shortTitle || service.title} Lawyer</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* More Legal Services Button */}
          <div className="mt-12 text-center">
            <Link
              to="/legal-services"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B132B] px-8 py-3.5 text-xs font-bold tracking-wide text-[#D9A441] shadow-md hover:bg-slate-900 transition"
            >
              <span>View All 19 Legal Services</span>
              <ArrowRight className="h-4 w-4 text-[#D9A441]" />
            </Link>
            <p className="mt-2.5 text-xs text-slate-500">
              Browse Property, Criminal, Corporate, Tax, Cyber Crime, Labour, NRI, and other specialized domains
            </p>
          </div>
        </div>
      </section>

      {/* 3. URGENT LEGAL ASSISTANCE CALLOUT BANNER */}
      <section className="bg-gradient-to-r from-[#D9A441] via-[#E5B558] to-[#D9A441] py-10 px-4 sm:px-6 lg:px-8 text-slate-950 shadow-inner">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/10 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-slate-950">
              <Zap className="h-3.5 w-3.5" /> Urgent Legal Concern?
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-950">
              Connect With an Available Advocate Today
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-900/80 max-w-2xl">
              Inspect verified advocates with live open slots, submit case notes, and schedule private video or phone consultations directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B132B] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-slate-900 transition"
            >
              <PhoneCall className="h-4 w-4 text-[#D9A441]" />
              <span>Browse Available Slots</span>
            </Link>
            <Link
              to={!user ? "/register?redirect=/ask-question" : "/ask-question"}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-950/30 bg-white/40 px-5 py-3.5 text-xs font-bold text-slate-950 hover:bg-white/60 transition"
            >
              <span>Post a Free Query</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW WE WORK (Step-by-step diagram) */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-200">
              Clear & Accountable Workflow
            </span>
            <h2 className="font-heading mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              How LegalConnect Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Experience a streamlined, accountable legal consultation journey from discovery to review in 6 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorksSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 shadow-2xs transition hover:bg-white hover:shadow-md hover:border-amber-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B132B] text-[#D9A441] font-black text-sm shadow-2xs">
                      {item.step}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="font-heading mt-4 font-bold text-slate-900 text-base">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Button to full How We Work page */}
          <div className="mt-12 text-center">
            <Link
              to="/how-we-work"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B132B] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-slate-900 transition"
              id="how-we-work-home-cta"
            >
              <span>Explore Complete Consultation Journey</span>
              <ArrowRight className="h-4 w-4 text-[#D9A441]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE ONLINE LEGAL CONSULTATION */}
      <section className="py-20 bg-[#0B132B] text-white border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30">
              Platform Integrity & Security
            </span>
            <h2 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Why Choose Online Legal Consultation & Advice?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Built on verified credentials, server-validated payments, encrypted communications, and genuine client reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseBenefits.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xs transition hover:border-[#D9A441]/50 hover:bg-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-[#D9A441] border border-amber-400/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-heading mt-4 font-bold text-white text-base">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. EXPERT LEGAL FAQS */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2457D6] border border-blue-200">
              Got Questions?
            </span>
            <h2 className="font-heading mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Clear answers regarding finding lawyers, scheduling slots, fee transparency, document sharing, and privacy safeguards.
            </p>
          </div>

          <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/50 transition duration-150 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-[#2457D6] focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#2457D6]">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#2457D6]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. ADVOCATE ONBOARDING CTA BANNER */}
      <section className="bg-gradient-to-r from-[#070D1E] via-[#0B132B] to-[#101C3A] py-16 text-white border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left gap-8">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
              <Scale className="h-3.5 w-3.5" /> For Legal Practitioners
            </span>
            <h3 className="font-heading text-2xl font-black sm:text-3xl">
              Are you a practicing Advocate?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join LegalConnect to accept digital consultations, manage bookable time slots, and connect with clients across India. Submit your Bar Council credentials for verification.
            </p>
          </div>

          <div className="mt-8 sm:mt-0 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/lawyer/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md hover:bg-[#c89432] transition"
            >
              Join as an Advocate →
            </Link>

            <Link
              to="/lawyer/documentation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Eligibility & Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
