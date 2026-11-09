import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ExternalLink,
  ArrowRight,
  Filter,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Lock,
  Award,
  Users,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { getLocationBySlug, STATES_AND_UTS } from "../data/indiaLocationsData";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { getCourtsForState } from "../data/stateCourtsData";
import { getLawyers } from "../services/lawyerService";
import StateLawyersMap from "../components/StateLawyersMap";
import { useAuth } from "../context/AuthContext";

// 14 Required Legal Service Categories for State Landing Pages
const STATE_LEGAL_SERVICES = [
  { name: "Criminal Law", specialization: "Criminal Law", desc: "Bail hearings, trial defense, FIR quashing, and white collar litigation." },
  { name: "Civil Law", specialization: "Civil Litigation", desc: "Money recovery, injunctions, specific performance, and civil appeals." },
  { name: "Family Law", specialization: "Family & Divorce Law", desc: "Child custody, guardianship, adoption, and family settlements." },
  { name: "Divorce Matters", specialization: "Family & Divorce Law", desc: "Mutual consent divorce, contested divorce, maintenance, and alimony." },
  { name: "Property Disputes", specialization: "Property & Real Estate Law", desc: "Ancestral partitions, title searches, boundary encroachment, and RERA disputes." },
  { name: "Corporate Law", specialization: "Corporate & Startup Law", desc: "Company formation, shareholder agreements, M&A due diligence, and contracts." },
  { name: "Business Law", specialization: "Corporate & Startup Law", desc: "Commercial compliance, vendor dispute arbitration, and partnership deeds." },
  { name: "Consumer Protection", specialization: "Consumer Protection", desc: "Defective goods, medical negligence, insurance repudiation, and NCDRC claims." },
  { name: "Labour and Employment", specialization: "Labour & Employment Law", desc: "Wrongful termination, workplace harassment (POSH), gratuity, and EPF claims." },
  { name: "Intellectual Property", specialization: "Intellectual Property (IPR)", desc: "Trademark registration, patent opposition, copyright licensing, and trade secrets." },
  { name: "Banking and Financial Disputes", specialization: "Banking & Finance", desc: "DRT debt recovery, SARFAESI notices, insolvency (IBC), and bank guarantees." },
  { name: "Taxation", specialization: "Taxation & GST", desc: "GST notices, income tax appellate tribunal (ITAT), transfer pricing, and customs." },
  { name: "Cyber Crime", specialization: "Cyber Crime & Data Privacy", desc: "Financial cyber fraud, identity theft, data breaches, and IT Act notices." },
  { name: "Constitutional Law", specialization: "Constitutional Law", desc: "High Court Article 226 writ petitions, public interest litigation (PIL), and service appeals." }
];

// Experience filter options
const EXPERIENCE_OPTIONS = [
  { label: "Any Experience", value: "" },
  { label: "1+ Years", value: "1" },
  { label: "3+ Years", value: "3" },
  { label: "5+ Years", value: "5" },
  { label: "10+ Years", value: "10" },
  { label: "15+ Years", value: "15" }
];

// Rating filter options
const RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "4.0 ★ & above", value: "4.0" },
  { label: "4.5 ★ & above", value: "4.5" },
  { label: "4.8 ★ & above", value: "4.8" }
];

export default function StateLawyersPage() {
  const { user } = useAuth();
  const { stateSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const stateData = getLocationBySlug(stateSlug);
  const stateDisplayName = stateData ? (stateData.slug === "delhi" ? "Delhi" : stateData.name) : "";

  // Dynamic SEO Document Title, Meta Tags & Structured Data
  useEffect(() => {
    if (!stateData) {
      document.title = "Find Lawyers in India | LegalConnect";
      return;
    }

    const pageTitle = `Find Lawyers in ${stateDisplayName} – Expert Legal Consultation and Legal Services | LegalConnect`;
    const metaDescription = `Find verified advocates in ${stateDisplayName}. Connect with lawyers practicing before the ${stateData.highCourt.name} and District Courts across ${stateData.districts.length} districts for property, civil, criminal, and corporate legal consultations.`;
    const canonicalUrl = `https://legalconnect.in/lawyers-in-india/${stateData.slug}`;

    document.title = pageTitle;

    // Update Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.name = "description";
      document.head.appendChild(descMeta);
    }
    descMeta.content = metaDescription;

    // Update OpenGraph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = pageTitle;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = metaDescription;

    // Update Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Inject Structured Data (Breadcrumbs + Legal Service)
    const jsonLdScript = document.createElement("script");
    jsonLdScript.type = "application/ld+json";
    jsonLdScript.id = "location-structured-data";
    jsonLdScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://legalconnect.in"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Lawyers in India",
              "item": "https://legalconnect.in/lawyers-in-india"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": stateDisplayName,
              "item": canonicalUrl
            }
          ]
        },
        {
          "@type": "LegalService",
          "name": `LegalConnect Verified Advocates — ${stateDisplayName}`,
          "description": metaDescription,
          "url": canonicalUrl,
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": stateDisplayName
          },
          "serviceType": [
            "Criminal Law",
            "Civil Litigation",
            "Property & Real Estate Law",
            "Family & Divorce Law",
            "Corporate & Commercial Law"
          ]
        }
      ]
    });
    document.head.appendChild(jsonLdScript);

    return () => {
      const existingScript = document.getElementById("location-structured-data");
      if (existingScript) existingScript.remove();
    };
  }, [stateData, stateDisplayName]);

  // Filters State
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [specializationFilter, setSpecializationFilter] = useState("All Specializations");
  const [minExpFilter, setMinExpFilter] = useState("");
  const [maxFeeFilter, setMaxFeeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Advocate List & Pagination State
  const [lawyers, setLawyers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // District Search Box in Section D
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Courts for this state
  const stateCourts = useMemo(() => {
    return getCourtsForState(stateData);
  }, [stateData]);

  // Load backend lawyers with filters & pagination
  const loadLawyers = useCallback(async () => {
    if (!stateData) return;
    setLoading(true);
    setError("");

    try {
      const payload = {
        state: stateData.name,
        page: currentPage,
        limit: 9
      };

      if (districtFilter && districtFilter !== "All Districts") {
        payload.district = districtFilter;
      }

      if (specializationFilter && specializationFilter !== "All Specializations") {
        payload.specialization = specializationFilter;
      }

      if (minExpFilter) {
        payload.minExperience = minExpFilter;
      }

      if (maxFeeFilter) {
        payload.maxFee = maxFeeFilter;
      }

      if (ratingFilter) {
        payload.rating = ratingFilter;
      }

      if (searchTerm.trim()) {
        payload.search = searchTerm.trim();
      }

      if (verifiedOnly) {
        payload.verifiedOnly = "true";
      }

      const res = await getLawyers(payload);
      setLawyers(res.lawyers || []);
      setPagination(res.pagination || { total: 0, totalPages: 1, page: 1, limit: 9 });
    } catch (err) {
      setError(err.message || "Failed to load advocates for this jurisdiction.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [
    stateData,
    districtFilter,
    specializationFilter,
    minExpFilter,
    maxFeeFilter,
    ratingFilter,
    searchTerm,
    verifiedOnly,
    currentPage
  ]);

  useEffect(() => {
    loadLawyers();
  }, [loadLawyers]);

  // Handler for reset filters
  const handleResetFilters = () => {
    setDistrictFilter("All Districts");
    setSpecializationFilter("All Specializations");
    setMinExpFilter("");
    setMaxFeeFilter("");
    setRatingFilter("");
    setSearchTerm("");
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  // Handler when user clicks a district pill in Section D or map
  const handleSelectDistrict = (districtName) => {
    setDistrictFilter(districtName);
    setCurrentPage(1);
    // Smooth scroll down to lawyers section
    const el = document.getElementById("available-advocates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handler when user clicks a legal service in Section F
  const handleSelectService = (spec) => {
    setSpecializationFilter(spec);
    setCurrentPage(1);
    const el = document.getElementById("available-advocates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!stateData) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900">State Directory Not Found</h2>
          <p className="text-xs text-slate-600">
            We couldn't locate a state or union territory matching this URL. Explore all 28 states and 8 union territories in our directory.
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

  // Filtered districts for search
  const displayedDistricts = stateData.districts.filter((d) =>
    d.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  // Standard FAQs combined with location specific FAQs
  const combinedFaqs = [
    {
      q: `How can I find a Lawyer in ${stateDisplayName}?`,
      a: `You can find verified advocates across ${stateDisplayName} by selecting your district and practice area (Criminal, Property, Civil, Corporate, Matrimonial) on LegalConnect. You can review verified Bar Council credentials, trial experience, client reviews, and book an instant online video consultation or in-person appointment.`
    },
    {
      q: "How can I consult a Lawyer online?",
      a: "Select an advocate in your desired jurisdiction, choose an available date and time slot from their live schedule, and complete the booking. You will receive an encrypted WebRTC consultation room link to speak directly with your advocate via HD video with document sharing."
    },
    {
      q: "How do I find a Lawyer by specialization?",
      a: "Use the specialization filter dropdown above to choose from practice areas including Criminal Defense, Property Law, Divorce, Corporate Litigation, Cyber Crime, Consumer Law, and Constitutional Writ Matters to see advocates with focused experience in that legal domain."
    },
    {
      q: "How can I book an appointment?",
      a: "Click 'Book Slot' on any advocate card. Clients with completed profiles can immediately select a 15, 30, 45, or 60-minute consultation slot, complete payment, and receive instant booking confirmation."
    },
    {
      q: "How can I verify an Advocate profile?",
      a: `Every advocate displayed on LegalConnect holds a verified State Bar Council enrolment number and a valid Bar Council of India (BCI) Certificate of Practice. Verified badges are awarded only after our compliance team approves identity proofs and practice credentials.`
    },
    {
      q: "What should I check before selecting a Lawyer?",
      a: "We recommend reviewing the advocate's years of court practice, primary court jurisdiction (Supreme Court, High Court, or District Courts), subject-matter specializations, consultation fee, and feedback from previous clients."
    },
    ...(stateData.faqs || [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* SECTION A – BREADCRUMB */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-900 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/lawyers-in-india" className="hover:text-blue-900 transition-colors">Lawyers in India</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-blue-950 font-bold">{stateDisplayName}</span>
          </nav>
        </div>
      </div>

      {/* SECTION B – SEO HEADING & INTRODUCTION HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 px-4 text-white sm:px-6 sm:py-20 lg:px-8 border-b border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Scale className="h-3.5 w-3.5 text-amber-400" />
              <span>{stateData.type === "union_territory" ? "Union Territory" : "State"} Legal Directory</span>
            </div>

            {/* Dynamic State-Specific SEO Heading */}
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight text-white">
              Find Lawyers in {stateDisplayName} – Expert Legal Consultation and Legal Services
            </h1>

            {/* Unique introductory description per state */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Connect with verified advocates enrolled with the Bar Council and practicing before the {stateData.highCourt.name}, District & Sessions Courts, and specialized tribunals across {stateDisplayName}. Consult experienced legal counsel for property disputes, criminal defense, divorce settlements, and corporate matters.
            </p>

            {/* Available lawyer count & quick platform metadata */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>{pagination.total > 0 ? `${pagination.total} Available Advocate${pagination.total === 1 ? "" : "s"}` : `Available Advocates in ${stateDisplayName}`}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5">
                <Gavel className="h-3.5 w-3.5 text-amber-400" />
                <span>High Court: <strong>{stateData.highCourt.principalSeat}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Districts: <strong>{stateData.districts.length} Verified</strong></span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bar Council Verified</span>
              </div>
            </div>

            {/* Call to action */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="#available-advocates"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow-md"
              >
                <span>Find Advocates in {stateDisplayName}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#interactive-map"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Explore Jurisdiction Map</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        {/* SECTION E – INTERACTIVE MAP (MANDATORY LEAFLET INTEGRATION) */}
        <section id="interactive-map" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                Territorial Visualizer
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Interactive Jurisdiction Map: {stateDisplayName}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Explore advocate offices, High Court benches, and district registries with live interactive markers.
              </p>
            </div>
          </div>

          {/* Map Component */}
          <StateLawyersMap
            stateData={stateData}
            lawyers={lawyers}
            selectedDistrict={districtFilter}
            onSelectDistrict={(dist) => setDistrictFilter(dist)}
          />
        </section>

        {/* SECTION C – AVAILABLE ADVOCATES IN THIS STATE WITH FILTERS & PAGINATION */}
        <section id="available-advocates" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                Verified Advocates Roster
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Available Advocates in {stateDisplayName}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Real lawyers registered and verified under {stateDisplayName} Bar Council jurisdiction.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              {pagination.total > 0 ? `Showing ${lawyers.length} of ${pagination.total} advocates` : "0 advocates found"}
            </div>
          </div>

          {/* ADVOCATE FILTERS BAR */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search by Lawyer Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Search by Lawyer Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search name or term..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* District / City Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City / District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                >
                  <option value="All Districts">All Districts ({stateData.districts.length})</option>
                  {stateData.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Specialization Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Specialization
                </label>
                <select
                  value={specializationFilter}
                  onChange={(e) => {
                    setSpecializationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                >
                  <option value="All Specializations">All Specializations</option>
                  {STATE_LEGAL_SERVICES.map((s) => (
                    <option key={s.name} value={s.specialization}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Experience
                </label>
                <select
                  value={minExpFilter}
                  onChange={(e) => {
                    setMinExpFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second row of filters: Fee, Rating, Verified only, Reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 items-end">
              {/* Consultation Fee */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Max Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={maxFeeFilter}
                  onChange={(e) => {
                    setMaxFeeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Minimum Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    setRatingFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                >
                  {RATING_OPTIONS.map((r) => (
                    <option key={r.label} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Verified Lawyers Only Checkbox */}
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => {
                      setVerifiedOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                  />
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Verified Lawyers Only
                  </span>
                </label>
              </div>

              {/* Reset Filters button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* LAWYERS GRID RESULTS */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Scale className="mx-auto h-10 w-10 text-blue-900 animate-pulse mb-3" />
              <p className="text-xs font-bold text-slate-600">Loading advocates for {stateDisplayName}...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-xs">
              <p className="font-semibold">{error}</p>
            </div>
          ) : lawyers.length === 0 ? (
            /* PROFESSIONAL EMPTY STATE (MANDATORY REQUIREMENT) */
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                <Gavel className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No lawyers are currently available in this location. Please check other nearby locations.
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                LegalConnect only displays verified advocates with active State Bar Council credentials. You can explore advocates offering online consultations across nearby districts, or expand your filters.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl bg-blue-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/lawyers-in-india"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Browse Other States
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* REAL LAWYERS CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lawyers.map((lawyer) => {
                  const user = lawyer.user || {};
                  const rawName = user.name || lawyer.name || "Verified Advocate";
                  const name = rawName.startsWith("Adv.") || rawName.startsWith("Advocate")
                    ? rawName
                    : `Advocate ${rawName}`;
                  const profileImage = user.profileImage || lawyer.profileImage || null;
                  const initials = rawName
                    .replace(/^Advocate\s+/i, "")
                    .replace(/^Adv\.\s+/i, "")
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "A";

                  const isApproved = lawyer.verificationStatus === "approved";
                  const experience = Number(lawyer.experienceYears) || 0;
                  const fee = Number(lawyer.consultationFee) || 0;
                  const rating = Number(lawyer.averageRating) > 0 ? Number(lawyer.averageRating).toFixed(1) : null;
                  const reviewsCount = lawyer.totalReviews || 0;
                  const locationText = lawyer.district || lawyer.city || stateData.capital;
                  const specializations = Array.isArray(lawyer.specialization)
                    ? lawyer.specialization
                    : [lawyer.specialization || "General Practice"];
                  const shortAbout = lawyer.headline || lawyer.describeUs || lawyer.bio || "";

                  return (
                    <article
                      key={lawyer._id}
                      className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
                    >
                      <div>
                        {/* TOP SECTION: Image, Name, Badge, Experience */}
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={name}
                                className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-xs border-2 border-slate-100 ${
                                profileImage ? "hidden" : "flex"
                              }`}
                            >
                              {initials}
                            </div>
                            {isApproved && (
                              <span
                                className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-xs"
                                title="Verified by LegalConnect"
                              >
                                <ShieldCheck className="h-3 w-3" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/lawyers/${lawyer._id}`}
                              className="block font-bold text-slate-900 text-base group-hover:text-blue-900 hover:underline transition truncate"
                              title={name}
                            >
                              {name}
                            </Link>

                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              <span>{experience} {experience === 1 ? "year" : "years"} of practice</span>
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  Verified Advocate
                                </span>
                              )}

                              {rating && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                  <span>{rating}</span>
                                  {reviewsCount > 0 && (
                                    <span className="text-amber-700 font-normal">
                                      ({reviewsCount})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{locationText}, {stateDisplayName}</span>
                        </div>

                        {/* Specializations Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {specializations.slice(0, 3).map((sp) => (
                            <span
                              key={sp}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-100"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>

                        {/* Short About Description */}
                        {shortAbout && (
                          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {shortAbout}
                          </p>
                        )}
                      </div>

                      {/* BOTTOM SECTION: Fee + View Profile & Book Consultation buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Consultation Fee
                          </span>
                          <span className="text-lg font-extrabold text-blue-900">
                            {fee > 0 ? `₹${fee.toLocaleString("en-IN")}` : "Contact for fee"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/lawyers/${lawyer._id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <span>Profile</span>
                          </Link>

                          <Link
                            to={
                              !user
                                ? `/register?redirect=${encodeURIComponent(`/lawyers/${lawyer._id}#booking`)}`
                                : user.role === "client"
                                ? `/lawyers/${lawyer._id}#booking`
                                : "/lawyer-dashboard?restricted=booking"
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-300 transition transform hover:-translate-y-0.5"
                          >
                            <span>Book</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                          currentPage === pageNumber
                            ? "bg-blue-950 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* SECTION D – DISTRICT-WISE LAWYER DISCOVERY */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Subordinate Jurisdictions
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                District-Wise Lawyer Discovery ({stateData.districts.length} Districts)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Click any district to filter verified advocates and center the jurisdiction map.
              </p>
            </div>

            {/* District Quick Search Field */}
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

          {/* District buttons grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {displayedDistricts.map((district) => {
              const isSelected = districtFilter.toLowerCase() === district.toLowerCase();
              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => handleSelectDistrict(district)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition truncate text-center ${
                    isSelected
                      ? "bg-blue-950 text-white shadow-sm border border-blue-950"
                      : "border border-slate-200 bg-slate-50/80 text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-950"
                  }`}
                  title={`Filter lawyers in ${district} District`}
                >
                  {district}
                </button>
              );
            })}
          </div>

          {displayedDistricts.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-4">
              No districts match "{districtSearchQuery}".
            </p>
          )}

          {districtFilter !== "All Districts" && (
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-slate-600">
                Filtered by: <strong>{districtFilter}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleSelectDistrict("All Districts")}
                className="font-bold text-blue-900 hover:underline"
              >
                Clear District Filter →
              </button>
            </div>
          )}
        </section>

        {/* SECTION F – LEGAL SERVICES OFFERED (14 CATEGORIES) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Practice Areas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Legal Services Offered in {stateDisplayName}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Explore specialized advocates by field of practice. Click any specialization to filter lawyers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {STATE_LEGAL_SERVICES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => handleSelectService(cat.specialization)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 p-2 text-blue-900 group-hover:bg-blue-900 group-hover:text-amber-400 transition-colors">
                    <Scale className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-900 transition-all" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 group-hover:underline">
                  Find Advocates in {cat.name} →
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION G – COURTS AND TRIBUNALS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                Judicial Infrastructure
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Courts & Tribunals in {stateDisplayName}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Accurate administrative information on Constitutional High Courts, permanent benches, and district sessions complexes.
              </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateCourts.map((court) => (
              <div
                key={court.name}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2 hover:bg-white hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                    {court.level}
                  </span>
                  <Gavel className="h-4 w-4 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {court.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{court.seat}</span>
                </p>
                <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  {court.type}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION H – HOW TO FIND A LAWYER (5 STEPS) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
              Step-By-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How to Find a Lawyer in {stateDisplayName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A transparent, 5-step process designed for reliable legal consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Select State or City</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your specific district or city in {stateDisplayName} to locate advocates with active local court standing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Choose Specialization</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your legal concern—Property, Criminal, Matrimonial, Corporate, or Consumer Protection.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Compare Profiles</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect verified Bar Council enrolment credentials, law degrees, court jurisdictions, and bio details.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Review Experience & Ratings</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check years of active court practice, client reviews, and transparent upfront consultation fees.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-amber-400 font-bold text-xs">
                5
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Book Consultation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick a live schedule slot and connect via private encrypted video consultation or schedule an in-person meeting.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION I – WHY CHOOSE LEGALCONNECT (7 GENUINE BENEFITS) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Platform Standards
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Why Choose LegalConnect for Legal Consultation
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Genuine platform capabilities designed for trust, speed, and strict confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Find Lawyers by Location</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Easily browse legal counsel across all 28 States and 8 Union Territories down to district levels.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Explore Lawyer Specializations</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Search targeted practice areas including Criminal, Civil, Family, Property, Corporate, and Tax Law.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">View Approved Advocate Profiles</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every listed lawyer is verified against official State Bar Council and BCI credentials before approval.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Compare Consultation Fees</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  100% transparent pricing with fixed consultation fees per advocate and zero hidden consultation commissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Read Available Client Reviews</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Inspect verified client testimonials and ratings submitted after genuine, completed consultation appointments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Book Online Consultations & Manage Appointments</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Direct calendar scheduling, automated reminders, and private encrypted WebRTC video consultation rooms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION J – REVIEWS AND TESTIMONIALS (GENUINE DATA ONLY) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Client Feedback
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Verified Client Reviews in {stateDisplayName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Genuine reviews from verified consultations. We never generate artificial testimonials.
            </p>
          </div>

          {/* Genuine reviews display */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center space-y-3">
            <Star className="mx-auto h-8 w-8 text-amber-400 fill-amber-400" />
            <h4 className="text-sm font-bold text-slate-800">
              Reviews for Verified Advocates in {stateDisplayName}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Reviews and client satisfaction ratings appear automatically once clients complete their private consultations with verified advocates in this jurisdiction.
            </p>
          </div>
        </section>

        {/* SECTION K – FREQUENTLY ASKED QUESTIONS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Legal FAQs for {stateDisplayName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Answers to common legal consultation and jurisdictional queries.
            </p>
          </div>

          <div className="space-y-3">
            {combinedFaqs.map((faq, idx) => (
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

        {/* SECTION L – RELATED LOCATIONS & SPECIALIZATIONS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
              Connected Jurisdictions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Related Locations & Jurisdictions
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Neighboring States
              </h4>
              <div className="flex flex-wrap gap-2">
                {(stateData.nearbyStates || []).map((slug) => {
                  const nbState = getLocationBySlug(slug);
                  if (!nbState) return null;
                  return (
                    <Link
                      key={slug}
                      to={`/lawyers-in-india/${nbState.slug}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-950 transition flex items-center gap-1"
                    >
                      <span>Lawyers in {nbState.name}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </Link>
                  );
                })}
                <Link
                  to="/lawyers-in-india"
                  className="rounded-xl bg-blue-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition"
                >
                  View All 28 States & 8 UTs →
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Prominent District Courts in {stateDisplayName}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {stateData.districts.slice(0, 10).map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleSelectDistrict(dist)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-100 hover:text-blue-900 transition"
                  >
                    Advocates in {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Popular Legal Specializations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {STATE_LEGAL_SERVICES.slice(0, 8).map((serv) => (
                  <button
                    key={serv.name}
                    type="button"
                    onClick={() => handleSelectService(serv.specialization)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-900 transition"
                  >
                    {serv.name} Lawyers
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
