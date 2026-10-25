import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Scale,
  Search,
  Globe,
  Menu,
  X,
  PhoneCall,
  HelpCircle,
  UserCheck,
  ChevronDown,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import AccountMenu from "./AccountMenu";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { useAuth } from "../context/AuthContext";

export default function Header({ onOpenProfileSettings }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const servicesDropdownRef = useRef(null);

  // Close services dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/lawyers?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery("");
    }
  };

  // Featured categories for quick menu display
  const featuredServices = LEGAL_SERVICES.slice(0, 12);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* 1. SLIM TOP UTILITY BAR (Inspired by Reference) */}
      <div className="border-b border-slate-200/80 bg-slate-900 text-[11px] text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
          {/* Left: Quick Legal Links */}
          <div className="hidden items-center gap-4 md:flex lg:gap-6">
            <Link
              to="/legal-advice?tab=kanoon"
              className="font-medium text-slate-300 hover:text-amber-400 transition"
            >
              Indian Kanoon
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              to="/legal-advice?tab=ipc"
              className="font-medium text-slate-300 hover:text-amber-400 transition"
            >
              BNS & Criminal Sections
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              to="/ask-question"
              className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              <HelpCircle className="h-3 w-3" />
              Ask a Free Question
            </Link>
          </div>

          {/* Right: Actions & Registration Links */}
          <div className="flex w-full items-center justify-between md:w-auto md:justify-end gap-3 sm:gap-5">
            {/* Language Selector */}
            <div className="flex items-center gap-1 font-semibold text-slate-300">
              <Globe className="h-3 w-3 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-slate-300 outline-none cursor-pointer hover:text-amber-400"
                aria-label="Select language"
              >
                <option value="EN" className="bg-slate-900 text-white">English</option>
                <option value="HI" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/how-we-work"
                className="hidden sm:inline font-medium text-slate-300 hover:text-white transition"
              >
                How We Work
              </Link>

              <span className="hidden sm:inline text-slate-700">|</span>

              <Link
                to="/blogs"
                className="hidden sm:inline font-medium text-slate-300 hover:text-white transition"
              >
                Legal Guide
              </Link>

              <span className="hidden sm:inline text-slate-700">|</span>

              {/* Direct Registration Actions */}
              {!user ? (
                <>
                  <Link
                    to="/lawyer/signup"
                    className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition"
                  >
                    <UserCheck className="h-3 w-3" />
                    <span>Register as Advocate</span>
                  </Link>

                  <span className="text-slate-700">|</span>

                  <Link
                    to="/register"
                    className="flex items-center gap-1 font-semibold text-blue-300 hover:text-white transition"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Register as Client</span>
                  </Link>
                </>
              ) : (
                <span className="font-semibold text-emerald-400">
                  Logged in as {user.role?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HORIZONTAL NAVIGATION BAR */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-white shadow-md shadow-blue-900/10 transition group-hover:scale-105">
            <Scale className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              Legal<span className="text-blue-700">Connect</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Consultation Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            HOME
          </Link>

          <Link
            to="/about"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            ABOUT US
          </Link>

          {/* Interactive Legal Services Mega Dropdown */}
          <div className="relative" ref={servicesDropdownRef}>
            <button
              type="button"
              onClick={() => setServicesDropdownOpen((prev) => !prev)}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
              aria-expanded={servicesDropdownOpen}
            >
              <span>LEGAL SERVICES</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  servicesDropdownOpen ? "rotate-180 text-blue-700" : ""
                }`}
              />
            </button>

            {/* Mega Dropdown Panel */}
            {servicesDropdownOpen && (
              <div
                onMouseLeave={() => setServicesDropdownOpen(false)}
                className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-[720px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Explore Legal Practice Areas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Consult verified advocates across 19 specialized legal domains
                    </p>
                  </div>
                  <Link
                    to="/legal-services"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    View All 19 Services <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {featuredServices.map((service) => (
                    <Link
                      key={service.slug}
                      to={`/legal-services/${service.slug}`}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="group flex flex-col rounded-xl p-2.5 hover:bg-blue-50/70 transition"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 transition">
                        {service.shortTitle || service.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {service.commonIssues[0] || service.summary}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <span className="text-slate-600 font-medium">
                    Looking for a specific lawyer or city?
                  </span>
                  <Link
                    to="/lawyers"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    Open Lawyer Discovery Directory →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/how-we-work"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            HOW WE WORK
          </Link>

          <Link
            to="/blogs"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            LEGAL GUIDE
          </Link>

          <Link
            to="/lawyers"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            FIND A LAWYER
          </Link>

          {/* Quick Talk Button with Reference-Inspired Gold Accent */}
          <Link
            to="/lawyers"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-300"
          >
            <PhoneCall className="h-3.5 w-3.5 text-slate-950" />
            <span>TALK TO A LAWYER</span>
          </Link>

          {/* User Account / Login Dropdown */}
          <AccountMenu onOpenProfileSettings={onOpenProfileSettings} />

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            title="Search lawyers or legal topics"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden xl:inline text-[11px] uppercase tracking-wider">SEARCH</span>
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/lawyers"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Talk</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1 pb-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              HOME
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              ABOUT US
            </Link>

            {/* Mobile Legal Services Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50"
              >
                <span>LEGAL SERVICES</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileServicesOpen ? "rotate-180 text-blue-700" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
                  <Link
                    to="/legal-services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-2 py-1.5 text-xs font-bold text-blue-700"
                  >
                    View All 19 Legal Services →
                  </Link>
                  {featuredServices.slice(0, 8).map((serv) => (
                    <Link
                      key={serv.slug}
                      to={`/legal-services/${serv.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-2 py-1 text-xs text-slate-600 hover:text-blue-800"
                    >
                      {serv.shortTitle}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/how-we-work"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              HOW WE WORK
            </Link>

            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              LEGAL GUIDE
            </Link>

            <Link
              to="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              FIND A LAWYER
            </Link>

            {/* Direct Registration Actions in Mobile Drawer */}
            {!user && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/lawyer/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-900"
                >
                  Advocate Signup
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-900"
                >
                  Client Signup
                </Link>
              </div>
            )}
          </div>

          {/* Account Section in Mobile Menu */}
          <div className="pt-3 border-t border-slate-100">
            <AccountMenu
              isMobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
              onOpenProfileSettings={onOpenProfileSettings}
            />
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-700" /> Quick Search
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by advocate name, specialty (e.g. Criminal, Property, Family) or city..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Popular:</span>
              {["Property Law", "Criminal Law", "Family Law", "Corporate Law", "New Delhi", "Mumbai", "Bangalore"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigate(`/lawyers?search=${encodeURIComponent(tag)}`);
                    setShowSearchModal(false);
                  }}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
