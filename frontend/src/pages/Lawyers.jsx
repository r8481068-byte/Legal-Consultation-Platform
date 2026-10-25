import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LawyerCard from "../components/LawyerCard";
import { getLawyers } from "../services/lawyerService";

const initialFilters = {
  search: "",
  specialization: "",
  city: "",
  maxFee: "",
  minExperience: "",
};

export default function Lawyers() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get("search") || "",
    specialization: searchParams.get("specialization") || "",
    city: searchParams.get("city") || "",
    maxFee: searchParams.get("maxFee") || "",
    minExperience: searchParams.get("minExperience") || "",
  }));
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const qSearch = searchParams.get("search") || "";
    const qCity = searchParams.get("city") || "";
    const qSpec = searchParams.get("specialization") || "";
    const qFee = searchParams.get("maxFee") || "";
    const qExp = searchParams.get("minExperience") || "";

    const updated = {
      search: qSearch,
      city: qCity,
      specialization: qSpec,
      maxFee: qFee,
      minExperience: qExp,
    };
    setFilters(updated);
    setAppliedFilters(updated);
  }, [searchParams]);

  const loadLawyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLawyers(appliedFilters);
      setLawyers(data.lawyers);
    } catch (err) {
      setError(err.message || "Unable to load lawyers.");
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadLawyers();
  }, [loadLawyers]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-14 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="text-xs font-semibold text-amber-300 hover:text-white transition">
            ← Back to Home
          </Link>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                Approved Panel Advocates
              </span>
              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
                Find the Right Lawyer
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Search verified advocates by practice area, city jurisdiction, years of trial experience, and transparent consultation fees.
              </p>
            </div>

            <Link
              to="/ask-question"
              className="inline-flex self-start items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
            >
              Ask a Free Question →
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form
          onSubmit={handleSearch}
          className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Search lawyer
            </label>
            <input
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Name or keyword"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="specialization"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Specialization
            </label>
            <input
              id="specialization"
              name="specialization"
              value={filters.specialization}
              onChange={handleChange}
              placeholder="e.g. Criminal, Family"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              City
            </label>
            <input
              id="city"
              name="city"
              value={filters.city}
              onChange={handleChange}
              placeholder="e.g. Delhi"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="maxFee"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Maximum fee (₹)
            </label>
            <input
              id="maxFee"
              name="maxFee"
              type="number"
              min="0"
              value={filters.maxFee}
              onChange={handleChange}
              placeholder="e.g. 2000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="minExperience"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Minimum experience (years)
            </label>
            <input
              id="minExperience"
              name="minExperience"
              type="number"
              min="0"
              value={filters.minExperience}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Available Lawyers</h2>

          {!loading && (
            <p className="text-sm text-gray-500">
              {lawyers.length} result{lawyers.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            <p className="mt-4 text-gray-600">Loading lawyers...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Could not load lawyers</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={loadLawyers}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && lawyers.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No lawyers found
            </h3>
            <p className="mt-2 text-gray-500">
              Try different search filters or reset your search.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && lawyers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer._id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
