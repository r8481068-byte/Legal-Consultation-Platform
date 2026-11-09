import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  Search,
  BookOpen,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Gavel,
  ShieldAlert,
  ArrowLeftRight
} from "lucide-react";
import { IPC_BNS_SECTIONS, IPC_CATEGORIES } from "../data/ipcSectionsData";

export default function IpcSections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'ipc' | 'bns' | 'crossref'

  const filteredSections = useMemo(() => {
    return IPC_BNS_SECTIONS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Categories" || item.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.ipcSection.toLowerCase().includes(q) ||
        item.bnsSection.toLowerCase().includes(q) ||
        item.ipcTitle.toLowerCase().includes(q) ||
        item.bnsTitle.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy font-bold">Indian Criminal Law — IPC & BNS Sections</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-light to-royal p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold">
              <Gavel className="h-3.5 w-3.5" /> Indian Criminal Law Directory
            </span>
            <h1 className="text-3xl font-heading font-black sm:text-4xl lg:text-5xl tracking-tight text-white">
              Indian Penal Code (IPC) & Bharatiya Nyaya Sanhita (BNS)
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              Official statutory provisions, cross-references, legal ingredients, punishments, and bail classifications under India's criminal codes.
            </p>

            {/* Statutory Reform Notice */}
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-xs text-amber-100 space-y-1">
              <div className="flex items-center gap-2 font-bold text-gold">
                <AlertCircle className="h-4 w-4" />
                <span>Statutory Transition Notice: BNS in Force from 1 July 2024</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/90">
                India's <strong>Bharatiya Nyaya Sanhita (BNS), 2023</strong> came into force on 1 July 2024. Offences committed prior to 1 July 2024 continue to be investigated and tried under the <strong>Indian Penal Code (IPC), 1860</strong>. Section numbers differ between both statutes.
              </p>
            </div>
          </div>
        </div>

        {/* Search, Mode, and Filters */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by section number (e.g. 302, 420, 103) or offense..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-royal focus:bg-white focus:outline-none focus:ring-1 focus:ring-royal transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setViewMode("all")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === "all" ? "bg-white text-navy shadow-xs font-bold" : "text-slate-600 hover:text-navy"
                }`}
              >
                All 25 Provisions
              </button>
              <button
                onClick={() => setViewMode("ipc")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === "ipc" ? "bg-white text-navy shadow-xs font-bold" : "text-slate-600 hover:text-navy"
                }`}
              >
                IPC (Historical)
              </button>
              <button
                onClick={() => setViewMode("bns")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === "bns" ? "bg-white text-navy shadow-xs font-bold" : "text-slate-600 hover:text-navy"
                }`}
              >
                BNS 2023 (Current)
              </button>
              <button
                onClick={() => setViewMode("crossref")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === "crossref" ? "bg-white text-navy shadow-xs font-bold" : "text-slate-600 hover:text-navy"
                }`}
              >
                Cross-Reference View
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {IPC_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-navy text-white shadow-xs ring-1 ring-navy font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Quick Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Showing {filteredSections.length} verified criminal provisions</span>
          {(searchQuery || selectedCategory !== "All Categories") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="text-royal hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Gavel className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-heading font-bold text-navy">No sections found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No criminal provisions matched your query. Try searching by section number like "302", "420", or "bail".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSections.map((sec) => (
              <article
                key={sec.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-royal/50 hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Category and Bail Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-0.5 font-bold text-slate-700">
                      {sec.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        sec.bailable === "Bailable"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {sec.bailable}
                    </span>
                  </div>

                  {/* Section Badge Comparison */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">IPC (Historical)</span>
                      <span className="text-base font-heading font-black text-navy">Section {sec.ipcSection}</span>
                    </div>
                    <ArrowLeftRight className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="flex-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">BNS 2023 (Current)</span>
                      <span className="text-base font-heading font-black text-emerald-950">Section {sec.bnsSection}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-heading font-bold text-navy leading-snug group-hover:text-royal transition-colors">
                    <Link to={`/ipc-sections/${sec.slug}`}>
                      {sec.ipcTitle}
                    </Link>
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {sec.shortDescription}
                  </p>

                  {/* Statutory Punishment */}
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Statutory Penalty
                    </span>
                    <p className="font-semibold text-slate-900 line-clamp-2">
                      {sec.punishment}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    Trial: {sec.trialCourt}
                  </span>
                  <Link
                    to={`/ipc-sections/${sec.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-royal hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Consultation Callout */}
        <div className="rounded-3xl bg-gradient-to-r from-navy via-navy-light to-royal p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white">
              Facing Criminal Allegations or Need Bail Guidance?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Criminal charges require immediate legal defense strategy. Consult verified advocates with criminal trial and High Court appellate experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lawyers?specialization=Criminal%20Law"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-black text-navy shadow-md hover:bg-gold-light transition"
            >
              <Gavel className="h-4 w-4" /> Consult Criminal Advocates
            </Link>
            <Link
              to="/legal-services/criminal-law"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Criminal Law Practice Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
