import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
  Building2,
  Calendar,
  X,
  ChevronDown,
} from "lucide-react";
import { getLawyers, getLawyerById } from "../services/lawyerService";

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

export default function ClientLawyerDirectory() {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    "All Specializations"
  );
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
  const [modalLawyer, setModalLawyer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Query API Callback
  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: 9,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (
        selectedSpecialization &&
        selectedSpecialization !== "All Specializations"
      ) {
        params.specialization = selectedSpecialization;
      }

      if (practiceArea.trim()) {
        params.practiceArea = practiceArea.trim();
      }

      const activeLocation =
        selectedLocation === "All Locations"
          ? customLocation.trim()
          : selectedLocation;
      if (activeLocation) {
        params.location = activeLocation;
      }

      if (experience) {
        params.experience = experience;
      }

      if (verificationStatus && verificationStatus !== "all") {
        params.verificationStatus = verificationStatus;
      }

      if (sortBy) {
        params.sortBy = sortBy;
      }

      const response = await getLawyers(params);

      const items = Array.isArray(response)
        ? response
        : response?.lawyers || [];
      const total =
        response?.totalLawyers ||
        response?.total ||
        (Array.isArray(response) ? response.length : items.length);
      const pages =
        response?.totalPages ||
        (response?.limit ? Math.ceil(total / response.limit) : 1);

      setLawyers(items);
      setTotalLawyers(total);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      setError(
        err.message ||
          "Failed to load advocate directory. Please check network connection."
      );
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
    fetchLawyers();
  }, [fetchLawyers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLawyers();
  };

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

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedSpecialization !== "All Specializations" ||
      practiceArea.trim() ||
      selectedLocation !== "All Locations" ||
      customLocation.trim() ||
      experience ||
      verificationStatus !== "all" ||
      sortBy !== "rating_desc"
  );

  const handleOpenProfile = async (id) => {
    setSelectedLawyerId(id);
    setProfileModalOpen(true);
    setModalLoading(true);
    try {
      const data = await getLawyerById(id);
      setModalLawyer(data);
    } catch (err) {
      console.error("Failed to load advocate details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Box */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search advocates by name, bar council id, or expertise..."
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition shrink-0 cursor-pointer"
            >
              Search Advocates
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Specialization */}
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

            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
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

            {/* Experience */}
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

          {/* Active Filter Chips & Reset */}
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

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Advocates Directory Grid */}
      {loading ? (
        <div className="py-24 text-center rounded-3xl border border-slate-200/90 bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">
            Loading certified advocates...
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

            const profileImage =
              lawyer?.user?.profileImage || lawyer?.profileImage || null;
            const initials =
              rawName
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

            return (
              <article
                key={lawyer._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={name}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-[#0B132B] to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-2xs">
                          {initials}
                        </div>
                      )}
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
                      <h4
                        className="font-heading font-black text-slate-900 text-sm truncate"
                        title={name}
                      >
                        {name}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            BCI Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.2 text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5" />
                            Pending Verification
                          </span>
                        )}

                        {barReg && (
                          <span className="text-[10px] font-semibold text-slate-500 truncate">
                            {barReg}
                          </span>
                        )}
                      </div>

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

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate font-medium">{locationText}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {specializations.slice(0, 2).map((spec) => (
                      <span
                        key={spec}
                        className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/80"
                      >
                        {spec}
                      </span>
                    ))}
                    {specializations.length > 2 && (
                      <span className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        +{specializations.length - 2}
                      </span>
                    )}
                  </div>

                  {lawyer.headline && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {lawyer.headline}
                    </p>
                  )}
                </div>

                {/* Footer with View Profile and Book Consultation */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Rate
                    </span>
                    <span className="font-heading font-black text-sm text-slate-900">
                      {feeText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(lawyer._id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <span>Profile</span>
                    </button>
                    <Link
                      to={`/lawyers/${lawyer._id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Consultation</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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

      {/* Quick Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Advocate Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {modalLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading advocate profile...
                </div>
              ) : modalLawyer ? (
                <>
                  <div className="flex items-start gap-4">
                    {modalLawyer.user?.profileImage ? (
                      <img
                        src={modalLawyer.user.profileImage}
                        alt="Advocate"
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                        {modalLawyer.user?.name?.charAt(0) || "A"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading font-black text-lg text-slate-900">
                        Advocate {modalLawyer.user?.name}
                      </h4>
                      <p className="text-slate-600 font-semibold">
                        {Array.isArray(modalLawyer.specialization)
                          ? modalLawyer.specialization.join(", ")
                          : modalLawyer.specialization || "Legal Counsel"}
                      </p>
                      <p className="text-slate-500 mt-1">
                        {modalLawyer.city && `${modalLawyer.city}, `}
                        {modalLawyer.state || "India"} • {modalLawyer.experienceYears || 0} years experience
                      </p>
                    </div>
                  </div>

                  {modalLawyer.bio && (
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-1">Professional Bio:</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {modalLawyer.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Bar Registration</span>
                      <span className="font-bold text-slate-900">{modalLawyer.barCouncilId || "Verified with BCI"}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Consultation Rate</span>
                      <span className="font-bold text-blue-700">₹{modalLawyer.consultationFee || 0} / session</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500">
                LegalConnect Certified Advocates
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
                {modalLawyer?._id && (
                  <Link
                    to={`/lawyers/${modalLawyer._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book Consultation</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

