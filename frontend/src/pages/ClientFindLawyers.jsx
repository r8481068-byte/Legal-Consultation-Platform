import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useSearchParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LawyerCard from "../components/LawyerCard";
import { getLawyers } from "../services/lawyerService";
import {
  Search,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle,
  Scale
} from "lucide-react";

const PRACTICE_AREAS = [
  "All Specializations",
  "Corporate & Startup Law",
  "Corporate Law",
  "Criminal Law",
  "Criminal Defense",
  "Civil Litigation",
  "Family & Divorce Law",
  "Family Law",
  "Divorce Law",
  "Property & Real Estate Law",
  "Property Law",
  "Cyber Crime & Data Privacy",
  "Cyber Crime Law",
  "Labour & Employment Law",
  "Taxation & GST",
  "Consumer Protection",
  "Constitutional Law",
  "Banking & Finance",
  "Intellectual Property (IPR)",
  "IP Law",
  "Immigration Law",
  "Arbitration & Dispute Resolution",
];

const EXPERIENCE_OPTIONS = [
  { label: "Any Experience", value: "" },
  { label: "1+ Years", value: "1" },
  { label: "3+ Years", value: "3" },
  { label: "5+ Years", value: "5" },
  { label: "10+ Years", value: "10" },
  { label: "15+ Years", value: "15" },
];

const FEE_OPTIONS = [
  { label: "Any Consultation Fee", value: "" },
  { label: "Under ₹1,000", value: "1000" },
  { label: "Under ₹2,000", value: "2000" },
  { label: "Under ₹3,500", value: "3500" },
  { label: "Under ₹5,000", value: "5000" },
  { label: "Under ₹10,000", value: "10000" },
];

const RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "4.0 ★ & above", value: "4.0" },
  { label: "4.5 ★ & above", value: "4.5" },
  { label: "4.8 ★ & above", value: "4.8" },
];

export default function ClientFindLawyers({ isPublicLayout = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // If visitor is not authenticated, redirect directly to registration preserving destination
  if (!user) {
    const targetUrl = location.pathname + location.search;
    return <Navigate to={`/register?redirect=${encodeURIComponent(targetUrl)}`} replace />;
  }

  // Advocates are prevented from client consultation booking
  if (user.role === "lawyer") {
    return <Navigate to="/lawyer-dashboard?restricted=booking" replace />;
  }

  // Search filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get("search") || "");
  const [specialization, setSpecialization] = useState(
    searchParams.get("specialization") || "All Specializations"
  );
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || searchParams.get("city") || "");
  const [debouncedLocation, setDebouncedLocation] = useState(searchParams.get("location") || searchParams.get("city") || "");
  const [minExperience, setMinExperience] = useState(searchParams.get("minExperience") || "");
  const [maxFee, setMaxFee] = useState(searchParams.get("maxFee") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "fee_asc");

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Synchronize specialization state when URL searchParams change
  useEffect(() => {
    const specParam = searchParams.get("specialization");
    if (specParam) {
      setSpecialization(specParam);
    } else {
      setSpecialization("All Specializations");
    }
  }, [searchParams]);

  // Debounce text inputs for responsive typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocation(locationQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [locationQuery]);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const queryPayload = {};
      if (debouncedSearchTerm.trim()) {
        queryPayload.search = debouncedSearchTerm.trim();
      }
      if (specialization && specialization !== "All Specializations") {
        queryPayload.specialization = specialization;
      }
      if (debouncedLocation.trim()) {
        queryPayload.location = debouncedLocation.trim();
      }
      if (minExperience) {
        queryPayload.minExperience = minExperience;
      }
      if (maxFee) {
        queryPayload.maxFee = maxFee;
      }
      if (minRating) {
        queryPayload.minRating = minRating;
      }
      if (sortBy) {
        queryPayload.sortBy = sortBy;
      }

      const data = await getLawyers(queryPayload);
      setLawyers(Array.isArray(data.lawyers) ? data.lawyers : []);
    } catch (err) {
      setError(err.message || "Failed to load advocates from database.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, specialization, debouncedLocation, minExperience, maxFee, minRating, sortBy]);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSpecialization("All Specializations");
    setLocationQuery("");
    setDebouncedLocation("");
    setMinExperience("");
    setMaxFee("");
    setMinRating("");
    setSortBy("fee_asc");
    setSearchParams({});
  };

  // Client-side verification and fallback sorting
  const filteredAndSortedLawyers = useMemo(() => {
    let result = [...lawyers];

    // Client-side rating filter safeguard
    if (minRating) {
      const ratingThreshold = parseFloat(minRating);
      if (Number.isFinite(ratingThreshold)) {
        result = result.filter(
          (l) => (l.averageRating || 5.0) >= ratingThreshold
        );
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "fee_asc") {
        return (a.consultationFee || 0) - (b.consultationFee || 0);
      }
      if (sortBy === "fee_desc") {
        return (b.consultationFee || 0) - (a.consultationFee || 0);
      }
      if (sortBy === "exp_desc" || sortBy === "experience_desc") {
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      }
      if (sortBy === "rating_desc") {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });

    return result;
  }, [lawyers, minRating, sortBy]);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans ${isPublicLayout ? "pb-12" : ""}`}>
      {!isPublicLayout && <Navbar />}

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#070D1E] via-[#0B132B] to-[#101C3A] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-[#D9A441] border border-amber-400/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Legal Counsel
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Available Advocates
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Connect directly with licensed Advocates, Senior Counsels, and legal consultants across District Courts, High Courts, and Tribunals in India.
              </p>
            </div>
          </div>

          {/* Search & Combined Filter Bar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search by Lawyer Name or Keywords */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by advocate name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition"
                />
              </div>

              {/* Specialization Filter */}
              <div>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition bg-white"
                >
                  {PRACTICE_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location (e.g. Delhi, Mumbai, Bengaluru)..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition"
                />
              </div>

              {/* Search Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchLawyers}
                  className="flex-1 rounded-xl bg-[#2457D6] px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Apply Filters</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                  title="Reset all filters"
                  aria-label="Reset all filters"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Secondary Filter Chips & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Experience Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Experience:</span>
                  <select
                    value={minExperience}
                    onChange={(e) => setMinExperience(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-[#2457D6]"
                  >
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consultation Fee Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Max Fee:</span>
                  <select
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-[#2457D6]"
                  >
                    {FEE_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Rating:</span>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-[#2457D6]"
                  >
                    {RATING_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sorting Options */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#2457D6]"
                >
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                  <option value="exp_desc">Experience: High to Low</option>
                  <option value="rating_desc">Rating: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Available Advocates Results Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                  Available Advocates
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredAndSortedLawyers.length} approved legal practitioner{filteredAndSortedLawyers.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                        <div className="h-3 w-1/2 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded mt-4" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedLawyers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2457D6]">
                  <Scale className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-800">
                  No advocates found matching your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your search term, clearing location filters, or resetting the fee range to discover verified lawyers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedLawyers.map((lawyer) => (
                  <LawyerCard key={lawyer._id} lawyer={lawyer} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
