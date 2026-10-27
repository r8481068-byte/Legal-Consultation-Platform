import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Scale,
  MapPin,
  Building2,
  Gavel,
  ShieldCheck,
  Search,
  Star,
  Briefcase,
  ChevronRight,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { getLocationBySlug } from "../data/indiaLocationsData";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { getLawyers } from "../services/lawyerService";

export default function StateLawyersPage() {
  const { stateSlug } = useParams();
  const stateData = getLocationBySlug(stateSlug);

  // SEO document title
  useEffect(() => {
    if (stateData) {
      document.title = `Online Lawyer Consultation in ${stateData.name} | Verified Advocates - LegalConnect`;
    } else {
      document.title = "Find Lawyers in India | LegalConnect";
    }
  }, [stateData]);

  // Filters state
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [specializationFilter, setSpecializationFilter] = useState("All Practice Areas");
  const [courtLevelFilter, setCourtLevelFilter] = useState("All Courts");
  const [maxFeeFilter, setMaxFeeFilter] = useState("");
  const [minExpFilter, setMinExpFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Lawyer data
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // District search within state
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch real lawyers from backend
  const loadStateLawyers = useCallback(async () => {
    if (!stateData) return;
    setLoading(true);
    setError("");

    try {
      const payload = {
        state: stateData.name
      };

      if (districtFilter && districtFilter !== "All Districts") {
        payload.city = districtFilter;
      }
      if (specializationFilter && specializationFilter !== "All Practice Areas") {
        payload.specialization = specializationFilter;
      }
      if (courtLevelFilter && courtLevelFilter !== "All Courts") {
        payload.courtLevel = courtLevelFilter;
      }
      if (maxFeeFilter) {
        payload.maxFee = maxFeeFilter;
      }
      if (minExpFilter) {
        payload.minExperience = minExpFilter;
      }
      if (searchTerm.trim()) {
        payload.search = searchTerm.trim();
      }

      const res = await getLawyers(payload);
      setLawyers(res.lawyers || []);
    } catch (err) {
      // Graceful error state if database is offline or query fails
      setError(err.message || "Failed to load advocates for this jurisdiction.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [stateData, districtFilter, specializationFilter, courtLevelFilter, maxFeeFilter, minExpFilter, searchTerm]);

  useEffect(() => {
    loadStateLawyers();
  }, [loadStateLawyers]);

  if (!stateData) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900">Jurisdiction Not Found</h2>
          <p className="text-xs text-slate-600">
            We couldn't locate a state or union territory matching this link. Explore all 28 states and 8 union territories in our directory.
          </p>
          <Link
            to="/lawyers-in-india"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition"
          >
            ← View All States & Union Territories
          </Link>
        </div>
      </div>
    );
  }

  // Filtered districts list based on search
  const displayedDistricts = stateData.districts.filter((d) =>
    d.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* BREADCRUMB */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/lawyers-in-india" className="hover:text-blue-900">Lawyers in India</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-blue-950 font-bold">{stateData.name}</span>
          </nav>
        </div>
      </div>

      {/* A. LOCATION-SPECIFIC HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 px-4 text-white sm:px-6 sm:py-20 lg:px-8 border-b border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{stateData.type === "union_territory" ? "Union Territory" : "State"} Legal Directory</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl leading-tight text-white">
              Online Lawyer Consultation in {stateData.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Connect with verified advocates enrolled with the State Bar Council and practicing before the {stateData.highCourt.name}, District & Sessions Courts, and appellate forums across {stateData.name}. Book confidential video consultations, have petitions and agreements reviewed, and obtain professional legal counsel.
            </p>

            {/* Quick stats strip */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Capital: <strong>{stateData.capital}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-1.5">
                <Gavel className="h-3.5 w-3.5 text-amber-400" />
                <span>High Court: <strong>{stateData.highCourt.principalSeat}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Districts: <strong>{stateData.districts.length} Verified</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        {/* B. STATE JUDICIAL OVERVIEW & HIGH COURT STRUCTURE */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                Judicial Architecture
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Judicial & Legal Discovery Overview: {stateData.name}
              </h2>
            </div>

            {stateData.highCourt.officialPortal && (
              <a
                href={stateData.highCourt.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-900 hover:bg-blue-100 transition shrink-0"
              >
                <span>Official High Court Portal</span>
                <ExternalLink className="h-3.5 w-3.5 text-blue-700" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="lg:col-span-2 space-y-4">
              <p>{stateData.overview}</p>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified Bar Council Enrolment & Compliance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every advocate listed under {stateData.name} on LegalConnect is verified against State Bar Council enrolment certificates and Bar Council of India (BCI) Certificate of Practice credentials. We do not show unverified placeholders.
                </p>
              </div>
            </div>

            {/* High Court details card */}
            <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-b from-amber-50/50 to-white p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Gavel className="h-5 w-5 text-amber-600" />
                <span className="text-sm">{stateData.highCourt.name}</span>
              </div>

              <div className="space-y-2.5 text-slate-700 border-t border-amber-200/60 pt-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Principal Seat</span>
                  <span className="font-semibold text-slate-900">{stateData.highCourt.principalSeat}</span>
                </div>

                {stateData.highCourt.benches && stateData.highCourt.benches.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Permanent Benches</span>
                    <span className="font-semibold text-slate-900">{stateData.highCourt.benches.join(", ")}</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Territorial Jurisdiction</span>
                  <span className="text-slate-800">{stateData.highCourt.jurisdiction}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Established</span>
                  <span className="text-slate-800">{stateData.highCourt.establishedYear}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C. LEGAL PRACTICE CATEGORIES IN THIS STATE */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Subject-Matter Specializations
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Explore Legal Categories in {stateData.name}
              </h2>
            </div>
            <Link
              to="/legal-services"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              All 19 Legal Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LEGAL_SERVICES.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                to={`/legal-services/${cat.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 p-2 text-blue-900 group-hover:bg-blue-900 group-hover:text-amber-400 transition-colors">
                    <Scale className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {cat.shortTitle}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {cat.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* D. MAJOR CITIES AND AREAS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Urban Jurisdictions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Major Cities & Legal Centers in {stateData.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Click any city to access its dedicated legal discovery page and local district court information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateData.majorCities.map((city) => (
              <Link
                key={city.slug}
                to={`/advocate-lawyer-${stateData.slug}/${city.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-900" />
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors text-sm">
                      {city.name}
                    </h4>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {city.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 group-hover:underline">
                  Lawyers in {city.name} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* E. DISTRICT-WISE DIRECTORY (ALL VERIFIED DISTRICTS) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Complete Territorial Registry
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                District-Wise Court Directory ({stateData.districts.length} Districts)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Verified administrative districts in {stateData.name}. Each district links to its local court directory.
              </p>
            </div>

            {/* Quick district filter */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={districtSearchQuery}
                onChange={(e) => setDistrictSearchQuery(e.target.value)}
                placeholder="Search district..."
                className="w-full rounded-xl border border-slate-300 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {displayedDistricts.map((district) => {
              const districtSlug = district.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
                <Link
                  key={district}
                  to={`/advocate-lawyer-${stateData.slug}/${districtSlug}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-950 transition truncate text-center"
                  title={`Lawyers in ${district} District Court`}
                >
                  {district}
                </Link>
              );
            })}
          </div>

          {displayedDistricts.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-4">
              No districts match "{districtSearchQuery}".
            </p>
          )}
        </section>

        {/* G. ACTUAL LAWYER LISTINGS FROM BACKEND WITH FILTERS */}
        <section className="space-y-6" id="lawyers-section">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Live Verified Advocate Roster
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Verified Lawyers in {stateData.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Filtered by actual state bar enrollment and practicing court jurisdictions.
            </p>
          </div>

          {/* Interactive filter box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* District Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  District / Location
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="All Districts">All Districts ({stateData.districts.length})</option>
                  {stateData.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Specialization Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Specialization
                </label>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="All Practice Areas">All Practice Areas</option>
                  {LEGAL_SERVICES.map((serv) => (
                    <option key={serv.slug} value={serv.specialization}>{serv.shortTitle}</option>
                  ))}
                </select>
              </div>

              {/* Court Level */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Court Level
                </label>
                <select
                  value={courtLevelFilter}
                  onChange={(e) => setCourtLevelFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="All Courts">All Courts</option>
                  <option value="High Court">High Court</option>
                  <option value="District Court">District Court</option>
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="Tribunal">Tribunal / NCLT</option>
                </select>
              </div>

              {/* Max Fee */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Max Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={maxFeeFilter}
                  onChange={(e) => setMaxFeeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Search keyword */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Advocate Name / Term
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">
                Showing lawyers matching <strong>{stateData.name}</strong> jurisdiction
              </span>
              <button
                onClick={() => {
                  setDistrictFilter("All Districts");
                  setSpecializationFilter("All Practice Areas");
                  setCourtLevelFilter("All Courts");
                  setMaxFeeFilter("");
                  setMinExpFilter("");
                  setSearchTerm("");
                }}
                className="font-bold text-blue-900 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Display */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Scale className="mx-auto h-10 w-10 text-blue-900 animate-pulse mb-3" />
              <p className="text-xs font-bold text-slate-600">Loading verified advocates in {stateData.name}...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-xs">
              <p className="font-semibold">{error}</p>
            </div>
          ) : lawyers.length === 0 ? (
            /* HELPFUL EMPTY STATE (NO FAKE LAWYER CARDS) */
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                <Gavel className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No advocates currently listed for this specific filter in {stateData.name}
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                LegalConnect only displays verified advocates with approved State Bar Council credentials. You can explore advocates offering Pan-India online consultations, or expand your district and practice area filters.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/lawyers"
                  className="rounded-xl bg-blue-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition"
                >
                  Browse Pan-India Online Advocates
                </Link>
                <Link
                  to="/ask-question"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Ask a Free Legal Question
                </Link>
              </div>
            </div>
          ) : (
            /* REAL LAWYERS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer) => {
                const lawyerName = lawyer.user?.name || "Verified Advocate";
                const experience = lawyer.experienceYears || 0;
                const fee = lawyer.consultationFee || 0;
                const rating = lawyer.averageRating || 5;

                return (
                  <div
                    key={lawyer._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">
                            <Link to={`/lawyers/${lawyer._id}`} className="hover:text-blue-900">
                              {lawyerName}
                            </Link>
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {lawyer.city || stateData.capital}, {stateData.name}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shrink-0">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Bar Verified
                        </span>
                      </div>

                      {/* Specializations */}
                      <div className="flex flex-wrap gap-1">
                        {(lawyer.specialization || []).slice(0, 3).map((sp) => (
                          <span key={sp} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            {sp}
                          </span>
                        ))}
                      </div>

                      {/* Practice Courts */}
                      <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Court Jurisdiction
                        </span>
                        <span>
                          {lawyer.practiceCourts && lawyer.practiceCourts.length > 0
                            ? lawyer.practiceCourts.join(", ")
                            : `${stateData.highCourt.name} & District Courts`}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-semibold">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {experience}+ Yrs Practice
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {Number(rating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                        <span className="text-base font-black text-blue-950">₹{fee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/lawyers/${lawyer._id}`}
                          className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                        >
                          Profile
                        </Link>
                        <Link
                          to={`/book-appointment?lawyerId=${lawyer._id}`}
                          className="rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow-sm"
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

        {/* H. HOW IT WORKS IN 4 SIMPLE STEPS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
              Streamlined Process
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              How Legal Consultation Works in {stateData.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Clear, structured, and technology-driven workflow from search to verified consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Select Jurisdiction & Area</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your district in {stateData.name} and specify your legal concern (Property, Criminal, Matrimonial, Civil).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Review Verified Credentials</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect verified Bar Council enrolment ID, law degrees, court trial practice years, and transparent fixed fee.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Book Live Open Slot</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose an available slot directly on the advocate's live schedule. Complete server-validated payment via Razorpay.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Join Video Call & Share Files</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attend your private WebRTC consultation room with pre-call checks, share confidential documents, and submit a review.
              </p>
            </div>
          </div>
        </section>

        {/* I. LOCATION-RELEVANT FAQS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Frequently Asked Questions: {stateData.name} Legal Practice
            </h2>
          </div>

          <div className="space-y-3">
            {stateData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition"
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

        {/* J. RELATED LOCATIONS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Neighboring States & Related Legal Jurisdictions
          </h3>
          <p className="text-xs text-slate-500">
            Cross-border or inter-state disputes? Explore verified legal directories in adjacent states:
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {stateData.nearbyStates.map((nbSlug) => {
              const nbState = getLocationBySlug(nbSlug);
              if (!nbState) return null;
              return (
                <Link
                  key={nbSlug}
                  to={`/advocate-lawyer-${nbState.slug}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-950 transition flex items-center gap-1"
                >
                  <span>Lawyers in {nbState.name}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </Link>
              );
            })}
            <Link
              to="/lawyers-in-india"
              className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-950 transition"
            >
              All 28 States & 8 UTs →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
