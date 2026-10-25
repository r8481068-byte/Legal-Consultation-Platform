import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  Search,
  ChevronRight,
  PhoneCall,
  Briefcase,
  Home as HomeIcon,
  Gavel,
  Heart,
  Users,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LEGAL_SERVICES } from "../data/legalServicesData";

const iconMap = {
  Home: HomeIcon,
  Gavel: Gavel,
  Scale: Scale,
  Heart: Heart,
  Users: Users,
  Briefcase: Briefcase,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  CreditCard: CreditCard,
  Globe: Globe,
};

export default function LegalServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredServices = useMemo(() => {
    return LEGAL_SERVICES.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.commonIssues.some((issue) =>
          issue.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (selectedFilter === "all") return matchesSearch;
      if (selectedFilter === "personal") {
        return (
          matchesSearch &&
          ["property-law", "criminal-law", "civil-law", "family-law", "divorce-law", "consumer-protection-law"].includes(
            service.slug
          )
        );
      }
      if (selectedFilter === "corporate") {
        return (
          matchesSearch &&
          ["corporate-law", "intellectual-property-law", "labour-and-employment-law", "tax-law", "startup-law", "business-and-commercial-law", "nclt-and-company-law"].includes(
            service.slug
          )
        );
      }
      if (selectedFilter === "specialized") {
        return (
          matchesSearch &&
          ["cyber-crime-law", "administrative-law", "environmental-law", "immigration-law", "insurance-law", "nri-legal-services"].includes(
            service.slug
          )
        );
      }
      return matchesSearch;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="text-xs font-semibold text-amber-400 hover:text-white transition"
          >
            ← Back to Home
          </Link>

          <div className="mt-4 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5" /> 19 Practice Areas
            </span>
            <h1 className="text-3xl font-black text-white sm:text-5xl">
              Legal Services & Practice Categories
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              LegalConnect provides a comprehensive directory of specialized legal services. Explore practice frameworks, common disputes, and connect directly with approved advocates practicing before District Courts, High Courts, and Tribunals across India.
            </p>
          </div>

          {/* Search bar & filter pills */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal categories or legal issues (e.g., bail, RERA, divorce, trademark, GST)..."
                className="w-full rounded-xl bg-white/10 border border-white/20 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-400 focus:bg-white/15"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Categories" },
                { id: "personal", label: "Individual & Family" },
                { id: "corporate", label: "Corporate & Business" },
                { id: "specialized", label: "Specialized Laws" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedFilter(pill.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
                    selectedFilter === pill.id
                      ? "bg-amber-400 text-slate-950 shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Browse All Legal Services
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredServices.length} of {LEGAL_SERVICES.length} legal practice domains
            </p>
          </div>

          <Link
            to="/lawyers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
            <span>Search by Lawyer Name or City →</span>
          </Link>
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto">
            <Search className="mx-auto h-10 w-10 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Services Found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No legal practice area matched "{searchQuery}". Try searching for broader terms like "Property", "Criminal", or "Contract".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="mt-4 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const Icon = iconMap[service.iconName] || Scale;
              return (
                <div
                  key={service.slug}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-amber-400 shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {service.shortTitle}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {service.summary}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Common Legal Matters:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {service.commonIssues.slice(0, 3).map((issue) => (
                          <li key={issue} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/legal-services/${service.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 py-2.5 px-3 text-xs font-bold text-blue-900 hover:bg-blue-100 transition"
                    >
                      Know More <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      to={`/lawyers?specialization=${encodeURIComponent(service.specialization)}`}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-900 py-2.5 px-4 text-xs font-bold text-white hover:bg-blue-800 transition"
                      title={`Find verified ${service.shortTitle} advocates`}
                    >
                      Lawyers
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. CONSULTATION CALL TO ACTION */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-12 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-8 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Not Sure Which Category Applies?
            </span>
            <h3 className="text-2xl font-black sm:text-3xl">
              Post Your Query for Free Advocate Guidance
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Submit your legal question anonymously. Our panel of advocates provides preliminary guidance regarding applicable legal sections and recommended steps.
            </p>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/ask-question"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md hover:bg-amber-300 transition"
            >
              Ask a Free Question
            </Link>
            <Link
              to="/lawyers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Browse Lawyers Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
