import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Scale,
  Building2,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Gavel,
  Briefcase,
  Star,
  ExternalLink,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import {
  STATES_AND_UTS,
  MAJOR_CITIES_DIRECTORY,
  COURT_LEVELS_INFO,
  searchLocations
} from "../data/indiaLocationsData";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { getLawyers } from "../services/lawyerService";

export default function LawyersInIndia() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Document Title
  useEffect(() => {
    document.title = "Find Lawyers Across India — State & City Directory | LegalConnect";
  }, []);

  // Filter / Search states for directory sections
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [selectedRegionTab, setSelectedRegionTab] = useState("All");

  // Live Advocate Roster filter state
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get("search") || "",
    courtLevel: searchParams.get("courtLevel") || "All Courts",
    city: searchParams.get("city") || "All Cities",
    specialization: searchParams.get("specialization") || "All Practice Areas",
    maxFee: searchParams.get("maxFee") || ""
  }));

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(null);

  // Sync state when URL search params change
  useEffect(() => {
    const qCourt = searchParams.get("courtLevel") || "All Courts";
    const qCity = searchParams.get("city") || "All Cities";
    const qSpec = searchParams.get("specialization") || "All Practice Areas";
    const qSearch = searchParams.get("search") || "";
    const qFee = searchParams.get("maxFee") || "";

    setFilters({
      search: qSearch,
      courtLevel: qCourt,
      city: qCity,
      specialization: qSpec,
      maxFee: qFee
    });
  }, [searchParams]);

  // Load backend lawyers matching query
  const loadLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {};
      if (filters.search) payload.search = filters.search;
      if (filters.courtLevel && filters.courtLevel !== "All Courts") payload.courtLevel = filters.courtLevel;
      if (filters.city && filters.city !== "All Cities") payload.city = filters.city;
      if (filters.specialization && filters.specialization !== "All Practice Areas") {
        payload.specialization = filters.specialization;
      }
      if (filters.maxFee) payload.maxFee = filters.maxFee;

      const data = await getLawyers(payload);
      setLawyers(data.lawyers || []);
    } catch (err) {
      setError(err.message || "Failed to load advocates.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLawyers();
  }, [loadLawyers]);

  // Filtered states/UTs by region & search query
  const filteredLocations = useMemo(() => {
    let list = STATES_AND_UTS;
    if (locationSearchQuery.trim()) {
      list = searchLocations(locationSearchQuery);
    }

    if (selectedRegionTab === "States") {
      list = list.filter((l) => l.type === "state");
    } else if (selectedRegionTab === "Union Territories") {
      list = list.filter((l) => l.type === "union_territory");
    } else if (selectedRegionTab !== "All") {
      list = list.filter((l) => l.region === selectedRegionTab);
    }

    return list;
  }, [locationSearchQuery, selectedRegionTab]);

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);

    const newParams = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => {
      if (v && v !== "All Courts" && v !== "All Cities" && v !== "All Practice Areas") {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const handleReset = () => {
    const reset = {
      search: "",
      courtLevel: "All Courts",
      city: "All Cities",
      specialization: "All Practice Areas",
      maxFee: ""
    };
    setFilters(reset);
    setSearchParams(new URLSearchParams());
  };

  const regionTabs = ["All", "States", "Union Territories", "Northern", "Southern", "Western", "Eastern", "Central", "North Eastern"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-blue-950 font-bold">Lawyers in India Directory</span>
          </nav>
        </div>
      </div>

      {/* A. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 px-4 text-white sm:px-6 sm:py-20 lg:px-8 border-b border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>Pan-India Court & Territorial Discovery</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
              Find Lawyers Across India
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Explore verified legal assistance across all 28 Indian States and 8 Union Territories. Discover advocates practicing before the Supreme Court of India, 25 State High Courts, District & Sessions Courts, and specialized tribunals like NCLT, NGT, and Consumer Forums. Filter legal counsel by location jurisdiction, legal specialization, and trial experience.
            </p>

            {/* Location Search Field */}
            <div className="pt-2 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Search state, union territory, district, or city (e.g., Delhi, Madhya Pradesh, Pune, Bhopal)..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-400 shadow-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                {locationSearchQuery && (
                  <button
                    onClick={() => setLocationSearchQuery("")}
                    className="absolute right-3 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Supported Highlights */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 28 States Covered
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 8 Union Territories
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 25 High Courts & Benches
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 700+ District Registries
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        {/* B. BROWSE BY STATE AND UNION TERRITORY (ALL 28 STATES + 8 UTs) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                Territorial Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Browse by State and Union Territory
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Every state and union territory features a dedicated page with local High Court details, district registries, and verified advocate rosters.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredLocations.length} of 36 jurisdictions
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
            {regionTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedRegionTab(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedRegionTab === tab
                    ? "bg-blue-950 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Location Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLocations.map((loc) => (
              <Link
                key={loc.id}
                to={`/advocate-lawyer-${loc.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      loc.type === "state" ? "bg-blue-50 text-blue-900 border border-blue-100" : "bg-purple-50 text-purple-900 border border-purple-100"
                    }`}>
                      {loc.type === "state" ? "State" : "Union Territory"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-900 transition-all" />
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {loc.name}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Gavel className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{loc.highCourt.name}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Seat: {loc.highCourt.principalSeat}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">
                    {loc.districts.length} District{loc.districts.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-bold text-blue-900 group-hover:underline">
                    View Advocates →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredLocations.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-800">No jurisdictions match "{locationSearchQuery}"</p>
              <button
                onClick={() => {
                  setLocationSearchQuery("");
                  setSelectedRegionTab("All");
                }}
                className="mt-3 text-xs font-bold text-blue-900 hover:underline"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>

        {/* C. BROWSE BY MAJOR CITIES */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Urban Litigation Centers
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Browse Lawyers by Major Cities
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Direct access to prominent district and commercial litigation hubs across India.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MAJOR_CITIES_DIRECTORY.map((city) => (
              <Link
                key={city.slug}
                to={`/advocate-lawyer-${city.stateSlug}/${city.slug}`}
                className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:bg-white hover:border-blue-400 hover:shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs group-hover:text-blue-900">
                  <Building2 className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                  <span className="truncate">{city.name}</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500 truncate">
                  {city.stateName}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* D. BROWSE BY COURT LEVEL */}
        <section className="space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Judicial Hierarchy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Browse by Court Level in India
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              Advocates' court affiliations and practice locations must be based on actual, verified profile data and Bar Council Certificates of Practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURT_LEVELS_INFO.map((court) => (
              <div
                key={court.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4 hover:border-blue-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-900 border border-blue-100 uppercase tracking-wider">
                      {court.level}
                    </span>
                    {court.officialPortal && (
                      <a
                        href={court.officialPortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-400 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {court.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {court.description}
                  </p>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Practice Jurisdiction & Seat:
                    </span>
                    <p className="text-slate-700">{court.jurisdiction}</p>
                  </div>

                  <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200/50 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">
                      Verified Bar Requirement:
                    </span>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      {court.verifiedRequirement}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const section = document.getElementById("search-roster");
                      if (section) section.scrollIntoView({ behavior: "smooth" });
                      handleFilterChange("courtLevel", court.name.includes("Supreme") ? "Supreme Court" : court.name.includes("High") ? "High Court" : court.name.includes("District") ? "District Court" : "Tribunal");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:underline"
                  >
                    <span>Filter Advocates Practicing in {court.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* E. LEGAL SPECIALIZATION DIRECTORY */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Legal Practice Areas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Browse Advocates by Specialization
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Explore dedicated legal service guides with statutory frameworks, document checklists, and verified advocate connections.
              </p>
            </div>
            <Link
              to="/legal-services"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 shrink-0"
            >
              All 19 Services Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LEGAL_SERVICES.map((serv) => (
              <Link
                key={serv.slug}
                to={`/legal-services/${serv.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:border-amber-400 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors text-xs sm:text-sm">
                    {serv.shortTitle}
                  </h4>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {serv.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* F. HELPFUL INFORMATIONAL SECTIONS */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-8 sm:p-12 text-white space-y-10 shadow-xl">
          <div className="max-w-3xl space-y-3">
            <span className="inline-block rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              Legal Guidance & Consumer Advisory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Guide to Finding & Engaging Legal Counsel in India
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparent, objective information on selecting legal representation, understanding judicial territoriality, and utilizing digital consultation securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs leading-relaxed">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-amber-400 font-bold text-xs mb-3">
                1
              </span>
              <h3 className="font-bold text-white text-sm">How to Find by Location</h3>
              <p className="text-slate-300">
                Indian courts observe strict territorial and subject-matter jurisdiction. Determine whether your dispute involves land (filed where property is situated), matrimonial relief (where the marriage occurred or wife resides), or criminal complaints (where the cause of action arose).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-amber-400 font-bold text-xs mb-3">
                2
              </span>
              <h3 className="font-bold text-white text-sm">Selecting by Legal Issue</h3>
              <p className="text-slate-300">
                Trial litigation differs from corporate advisory or constitutional writs. Choose an advocate with demonstrable trial court or High Court appearances in your specific area (e.g. RERA for property, POCSO for criminal, Family Court for custody).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-amber-400 font-bold text-xs mb-3">
                3
              </span>
              <h3 className="font-bold text-white text-sm">Understanding Court Levels</h3>
              <p className="text-slate-300">
                Civil suits start at Civil Judge or District Judge levels; serious criminal charges begin before Judicial Magistrates or Sessions Judges. High Courts handle appeals and constitutional writs, while the Supreme Court is the apex appellate authority.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-amber-400 font-bold text-xs mb-3">
                4
              </span>
              <h3 className="font-bold text-white text-sm">Online Legal Consultation</h3>
              <p className="text-slate-300">
                Online consultation allows clients to discuss strategy, obtain preliminary case opinions, and review draft agreements or notices over secure WebRTC video before committing to physical court representation.
              </p>
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              FAQs About Finding Lawyers in India
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How can I verify if a lawyer is legally authorized to practice in India?",
                a: "Under the Advocates Act 1961, every practicing advocate must be enrolled with a State Bar Council (such as Bar Council of Delhi, Bar Council of Maharashtra and Goa, Bar Council of Madhya Pradesh) and hold an active Certificate of Practice issued by the Bar Council of India (BCI). LegalConnect verifies these credentials before listing."
              },
              {
                q: "Can a lawyer from one state represent me in a court in another state?",
                a: "Yes. Section 30 of the Advocates Act 1961 confers upon every enrolled advocate the right to practice throughout the territories of India before all courts, including the Supreme Court, any High Court, and subordinate trial courts."
              },
              {
                q: "What is the difference between an Advocate and an Advocate-on-Record (AoR)?",
                a: "Any qualified law graduate enrolled with a State Bar Council is an Advocate. However, to file a petition or act on behalf of a litigant before the Supreme Court of India, the lawyer must be designated an Advocate-on-Record (AoR) after passing the examination conducted by the Supreme Court."
              },
              {
                q: "How are consultation fees paid and protected on LegalConnect?",
                a: "Consultation fees are set transparently by advocates on their profile and calculated strictly on the server. Payments are processed through Razorpay (supporting UPI, cards, and net banking). If an appointment cannot be fulfilled, our fair cancellation policy protects your payment."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-900"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-90 text-blue-700" : "text-slate-400"
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* LIVE ROSTER WITH ADVANCED FILTERS */}
        <section className="space-y-6" id="search-roster">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
              Active Advocate Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Verified Advocates Pan-India Roster
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Live database queries matching your selected jurisdiction and court level.
            </p>
          </div>

          {/* Filters Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Court Jurisdiction
                </label>
                <select
                  value={filters.courtLevel}
                  onChange={(e) => handleFilterChange("courtLevel", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  {["All Courts", "High Court", "District Court", "Supreme Court", "Tribunal"].map((cl) => (
                    <option key={cl} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  City / Location
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="All Cities">All Cities</option>
                  {MAJOR_CITIES_DIRECTORY.map((c) => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Practice Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange("specialization", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="All Practice Areas">All Practice Areas</option>
                  {LEGAL_SERVICES.map((sp) => (
                    <option key={sp.slug} value={sp.specialization}>{sp.shortTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Search by Keyword or Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleFilterChange("search", filters.search)}
                    placeholder="e.g. Verma, High Court..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Active: <strong>{filters.courtLevel}</strong>, <strong>{filters.city}</strong>
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Scale className="mx-auto h-10 w-10 text-blue-900 animate-pulse mb-3" />
              <p className="text-xs font-bold text-slate-600">Loading advocates matching jurisdiction...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-xs">
              <p className="font-bold">{error}</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-3">
              <Gavel className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="text-base font-bold text-slate-900">
                No advocates currently found matching these criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No approved advocates matched your specific combination of court level and city. Try selecting "All Courts" or "All Cities".
              </p>
              <button
                onClick={handleReset}
                className="inline-flex rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-950 transition"
              >
                Clear Court Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer) => {
                const lawyerName = lawyer.user?.name || "Verified Advocate";
                const experience = lawyer.experienceYears || 0;
                const fee = lawyer.consultationFee || 0;
                const rating = lawyer.averageRating || 5;

                return (
                  <div
                    key={lawyer._id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                            <Link to={`/lawyers/${lawyer._id}`}>
                              {lawyerName}
                            </Link>
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {lawyer.city || "Pan-India Practice"}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shrink-0">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Bar Verified
                        </span>
                      </div>

                      {/* Practice Courts */}
                      {lawyer.practiceCourts && lawyer.practiceCourts.length > 0 ? (
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Practice Courts & Tribunals
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {lawyer.practiceCourts.map((court, i) => (
                              <span key={i} className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-900 border border-blue-100">
                                {court}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                            Court Jurisdiction
                          </span>
                          <span>High Court & District Civil/Sessions Courts</span>
                        </div>
                      )}

                      {/* Specializations */}
                      <div className="flex flex-wrap gap-1.5">
                        {(lawyer.specialization || []).slice(0, 3).map((sp) => (
                          <span key={sp} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {sp}
                          </span>
                        ))}
                      </div>

                      {lawyer.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {lawyer.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-semibold">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {experience}+ Years Trial Exp.
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {Number(rating).toFixed(1)} Rating
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                        <span className="text-base font-black text-blue-950">₹{fee}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/lawyers/${lawyer._id}`}
                          className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                        >
                          Profile
                        </Link>
                        <Link
                          to={`/book-appointment?lawyerId=${lawyer._id}`}
                          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
