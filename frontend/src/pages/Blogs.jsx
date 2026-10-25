import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  User,
  ArrowRight,
  Scale,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter
} from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS } from "../data/blogsData";

export default function Blogs() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-bold">Legal Knowledge Guide & Blogs</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <BookOpen className="h-3.5 w-3.5" /> Legal Education & Awareness
            </span>
            <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight">
              LegalConnect Knowledge Guides
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Original legal guides, statutory timelines, procedural checklists, and citizen rights explained by practicing advocates under Indian law.
            </p>

            {/* Quick stats / reassurance */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Legal Frameworks
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-amber-400" />
                Written for Citizens & Founders
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Updated Statutory Procedures
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic, law, or keyword..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {BLOG_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-900 text-white shadow-sm ring-1 ring-blue-900"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No articles found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No legal articles matched your search or category filter. Try clearing filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-950 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-900 border border-blue-100">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                    <Link to={`/blogs/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>

                  {/* Takeaways snippet */}
                  {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                        Key Insight
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        • {post.keyTakeaways[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-medium truncate max-w-[180px]">
                      <User className="h-3 w-3 text-slate-400 flex-shrink-0" /> {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3 w-3" /> {post.publishedDate}
                    </span>
                  </div>

                  {/* Read More Link */}
                  <Link
                    to={`/blogs/${post.slug}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-blue-950 transition-colors group-hover:bg-blue-900 group-hover:text-white"
                  >
                    Read Complete Guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Consultation Callout */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Need Personal Legal Guidance for Your Specific Case?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              These articles provide general legal education. For binding legal advice tailored to your documents, book an online video consultation with a verified advocate.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lawyers"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition-colors"
            >
              <Scale className="h-4 w-4" /> Consult a Verified Lawyer
            </Link>
            <Link
              to="/legal-services"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Explore All 19 Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
