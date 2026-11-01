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
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { LEGAL_SERVICES } from "../data/legalServicesData";

// Social Media SVG Icons
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Top 8 services for footer display (Preserved exactly as existing)
  const footerServices = LEGAL_SERVICES.slice(0, 8);

  // Initial 9 high-utility State Links for "Lawyers in India" section
  const footerStateLinks = [
    { name: "Lawyers in Delhi", to: "/lawyers-in-india/delhi" },
    { name: "Lawyers in Uttar Pradesh", to: "/lawyers-in-india/uttar-pradesh" },
    { name: "Lawyers in Haryana", to: "/lawyers-in-india/haryana" },
    { name: "Lawyers in Rajasthan", to: "/lawyers-in-india/rajasthan" },
    { name: "Lawyers in Madhya Pradesh", to: "/lawyers-in-india/madhya-pradesh" },
    { name: "Lawyers in Punjab", to: "/lawyers-in-india/punjab" },
    { name: "Lawyers in Bihar", to: "/lawyers-in-india/bihar" },
    { name: "Lawyers in Maharashtra", to: "/lawyers-in-india/maharashtra" },
    { name: "Lawyers in Karnataka", to: "/lawyers-in-india/karnataka" },
  ];

  // Configurable Social Links (Official WhatsApp is known, others configurable via env or placeholder)
  const socialProfiles = [
    {
      name: "Facebook",
      icon: FacebookIcon,
      url: import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com/legalconnect.official",
      ariaLabel: "Follow LegalConnect on Facebook",
      colorClass: "hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10"
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      url: import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/legalconnect.official",
      ariaLabel: "Follow LegalConnect on Instagram",
      colorClass: "hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/10"
    },
    {
      name: "X (Twitter)",
      icon: XIcon,
      url: import.meta.env.VITE_TWITTER_URL || "https://x.com/legalconnect_in",
      ariaLabel: "Follow LegalConnect on X (formerly Twitter)",
      colorClass: "hover:text-slate-100 hover:border-slate-400/50 hover:bg-white/10"
    },
    {
      name: "YouTube",
      icon: YouTubeIcon,
      url: import.meta.env.VITE_YOUTUBE_URL || "https://youtube.com/@legalconnect",
      ariaLabel: "Subscribe to LegalConnect YouTube channel",
      colorClass: "hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10"
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      url: import.meta.env.VITE_LINKEDIN_URL || "https://linkedin.com/company/legalconnect-india",
      ariaLabel: "Connect with LegalConnect on LinkedIn",
      colorClass: "hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/10"
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      url: "https://wa.me/918826669309",
      ariaLabel: "Chat with LegalConnect on WhatsApp: +91 8826669309",
      colorClass: "hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400"
    }
  ];

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-950 text-slate-300">
      {/* 1. TOP HIGHLIGHTS / TRUST BANNER (PRESERVED) */}
      <div className="border-b border-slate-800 bg-slate-900/70 py-6">
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

      {/* 2. THREE-COLUMN DIRECTORY: IMPORTANT LINKS, LEGAL SERVICES, LAWYERS IN INDIA */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Column A: Important Links (EXACTLY AS CURRENTLY APPEARING AND FUNCTIONING) */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Important Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/legal-services" className="hover:text-white transition">
                  Legal Services
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" className="hover:text-white transition">
                  How We Work / Consultation Journey
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white transition">
                  Legal Guide & Codes
                </Link>
              </li>
              <li>
                <Link to="/ipc-sections" className="hover:text-white transition text-amber-300 font-semibold">
                  IPC & BNS Sections
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms and Conditions
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/legal-aid" className="text-blue-400 hover:text-blue-300 transition">
                  Free Legal Aid Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column B: Our Legal Services (EXACTLY AS CURRENTLY APPEARING AND FUNCTIONING) */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Our Legal Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
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

          {/* Column C: Lawyers in India (UPDATED PER REQUIREMENT 2) */}
          <div>
            <h3 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider uppercase text-amber-400">
              Lawyers in India
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              {footerStateLinks.map((st) => (
                <li key={st.name}>
                  <Link to={st.to} className="hover:text-white transition">
                    {st.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-900">
                <Link
                  to="/lawyers-in-india"
                  className="font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 text-xs"
                >
                  View All →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. FULL-WIDTH HORIZONTAL DIVIDER (PER REQUIREMENT 6) */}
        <div className="my-10 border-t border-slate-800/90" />

        {/* 4. SEPARATE ROW WITH TWO SIDE-BY-SIDE SECTIONS: SOCIAL LINKS & CONTACT (PER REQUIREMENT 6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT: SOCIAL LINKS */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider uppercase text-amber-400">
              Connect With Us On Social Media
            </h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Stay informed about landmark judicial rulings, legal awareness articles, and client consultation rights through our official digital channels.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {socialProfiles.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className={`inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition ${item.colorClass}`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-40 ml-0.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT: CONTACT INFORMATION */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider uppercase text-amber-400">
              Contact Information & Registered Office
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {/* Address */}
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=521+Mukherjee+Nagar+Delhi+110009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition leading-relaxed flex items-center gap-1.5"
                  title="View Registered Office on Google Maps"
                >
                  <span>Address: 521, Mukherjee Nagar, Delhi-110009</span>
                  <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                </a>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Phone: </span>
                <a
                  href="tel:8826669309"
                  className="text-white hover:text-amber-300 font-semibold transition"
                >
                  8826669309
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Email: </span>
                <a
                  href="mailto:mylegalconsultants.mlc@gmail.com"
                  className="text-white hover:text-amber-300 transition break-all"
                >
                  mylegalconsultants.mlc@gmail.com
                </a>
              </li>

              {/* WhatsApp */}
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: </span>
                <a
                  href="https://wa.me/918826669309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1"
                >
                  <span>https://wa.me/918826669309</span>
                  <ExternalLink className="h-3 w-3 text-emerald-500" />
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/lawyer/signup"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
              >
                <span>Advocate Registration Portal →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOOTER BOTTOM */}
      <div className="border-t border-slate-800/80 bg-black py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-slate-300">LegalConnect</span>
            <span>—</span>
            <span>Online Legal Consultation & Technological Scheduling Intermediary</span>
          </div>

          <p className="text-center sm:text-right">
            © {currentYear} LegalConnect. All rights reserved. Bar Council of India Compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}
