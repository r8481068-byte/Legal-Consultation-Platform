import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Filter, RotateCcw, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LawyerCard from "./LawyerCard";
import { getLawyers } from "../services/lawyerService";

const CITIES = [
  "All Cities",
  "New Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Jaipur",
  "Chandigarh",
  "Pune",
  "Hyderabad",
  "Kolkata",
];

const PRACTICE_AREAS = [
  "All Practice Areas",
  "Corporate Law",
  "Contract Law",
  "Civil Litigation",
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Labour Law",
  "Consumer Law",
  "Cyber Law",
];

export default function LawyerSearch({ initialCity = "", initialSpecialization = "" }) {
  const { user } = useAuth();
  const [city, setCity] = useState(initialCity || "All Cities");
  const [specialization, setSpecialization] = useState(initialSpecialization || "All Practice Areas");
  const [minExperience, setMinExperience] = useState("");
  const [maxFee, setMaxFee] = useState("");

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {};
      if (city && city !== "All Cities") filters.city = city;
      if (specialization && specialization !== "All Practice Areas") filters.specialization = specialization;
      if (minExperience) filters.minExperience = minExperience;
      if (maxFee) filters.maxFee = maxFee;

      const data = await getLawyers(filters);
      setLawyers(data.lawyers || []);
    } catch (err) {
      setError(err.message || "Unable to load lawyers. Please try again.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [city, specialization, minExperience, maxFee]);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLawyers();
  };

  const handleReset = () => {
    setCity("All Cities");
    setSpecialization("All Practice Areas");
    setMinExperience("");
    setMaxFee("");
  };

  return (
    <section className="bg-slate-50/60 py-16" id="search-lawyers">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
            Verified Legal Professionals
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Search for Top-Rated Lawyers
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Find and consult approved advocates filtered by your city, practice area, and consultation budget.
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            {/* City Selector */}
            <div>
              <label htmlFor="search-city" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <MapPin className="h-3.5 w-3.5 text-blue-700" />
                Select City
              </label>
              <select
                id="search-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Practice Area Selector */}
            <div>
              <label htmlFor="search-practice" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <Briefcase className="h-3.5 w-3.5 text-blue-700" />
                Practice Area
              </label>
              <select
                id="search-practice"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                {PRACTICE_AREAS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Experience */}
            <div>
              <label htmlFor="search-exp" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <Filter className="h-3.5 w-3.5 text-blue-700" />
                Min Experience
              </label>
              <select
                id="search-exp"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any Experience</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
              </select>
            </div>

            {/* Max Consultation Fee */}
            <div>
              <label htmlFor="search-fee" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <span>₹</span> Max Fee
              </label>
              <select
                id="search-fee"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any Fee</option>
                <option value="1000">Up to ₹1,000</option>
                <option value="2000">Up to ₹2,000</option>
                <option value="3000">Up to ₹3,000</option>
                <option value="5000">Up to ₹5,000</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-900 py-2.5 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset filters"
                className="flex items-center justify-center rounded-xl border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {loading ? "Finding available lawyers..." : `Approved Advocates (${lawyers.length})`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only verified lawyer profiles are displayed.
            </p>
          </div>

          <Link
            to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Explore all lawyers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-6 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="font-bold">{error}</p>
            <button
              type="button"
              onClick={fetchLawyers}
              className="mt-4 rounded-xl bg-red-700 px-5 py-2 text-xs font-bold text-white hover:bg-red-800"
            >
              Retry Search
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && lawyers.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h4 className="text-lg font-bold text-slate-800">No lawyers found matching your filters</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Try choosing "All Cities" or "All Practice Areas" to see all available legal practitioners.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </button>
          </div>
        )}

        {/* Lawyers Grid */}
        {!loading && !error && lawyers.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer._id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
