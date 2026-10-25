import { Link } from "react-router-dom";
import {
  Scale,
  ShieldCheck,
  Award,
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { LEGAL_SERVICES } from "../data/legalServicesData";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Top 10 services for footer display
  const footerServices = LEGAL_SERVICES.slice(0, 10);

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* 1. TOP HIGHLIGHTS / TRUST BANNER */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900/50 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Advocates</h4>
              <p className="text-xs text-slate-400">Strict Bar Council enrollment verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-900/40 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Genuine Client Reviews</h4>
              <p className="text-xs text-slate-400">100% verified post-consultation ratings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40 text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Confidential & Secure</h4>
              <p className="text-xs text-slate-400">Encrypted WebRTC & isolated documents</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-900/40 text-purple-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Pricing</h4>
              <p className="text-xs text-slate-400">Direct booking with fixed fee</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FIVE-COLUMN MAIN DIRECTORY */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Column 1: Our Legal Services */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Our Legal Services
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/legal-services/${service.slug}`}
                    className="hover:text-white transition"
                  >
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  to="/legal-services"
                  className="font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                >
                  View All 19 Services <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Lawyers by City */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Lawyers by City
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/lawyers?city=New%20Delhi" className="hover:text-white transition">
                  Delhi Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Bangalore" className="hover:text-white transition">
                  Bangalore Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Mumbai" className="hover:text-white transition">
                  Mumbai Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Chennai" className="hover:text-white transition">
                  Chennai Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Gurgaon" className="hover:text-white transition">
                  Gurgaon Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Noida" className="hover:text-white transition">
                  Noida Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Jaipur" className="hover:text-white transition">
                  Jaipur Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Chandigarh" className="hover:text-white transition">
                  Chandigarh Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Pune" className="hover:text-white transition">
                  Pune Advocates
                </Link>
              </li>
              <li>
                <Link to="/lawyers?city=Hyderabad" className="hover:text-white transition">
                  Hyderabad Advocates
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/lawyers" className="font-bold text-blue-400 hover:text-blue-300 transition">
                  View All Cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: How We Work & Journey */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Consultation Journey
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/how-we-work" className="hover:text-white transition">
                  How Consultation Works
                </Link>
              </li>
              <li>
                <Link to="/lawyers" className="hover:text-white transition">
                  Find Approved Lawyers
                </Link>
              </li>
              <li>
                <Link to="/lawyers" className="hover:text-white transition">
                  Select Calendar Slots
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Track Your Appointments
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" className="hover:text-white transition">
                  WebRTC Video Rooms
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" className="hover:text-white transition">
                  Document Sharing Privacy
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" className="hover:text-white transition">
                  Verified Review Process
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/how-we-work" className="font-bold text-amber-400 hover:text-amber-300 transition">
                  Explore How We Work →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Guide & Resources */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Legal Guide & Codes
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/blogs" className="hover:text-white transition">
                  Legal Education Articles
                </Link>
              </li>
              <li>
                <Link to="/blogs/property-title-verification-guide-india" className="hover:text-white transition">
                  Property Title Verification
                </Link>
              </li>
              <li>
                <Link to="/blogs/understanding-anticipatory-bail-bns-crpc" className="hover:text-white transition">
                  Anticipatory Bail Guide
                </Link>
              </li>
              <li>
                <Link to="/blogs/mutual-consent-divorce-fast-track-process" className="hover:text-white transition">
                  Mutual Consent Divorce
                </Link>
              </li>
              <li>
                <Link to="/blogs/founders-agreement-essential-clauses-startups" className="hover:text-white transition">
                  Startup Founders Agreement
                </Link>
              </li>
              <li>
                <Link to="/legal-advice?tab=bns" className="hover:text-white transition">
                  Bharatiya Nyaya Sanhita (BNS)
                </Link>
              </li>
              <li>
                <Link to="/legal-advice?tab=ipc" className="hover:text-white transition">
                  IPC & CrPC Sections
                </Link>
              </li>
              <li>
                <Link to="/legal-advice?tab=hma" className="hover:text-white transition">
                  Hindu Marriage Act
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/blogs" className="font-bold text-blue-400 hover:text-blue-300 transition">
                  Browse All Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company & Support */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Company & Support
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/lawyer/signup" className="text-amber-400 hover:text-amber-300 transition font-semibold">
                  Register as Advocate
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-blue-300 hover:text-white transition font-semibold">
                  Register as Client
                </Link>
              </li>
              <li>
                <Link to="/lawyer/documentation" className="hover:text-white transition">
                  Lawyer Documentation
                </Link>
              </li>
              <li>
                <Link to="/ask-question" className="text-amber-300 hover:text-amber-200 transition font-medium">
                  Ask a Free Question
                </Link>
              </li>
              <li>
                <Link to="/legal-aid" className="hover:text-white transition">
                  Free Legal Aid Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. FREE LEGAL AID PROMINENT HIGHLIGHT */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/60 to-slate-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300">
                <HeartHandshake className="h-3.5 w-3.5" />
                Constitutional Right to Justice
              </span>
              <h4 className="text-lg font-bold text-white">Free Legal Aid in India</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore statutory information about available free legal aid resources, state legal services authorities, and eligibility criteria under the Legal Services Authorities Act, 1987.
              </p>
            </div>
            <Link
              to="/legal-aid"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition"
            >
              Explore Free Legal Aid Info →
            </Link>
          </div>
        </div>

        {/* 4. REAL PROJECT CONTACT & QUICK NAVIGATION */}
        <div className="mt-10 border-t border-slate-800 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
            <Link to="/about" className="hover:text-white transition">
              About Us
            </Link>
            <span>•</span>
            <Link to="/legal-services" className="hover:text-white transition text-amber-400">
              Legal Services
            </Link>
            <span>•</span>
            <Link to="/how-we-work" className="hover:text-white transition">
              How We Work
            </Link>
            <span>•</span>
            <Link to="/blogs" className="hover:text-white transition">
              Legal Guide
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition">
              Terms of Use
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition">
              Contact Us
            </Link>
            <span>•</span>
            <Link to="/lawyer/signup" className="hover:text-white transition text-amber-400 font-semibold">
              Advocate Signup
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-white transition text-blue-400 font-semibold">
              Client Signup
            </Link>
          </div>
        </div>
      </div>

      {/* 5. FOOTER BOTTOM */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-slate-300">LegalConnect</span>
            <span>—</span>
            <span>Empowering Citizens with Transparent Legal Consultation</span>
          </div>

          <p className="text-center sm:text-right">
            © {currentYear} LegalConnect Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
