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
  Gavel,
  BookOpen
} from "lucide-react";
import AccountMenu from "./AccountMenu";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { IPC_BNS_SECTIONS } from "../data/ipcSectionsData";
import { useAuth } from "../context/AuthContext";

export default function Header({ onOpenProfileSettings }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [ipcDropdownOpen, setIpcDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileIpcOpen, setMobileIpcOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const servicesDropdownRef = useRef(null);
  const ipcDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setServicesDropdownOpen(false);
      }
      if (
        ipcDropdownRef.current &&
        !ipcDropdownRef.current.contains(event.target)
      ) {
        setIpcDropdownOpen(false);
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

  // Group 19 services into 3 balanced columns for the Mega Menu
  const col1Services = LEGAL_SERVICES.slice(0, 7);
  const col2Services = LEGAL_SERVICES.slice(7, 13);
  const col3Services = LEGAL_SERVICES.slice(13, 19);

  // 25 IPC Sections for 5x5 grid
  const ipcSections25 = IPC_BNS_SECTIONS.slice(0, 25);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* 1. SLIM TOP UTILITY BAR */}
      <div className="border-b border-slate-200/80 bg-slate-900 text-[11px] text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-2 sm:px-6 lg:px-8 gap-y-1">
          {/* Left: Quick Compliance & Helpline */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Scale className="h-3.5 w-3.5" />
              <span>Bar Council of India Compliant Platform</span>
            </span>

            <span className="hidden sm:inline text-slate-600">|</span>

            <a
              href="tel:8826669309"
              className="hidden sm:flex items-center gap-1 font-semibold text-slate-300 hover:text-amber-400 transition"
            >
              <PhoneCall className="h-3 w-3 text-amber-400" />
              <span>Helpline: 8826669309</span>
            </a>

            <span className="hidden md:inline text-slate-600">|</span>

            <Link
              to="/ask-question"
              className="hidden md:flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Ask a Free Question</span>
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
                id="nav-how-we-work-top"
                className="hidden sm:inline font-medium text-slate-300 hover:text-white transition"
              >
                How We Work
              </Link>

              <span className="hidden sm:inline text-slate-700">|</span>

              <Link
                to="/blogs"
                className="hidden sm:inline font-medium text-slate-300 hover:text-white transition"
              >
                Legal Guides
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

          {/* Interactive Legal Services 3-Column Mega Dropdown */}
          <div className="relative" ref={servicesDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setServicesDropdownOpen((prev) => !prev);
                setIpcDropdownOpen(false);
              }}
              onMouseEnter={() => {
                setServicesDropdownOpen(true);
                setIpcDropdownOpen(false);
              }}
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

            {/* 3-Column Mega Dropdown Panel */}
            {servicesDropdownOpen && (
              <div
                onMouseLeave={() => setServicesDropdownOpen(false)}
                className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-[820px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Our Online Legal Practice Areas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Explore 19 structured legal categories with statutory guidance
                    </p>
                  </div>
                  <Link
                    to="/legal-services"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    View All 19 Legal Services <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2.5 mb-1">
                      Personal & Family
                    </span>
                    {col1Services.map((service) => (
                      <Link
                        key={service.slug}
                        to={`/legal-services/${service.slug}`}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="group flex flex-col rounded-xl px-2.5 py-1.5 hover:bg-blue-50/70 transition"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 transition">
                          {service.shortTitle || service.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {service.commonIssues[0]}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2.5 mb-1">
                      Corporate & Commercial
                    </span>
                    {col2Services.map((service) => (
                      <Link
                        key={service.slug}
                        to={`/legal-services/${service.slug}`}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="group flex flex-col rounded-xl px-2.5 py-1.5 hover:bg-blue-50/70 transition"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 transition">
                          {service.shortTitle || service.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {service.commonIssues[0]}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2.5 mb-1">
                      Specialized & Tribunals
                    </span>
                    {col3Services.map((service) => (
                      <Link
                        key={service.slug}
                        to={`/legal-services/${service.slug}`}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="group flex flex-col rounded-xl px-2.5 py-1.5 hover:bg-blue-50/70 transition"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 transition">
                          {service.shortTitle || service.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {service.commonIssues[0]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <span className="text-slate-600 font-medium">
                    Need advice on another jurisdiction?
                  </span>
                  <Link
                    to="/legal-services"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    View All 19 Legal Services Catalog →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/how-we-work"
            id="nav-how-we-work-main"
            className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
          >
            HOW WE WORK
          </Link>

          {/* Interactive IPC Section 5x5 Mega Dropdown (Replaces Find a Lawyer) */}
          <div className="relative" ref={ipcDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIpcDropdownOpen((prev) => !prev);
                setServicesDropdownOpen(false);
              }}
              onMouseEnter={() => {
                setIpcDropdownOpen(true);
                setServicesDropdownOpen(false);
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase text-slate-700 transition hover:bg-slate-50 hover:text-blue-800"
              aria-expanded={ipcDropdownOpen}
            >
              <span>IPC SECTION</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  ipcDropdownOpen ? "rotate-180 text-blue-700" : ""
                }`}
              />
            </button>

            {/* 5-Column x 5-Row Desktop Mega Dropdown Panel */}
            {ipcDropdownOpen && (
              <div
                onMouseLeave={() => setIpcDropdownOpen(false)}
                className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-[920px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-blue-900" />
                      IPC (1860) & BNS (2023) Section Directory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Explore 25 verified Indian criminal provisions and their official BNS counterparts
                    </p>
                  </div>
                  <Link
                    to="/ipc-sections"
                    onClick={() => setIpcDropdownOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    View All IPC Sections <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* 5-Column x 5-Row Grid of 25 Entries */}
                <div className="mt-4 grid grid-cols-5 gap-2 text-left">
                  {ipcSections25.map((sec) => (
                    <Link
                      key={sec.id}
                      to={`/ipc-sections/${sec.slug}`}
                      onClick={() => setIpcDropdownOpen(false)}
                      className="group flex flex-col rounded-xl p-2 hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-blue-950 group-hover:text-blue-800">
                          IPC {sec.ipcSection}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded">
                          BNS {sec.bnsSection}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 truncate mt-0.5 group-hover:text-blue-900">
                        {sec.ipcTitle.replace("Punishment for ", "").replace("Punishment of ", "")}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <span className="text-slate-600 font-medium">
                    Note: BNS came into force on 1 July 2024. IPC applies to earlier offences.
                  </span>
                  <Link
                    to="/ipc-sections"
                    onClick={() => setIpcDropdownOpen(false)}
                    className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    Open Complete Criminal Code Search →
                  </Link>
                </div>
              </div>
            )}
          </div>

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
                  {LEGAL_SERVICES.slice(0, 10).map((serv) => (
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
              id="nav-how-we-work-mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              HOW WE WORK
            </Link>

            {/* Mobile IPC Section Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setMobileIpcOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50"
              >
                <span>IPC & BNS SECTIONS</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileIpcOpen ? "rotate-180 text-blue-700" : ""
                  }`}
                />
              </button>

              {mobileIpcOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
                  <Link
                    to="/ipc-sections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-2 py-1.5 text-xs font-bold text-blue-700"
                  >
                    View All 25 Criminal Provisions →
                  </Link>
                  {ipcSections25.slice(0, 8).map((sec) => (
                    <Link
                      key={sec.id}
                      to={`/ipc-sections/${sec.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-2 py-1 text-xs text-slate-600 hover:text-blue-800"
                    >
                      IPC {sec.ipcSection} / BNS {sec.bnsSection} — {sec.ipcTitle.replace("Punishment for ", "")}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase text-slate-800 hover:bg-slate-50 hover:text-blue-800"
            >
              LEGAL GUIDES
            </Link>

            {/* Direct Registration Actions in Mobile Drawer */}
            {!user && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/lawyer/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-900"
                >
                  Register Advocate
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-900"
                >
                  Register Client
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
                  placeholder="Search by advocate name, legal area, IPC/BNS section, or city..."
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
              <span>Quick links:</span>
              {["IPC 302", "IPC 420", "Property Law", "Criminal Law", "New Delhi", "High Court"].map((tag) => (
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
