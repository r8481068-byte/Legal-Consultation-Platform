import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Scale,
  BookOpen,
  FileText,
  Gavel,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  PhoneCall,
} from "lucide-react";

const LEGAL_TOPICS = [
  {
    id: "kanoon",
    title: "Indian Kanoon & Case Law",
    badge: "Judicial Precedents",
    desc: "Search Supreme Court of India, High Court landmark judgements, and statutory notifications.",
    articles: [
      {
        title: "Right to Speedy Trial under Article 21",
        court: "Supreme Court of India",
        summary: "Constitutional principles regarding prolonged incarceration without trial and bail jurisprudence.",
        specialization: "Criminal Law",
      },
      {
        title: "Ancestral Property Coparcenary Rights for Daughters",
        court: "Vineeta Sharma v. Rakesh Sharma (2020)",
        summary: "Equal coparcenary rights to daughters in Hindu succession regardless of whether father was alive in 2005.",
        specialization: "Family Law",
      },
      {
        title: "Section 138 NI Act: Presumption of Legally Enforceable Debt",
        court: "Kalamani Tex v. P. Balasubramanian (2021)",
        summary: "Rebuttal standard for drawer of cheque under statutory presumption under Section 139.",
        specialization: "Corporate Law",
      },
    ],
  },
  {
    id: "ipc",
    title: "Indian Penal Code (IPC Sections)",
    badge: "Substantive Criminal Law",
    desc: "Key definitions, offenses, punishments, and bailable vs non-bailable classifications.",
    articles: [
      {
        title: "Section 420: Cheating & Dishonestly Inducing Delivery of Property",
        court: "Cognizable, Non-Bailable, Triable by Magistrate First Class",
        summary: "Deception of any person, fraudulently inducing delivery of valuable security or property. Punishment up to 7 years.",
        specialization: "Criminal Law",
      },
      {
        title: "Section 498A: Cruelty by Husband or Relatives of Husband",
        court: "Cognizable, Non-Bailable",
        summary: "Willful conduct likely to drive woman to commit suicide or cause grave injury, or harassment regarding dowry demands.",
        specialization: "Family Law",
      },
      {
        title: "Section 302: Punishment for Murder",
        court: "Cognizable, Non-Bailable, Court of Session",
        summary: "Prescribes capital punishment or imprisonment for life, along with fine, for the offense of murder under Section 300.",
        specialization: "Criminal Law",
      },
    ],
  },
  {
    id: "bns",
    title: "Bharatiya Nyaya Sanhita (BNS Sections)",
    badge: "Modern Penal Framework",
    desc: "Overview of the Bharatiya Nyaya Sanhita replacing the colonial Indian Penal Code.",
    articles: [
      {
        title: "Section 69 BNS: Deceitful Promise of Marriage",
        court: "Cognizable, Non-Bailable",
        summary: "Penalizes sexual intercourse by employing deceitful means or false promise of employment, promotion, or marriage.",
        specialization: "Criminal Law",
      },
      {
        title: "Section 111 BNS: Organized Crime",
        court: "Special Investigation & Strict Bail Provisions",
        summary: "Penalizes continuing unlawful activity, kidnapping, extortion, contract killing, economic offenses by organized syndicates.",
        specialization: "Criminal Law",
      },
      {
        title: "Section 316 BNS: Criminal Breach of Trust",
        court: "BNS Modernized Provisions",
        summary: "Punishment for criminal breach of trust by carriers, warehouse-keepers, and public servants.",
        specialization: "Corporate Law",
      },
    ],
  },
  {
    id: "family",
    title: "Family, Marriage & Divorce Law",
    badge: "Personal Law",
    desc: "Mutual consent divorce, Hindu Marriage Act, Special Marriage Act, custody, and domestic violence protection.",
    articles: [
      {
        title: "Section 13B Hindu Marriage Act: Mutual Consent Divorce",
        court: "Family Court Procedure",
        summary: "Requirement of living separately for one year, mandatory motion period, and waiver of statutory cooling-off period.",
        specialization: "Family Law",
      },
      {
        title: "Protection of Women from Domestic Violence Act, 2005",
        court: "Magistrate Court Relief",
        summary: "Right to reside in shared household, protection orders, monetary relief, and interim child custody orders.",
        specialization: "Family Law",
      },
    ],
  },
  {
    id: "property",
    title: "Property & Real Estate Law",
    badge: "Civil Jurisprudence",
    desc: "Transfer of Property Act, RERA complaints, title search, eviction, and partition suits.",
    articles: [
      {
        title: "Section 54 Transfer of Property Act: Sale of Immovable Property",
        court: "Mandatory Registration Requirement",
        summary: "Transfer of ownership in exchange for a price paid or promised. Registered deed mandatory for value exceeding ₹100.",
        specialization: "Property Law",
      },
      {
        title: "Real Estate (Regulation and Development) Act (RERA)",
        court: "State Real Estate Regulatory Authority",
        summary: "Delayed possession interest, refund of advance payment with penalty, and structural defect warranty for 5 years.",
        specialization: "Property Law",
      },
    ],
  },
];

export default function LegalAdvice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab") || searchParams.get("topic") || "kanoon";

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (activeTabParam) {
      // Map aliases
      if (activeTabParam.includes("divorce") || activeTabParam.includes("hma")) {
        setActiveTab("family");
      } else if (activeTabParam.includes("property")) {
        setActiveTab("property");
      } else if (activeTabParam.includes("ipc") || activeTabParam.includes("crpc")) {
        setActiveTab("ipc");
      } else if (activeTabParam.includes("bns")) {
        setActiveTab("bns");
      } else {
        setActiveTab(activeTabParam);
      }
    }
  }, [activeTabParam]);

  const currentTopic = LEGAL_TOPICS.find((t) => t.id === activeTab) || LEGAL_TOPICS[0];

  const filteredArticles = currentTopic.articles.filter((art) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.court.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white shadow-md sm:p-10">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" /> Statutory Library & Advice Hub
            </span>
            <h1 className="text-3xl font-black sm:text-4xl">
              Legal Advice & Law Guides
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Explore key provisions of the Indian Penal Code, Bharatiya Nyaya Sanhita, landmark judicial rulings, and essential legal procedures.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {LEGAL_TOPICS.map((topic) => {
            const isActive = activeTab === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setActiveTab(topic.id);
                  setSearchParams({ tab: topic.id });
                }}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {topic.title}
              </button>
            );
          })}
        </div>

        {/* Active Section Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Topic Description & Articles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {currentTopic.badge}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {currentTopic.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{currentTopic.desc}</p>
                </div>

                {/* Filter Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search sections or topics..."
                    className="w-full rounded-xl border border-slate-300 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              {/* Articles / Sections List */}
              <div className="mt-6 space-y-4">
                {filteredArticles.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-500">
                    No articles match your search query.
                  </p>
                ) : (
                  filteredArticles.map((art, idx) => (
                    <article
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-900 text-sm">{art.title}</h3>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {art.specialization}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        {art.court}
                      </p>
                      <p className="mt-2.5 text-xs text-slate-700 leading-relaxed">
                        {art.summary}
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <Link
                          to={`/lawyers?specialization=${encodeURIComponent(art.specialization)}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                        >
                          Consult a {art.specialization} Lawyer <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Consultation Widget */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-900">
                <PhoneCall className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-900">Need Case-Specific Advice?</h3>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Legal statutes provide statutory guidelines, but facts, court jurisdiction, and evidence dictate case outcomes. Book an advocate for private consultation.
              </p>
              <div className="mt-5 space-y-2">
                <Link
                  to="/lawyers"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3 text-xs font-bold text-white hover:bg-blue-800 transition"
                >
                  <Scale className="h-4 w-4" /> Find Verified Advocates
                </Link>
                <Link
                  to="/ask-question"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <HelpCircle className="h-4 w-4" /> Ask a Free Question
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
              <h4 className="font-bold text-amber-950 text-sm">Statutory Notice</h4>
              <p className="mt-1 text-[11px] text-amber-900 leading-relaxed">
                Information provided in this library is curated for educational reference and does not constitute a formal advocate–client retainer agreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
