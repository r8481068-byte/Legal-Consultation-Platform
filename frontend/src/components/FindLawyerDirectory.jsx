import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  MapPin,
  Briefcase,
  Scale,
  Star,
  ShieldCheck,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  CreditCard,
  UserCheck,
  Building2,
  X,
  ChevronDown,
} from "lucide-react";
import { getLawyers } from "../services/lawyerService";
import LawyerToLawyerProfileModal from "./LawyerToLawyerProfileModal";

const COMMON_SPECIALIZATIONS = [
  "All Specializations",
  "Criminal Law",
  "Civil Litigation",
  "Corporate Law",
  "Family & Matrimonial Law",
  "Constitutional Law",
  "Intellectual Property (IPR)",
  "Cyber Law",
  "Taxation & GST",
  "Real Estate & Property",
  "Banking & Finance",
  "Labour & Employment Law",
  "Arbitration & Dispute Resolution",
  "Consumer Protection",
];

const COMMON_CITIES = [
  "All Locations",
  "New Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Kochi",
  "Patna",
];

const EXPERIENCE_OPTIONS = [
  { label: "Any Experience", value: "" },
  { label: "1+ Years", value: "1" },
  { label: "3+ Years", value: "3" },
  { label: "5+ Years", value: "5" },
  { label: "10+ Years", value: "10" },
  { label: "15+ Years", value: "15" },
];

const VERIFICATION_OPTIONS = [
  { label: "All Verification Statuses", value: "all" },
  { label: "BCI Verified Only", value: "approved" },
  { label: "Verification Pending", value: "pending" },
];

const SORT_OPTIONS = [
  { label: "Highest Rated", value: "rating_desc" },
  { label: "Most Experienced", value: "exp_desc" },
  { label: "Consultation Fee: Low to High", value: "fee_asc" },
  { label: "Consultation Fee: High to Low", value: "fee_desc" },
];

export default function FindLawyerDirectory() {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [practiceArea, setPracticeArea] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [customLocation, setCustomLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [sortBy, setSortBy] = useState("rating_desc");

  // Pagination & Data States
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLawyers, setTotalLawyers] = useState(0);

  // Profile View Modal State
  const [selectedLawyerId, setSelectedLawyerId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch registered lawyers from LegalConnect database
  const fetchDirectoryLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {
        page,
        limit: 12,
        sortBy,
      };

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (selectedSpecialization && selectedSpecialization !== "All Specializations") {
        filters.specialization = selectedSpecialization;
      }

      if (practiceArea.trim()) {
        filters.practiceArea = practiceArea.trim();
      }

      const activeLocation = customLocation.trim() || (selectedLocation !== "All Locations" ? selectedLocation : "");
      if (activeLocation) {
        filters.location = activeLocation;
      }

      if (experience) {
        filters.minExperience = experience;
      }

      if (verificationStatus && verificationStatus !== "all") {
        filters.verificationStatus = verificationStatus;
      } else {
        filters.verificationStatus = "all";
      }

      const res = await getLawyers(filters);
      setLawyers(res.lawyers || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalLawyers(res.pagination?.total || (res.lawyers || []).length);
    } catch (err) {
      setError(err.message || "Failed to load registered advocates from directory.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedSpecialization,
    practiceArea,
    selectedLocation,
    customLocation,
    experience,
    verificationStatus,
    sortBy,
    page,
  ]);

  useEffect(() => {
    fetchDirectoryLawyers();
  }, [fetchDirectoryLawyers]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDirectoryLawyers();
  };

  // Reset / Clear Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("All Specializations");
    setPracticeArea("");
    setSelectedLocation("All Locations");
    setCustomLocation("");
    setExperience("");
    setVerificationStatus("all");
    setSortBy("rating_desc");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedSpecialization !== "All Specializations" ||
    Boolean(practiceArea.trim()) ||
    selectedLocation !== "All Locations" ||
    Boolean(customLocation.trim()) ||
    Boolean(experience) ||
    verificationStatus !== "all" ||
    sortBy !== "rating_desc";

  const handleOpenProfile = (lawyerId) => {
    setSelectedLawyerId(lawyerId);
    setProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ===================================================================== */}
      {/* TOP DIRECTORY HEADER                                                  */}
      {/* ===================================================================== */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                Find Lawyer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lawyer-to-Lawyer Professional Directory & Advocate Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-bold">
              {totalLawyers} Registered Advocate{totalLawyers === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Search & Quick Controls Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search by Name */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by advocate name, chamber, or keywords..."
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Practice Area Input */}
            <div className="relative sm:w-64">
              <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={practiceArea}
                onChange={(e) => setPracticeArea(e.target.value)}
                placeholder="Practice area / niche..."
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2">
            {/* Specialization Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Specialization
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {COMMON_SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location / City
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCustomLocation("");
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {COMMON_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Experience
              </label>
              <select
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => {
                  setVerificationStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {VERIFICATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500">
                  Active Filters:
                </span>
                {searchTerm && (
                  <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200">
                    &ldquo;{searchTerm}&rdquo;
                  </span>
                )}
                {selectedSpecialization !== "All Specializations" && (
                  <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200">
                    {selectedSpecialization}
                  </span>
                )}
                {practiceArea && (
                  <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200">
                    Area: {practiceArea}
                  </span>
                )}
                {selectedLocation !== "All Locations" && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold border border-slate-200">
                    {selectedLocation}
                  </span>
                )}
                {experience && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold border border-slate-200">
                    {experience}+ Yrs Exp
                  </span>
                )}
                {verificationStatus !== "all" && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold border border-slate-200">
                    {verificationStatus === "approved" ? "Verified" : "Pending"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* ===================================================================== */}
      {/* ERROR ALERT                                                           */}
      {/* ===================================================================== */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LAWYER DIRECTORY CARDS GRID                                           */}
      {/* ===================================================================== */}
      {loading ? (
        <div className="py-24 text-center rounded-3xl border border-slate-200/90 bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">
            Loading registered advocates...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Accessing LegalConnect advocate directory database
          </p>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Scale className="h-6 w-6" />
          </div>
          <h4 className="font-heading text-base font-extrabold text-slate-900">
            No Advocates Found
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No registered lawyers match your search criteria. Try modifying your search keywords or resetting filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer mt-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lawyers.map((lawyer) => {
            const rawName = lawyer?.user?.name || lawyer?.name || "Advocate";
            const name =
              rawName.startsWith("Adv.") || rawName.startsWith("Advocate")
                ? rawName
                : `Advocate ${rawName}`;

            const profileImage = lawyer?.user?.profileImage || lawyer?.profileImage || null;
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
            const barReg = lawyer.barCouncilId || null;
            const experienceYears = Number(lawyer.experienceYears) || 0;
            const locationText =
              [lawyer.city, lawyer.state].filter(Boolean).join(", ") || "India";

            const rawFee = Number(lawyer.consultationFee);
            const feeText =
              Number.isFinite(rawFee) && rawFee >= 0
                ? `₹${rawFee.toLocaleString("en-IN")}`
                : "Contact for fee";

            const ratingValue =
              lawyer.averageRating > 0
                ? Number(lawyer.averageRating).toFixed(1)
                : "5.0";
            const reviewCount = lawyer.totalReviews || 0;

            const specializations = Array.isArray(lawyer.specialization)
              ? lawyer.specialization
              : lawyer.specialization
              ? [lawyer.specialization]
              : [];

            const secondarySpecs = Array.isArray(lawyer.secondarySpecializations)
              ? lawyer.secondarySpecializations
              : [];

            return (
              <article
                key={lawyer._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={name}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-[#0B132B] to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-2xs ${
                          profileImage ? "hidden" : "flex"
                        }`}
                      >
                        {initials}
                      </div>
                      {isApproved && (
                        <span
                          className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-0.5 text-white ring-2 ring-white shadow-2xs"
                          title="BCI Verified Advocate"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-black text-slate-900 text-sm truncate" title={name}>
                        {name}
                      </h4>

                      {/* Bar Council ID / Status */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            BCI Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.2 text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5" />
                            Verification Pending
                          </span>
                        )}

                        {barReg && (
                          <span className="text-[10px] font-semibold text-slate-500 truncate" title={`Bar Council ID: ${barReg}`}>
                            {barReg}
                          </span>
                        )}
                      </div>

                      {/* Experience & Rating */}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          {experienceYears} {experienceYears === 1 ? "yr" : "yrs"} exp
                        </span>
                        <span>•</span>
                        <span className="font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {ratingValue} ({reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{locationText}</span>
                  </div>

                  {/* Specializations & Practice Area Tags */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {specializations.slice(0, 2).map((spec) => (
                        <span
                          key={spec}
                          className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/80"
                        >
                          {spec}
                        </span>
                      ))}
                      {secondarySpecs.slice(0, 1).map((sec) => (
                        <span
                          key={sec}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200"
                        >
                          {sec}
                        </span>
                      ))}
                      {specializations.length + secondarySpecs.length > 3 && (
                        <span className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                          +{specializations.length + secondarySpecs.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Headline Preview */}
                  {lawyer.headline && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {lawyer.headline}
                    </p>
                  )}
                </div>

                {/* Bottom Footer: Fee & View Profile */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Rate
                    </span>
                    <span className="font-heading font-black text-sm text-slate-900">
                      {feeText}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenProfile(lawyer._id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* PAGINATION CONTROLS                                                   */}
      {/* ===================================================================== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-semibold px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LAWYER-TO-LAWYER PROFESSIONAL PROFILE MODAL                           */}
      {/* ===================================================================== */}
      <LawyerToLawyerProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedLawyerId(null);
        }}
        lawyerId={selectedLawyerId}
      />
    </div>
  );
}

