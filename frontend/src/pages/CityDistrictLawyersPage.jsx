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
  ChevronRight
} from "lucide-react";
import { getLocationBySlug } from "../data/indiaLocationsData";
import { LEGAL_SERVICES } from "../data/legalServicesData";
import { getLawyers } from "../services/lawyerService";

export default function CityDistrictLawyersPage() {
  const { stateSlug, citySlug } = useParams();
  const stateData = getLocationBySlug(stateSlug);

  // Format city/district name from slug or match from data
  const rawCitySlug = (citySlug || "").toLowerCase();
  const matchedCityObj = stateData?.majorCities?.find((c) => c.slug === rawCitySlug);
  const matchedDistrict = stateData?.districts?.find(
    (d) => d.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === rawCitySlug
  );

  const cityName =
    matchedCityObj?.name ||
    matchedDistrict ||
    rawCitySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // SEO document title
  useEffect(() => {
    if (stateData) {
      document.title = `Lawyers in ${cityName}, ${stateData.name} | Verified Advocates - LegalConnect`;
    } else {
      document.title = `Lawyers in ${cityName} | LegalConnect`;
    }
  }, [cityName, stateData]);

  // Filters
  const [specializationFilter, setSpecializationFilter] = useState("All Practice Areas");
  const [courtLevelFilter, setCourtLevelFilter] = useState("All Courts");
  const [maxFeeFilter, setMaxFeeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Lawyer data
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCityLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        city: cityName
      };

      if (specializationFilter && specializationFilter !== "All Practice Areas") {
        payload.specialization = specializationFilter;
      }
      if (courtLevelFilter && courtLevelFilter !== "All Courts") {
        payload.courtLevel = courtLevelFilter;
      }
      if (maxFeeFilter) {
        payload.maxFee = maxFeeFilter;
      }
      if (searchTerm.trim()) {
        payload.search = searchTerm.trim();
      }

      const res = await getLawyers(payload);
      setLawyers(res.lawyers || []);
    } catch (err) {
      setError(err.message || "Failed to load advocates for this city.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [cityName, specializationFilter, courtLevelFilter, maxFeeFilter, searchTerm]);

  useEffect(() => {
    loadCityLawyers();
  }, [loadCityLawyers]);

  if (!stateData) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <p className="text-sm text-slate-600">Location not found.</p>
        <Link to="/lawyers-in-india" className="mt-3 inline-block font-bold text-blue-900">
          View Lawyers in India Directory →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/lawyers-in-india" className="hover:text-blue-900">Lawyers in India</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to={`/advocate-lawyer-${stateData.slug}`} className="hover:text-blue-900">
              {stateData.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-blue-950 font-bold">{cityName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-14 px-4 text-white sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span>District & Municipal Jurisdiction</span>
          </div>

          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Lawyers in {cityName}, {stateData.name}
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consult verified trial advocates and legal advisors practicing before the District & Sessions Court of {cityName} and the {stateData.highCourt.name}. Book video or in-person consultations with transparent upfront fees.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-lg bg-slate-900 px-3 py-1 border border-slate-800">
              District Court: <strong>District & Sessions Court, {cityName}</strong>
            </span>
            <span className="rounded-lg bg-slate-900 px-3 py-1 border border-slate-800">
              High Court: <strong>{stateData.highCourt.name} ({stateData.highCourt.principalSeat})</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                {LEGAL_SERVICES.map((s) => (
                  <option key={s.slug} value={s.specialization}>{s.shortTitle}</option>
                ))}
              </select>
            </div>

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
                <option value="District Court">District Court ({cityName})</option>
                <option value="High Court">High Court</option>
                <option value="Supreme Court">Supreme Court</option>
                <option value="Tribunal">Tribunals</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Max Consultation Fee (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={maxFeeFilter}
                onChange={(e) => setMaxFeeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Keyword / Name
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Advocate name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              Filtering advocates in <strong>{cityName}</strong>
            </span>
            <button
              onClick={() => {
                setSpecializationFilter("All Practice Areas");
                setCourtLevelFilter("All Courts");
                setMaxFeeFilter("");
                setSearchTerm("");
              }}
              className="font-bold text-blue-900 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Lawyer Listings */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Scale className="mx-auto h-8 w-8 text-blue-900 animate-pulse mb-2" />
            <p className="text-xs font-bold text-slate-600">Loading advocates in {cityName}...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-xs">
            <p className="font-semibold">{error}</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm space-y-3">
            <Gavel className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              No advocates currently listed with these filters in {cityName}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We only display advocates with approved State Bar Council credentials. You can consult verified advocates across {stateData.name} or book a Pan-India video consultation.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to={`/advocate-lawyer-${stateData.slug}`}
                className="rounded-xl bg-blue-950 px-4 py-2 text-xs font-bold text-white hover:bg-blue-900 transition"
              >
                View All {stateData.name} Advocates
              </Link>
              <Link
                to="/lawyers"
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse Pan-India Lawyers
              </Link>
            </div>
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
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          <Link to={`/lawyers/${lawyer._id}`} className="hover:text-blue-900">
                            {lawyerName}
                          </Link>
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {cityName}, {stateData.name}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shrink-0">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" /> Bar Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(lawyer.specialization || []).slice(0, 3).map((sp) => (
                        <span key={sp} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {sp}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-semibold">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {experience}+ Yrs Exp.
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        {Number(rating).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                      <span className="text-sm font-black text-blue-950">₹{fee}</span>
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
                        className="rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow-sm"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other Cities in this State */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Other Major Cities & Districts in {stateData.name}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {stateData.majorCities
              .filter((c) => c.slug !== rawCitySlug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/advocate-lawyer-${stateData.slug}/${c.slug}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition"
                >
                  Lawyers in {c.name}
                </Link>
              ))}
            <Link
              to={`/advocate-lawyer-${stateData.slug}`}
              className="rounded-lg bg-blue-900 px-3 py-1.5 font-bold text-white hover:bg-blue-800 transition"
            >
              All {stateData.name} Districts →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
