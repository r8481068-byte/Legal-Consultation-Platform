import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  "Criminal Law",
  "Criminal Defense",
  "Civil Litigation",
  "Family & Divorce Law",
  "Property & Real Estate Law",
  "Property Law",
  "Cyber Crime & Data Privacy",
  "Labour & Employment Law",
  "Taxation & GST",
  "Consumer Protection",
  "Constitutional Law",
  "Banking & Finance",
  "Intellectual Property (IPR)",
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
  const [searchParams, setSearchParams] = useSearchParams();

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
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isPublicLayout ? "pb-12" : ""}`}>
      {!isPublicLayout && <Navbar />}

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-linear-to-r from-slate-950 via-blue-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Legal Counsel
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Available Advocates
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Connect directly with licensed Advocates, Senior Counsels, and legal consultants across District Courts, High Courts, and Tribunals in India.
              </p>
            </div>
          </div>

          {/* Search & Combined Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search by Lawyer Name or Keywords */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by advocate name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                />
              </div>

              {/* Specialization Filter */}
              <div>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition bg-white"
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
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                />
              </div>

              {/* Search Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchLawyers}
                  className="flex-1 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition flex items-center justify-center gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 transition"
                  title="Reset all filters"
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
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-blue-900"
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
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-blue-900"
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
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 bg-white outline-none focus:border-blue-900"
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
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-blue-900"
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
                <h2 className="text-xl font-bold text-slate-900">
                  Available Advocates
                </h2>
                <p className="text-xs text-slate-500">
                  Verified advocates ready for consultation
                </p>
              </div>

              {!loading && !error && (
                <span className="text-xs font-medium text-slate-500">
                  Showing <strong className="text-slate-900">{filteredAndSortedLawyers.length}</strong> available advocate{filteredAndSortedLawyers.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent align-[-0.125em]" />
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Loading available advocates...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
                <p className="font-bold">Error loading advocates</p>
                <p className="mt-1">{error}</p>
                <button
                  type="button"
                  onClick={fetchLawyers}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAndSortedLawyers.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No advocates found matching your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your filters, searching for a different name, or clearing location parameters to view all available counsel.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition"
                >
                  <RotateCcw className="h-4 w-4" /> Reset All Filters
                </button>
              </div>
            )}

            {/* Lawyer Cards Grid */}
            {!loading && !error && filteredAndSortedLawyers.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
