import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ChevronRight,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getBlogPostBySlug, BLOG_POSTS } from "../data/blogsData";
import { LEGAL_SERVICES } from "../data/legalServicesData";

export default function BlogDetail() {
  const { user } = useAuth();
  const { articleSlug } = useParams();
  const post = useMemo(() => getBlogPostBySlug(articleSlug), [articleSlug]);

  // Related articles from the same or different category
  const relatedArticles = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  }, [post]);

  // Matching legal service if any
  const matchedService = useMemo(() => {
    if (!post?.relatedSpecialization) return null;
    return (
      LEGAL_SERVICES.find(
        (s) =>
          s.title.toLowerCase().includes(post.relatedSpecialization.toLowerCase()) ||
          post.relatedSpecialization.toLowerCase().includes(s.title.toLowerCase())
      ) || null
    );
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">
            The legal guide or article you are looking for does not exist or has been relocated.
          </p>
          <Link
            to="/blogs"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Knowledge Guides
          </Link>
        </div>
      </div>
    );
  }

  // Helper to parse simple markdown headings and lists into React elements
  const renderContent = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.trim().split("\n");
    const elements = [];
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="text-slate-700 leading-relaxed text-sm mb-4">
            {currentParagraph.join(" ")}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        return;
      }

      if (trimmed.startsWith("### ")) {
        flushParagraph();
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-bold text-slate-900 mt-6 mb-3 pt-2 border-t border-slate-100"
          >
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        flushParagraph();
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-xl font-black text-slate-900 mt-8 mb-4 pt-4 border-t border-slate-200"
          >
            {trimmed.replace("## ", "")}
          </h2>
        );
      } else if (trimmed.startsWith("- ")) {
        flushParagraph();
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 mb-2 pl-2">
            <span className="text-blue-700 font-bold mt-0.5">•</span>
            <span>{trimmed.replace("- ", "")}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        flushParagraph();
        const num = trimmed.match(/^(\d+)\.\s/)[1];
        const content = trimmed.replace(/^\d+\.\s/, "");
        elements.push(
          <div key={`num-${idx}`} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 mb-3 pl-2">
            <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-bold text-blue-900">
              {num}
            </span>
            <span>{content}</span>
          </div>
        );
      } else {
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/blogs" className="hover:text-blue-900">Legal Guides</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Back link */}
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
        </Link>

        {/* Article Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-900 border border-blue-100">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {post.readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> {post.publishedDate}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-900 font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{post.author}</p>
              <p className="text-[11px] text-slate-500">LegalConnect Contributing Counsel</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
            "{post.summary}"
          </div>

          {/* Key Takeaways Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                <Sparkles className="h-4 w-4 text-amber-600" /> Key Takeaways at a Glance
              </div>
              <ul className="space-y-2">
                {post.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Main Body */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {renderContent(post.content)}
          </div>

          {/* Statutory Disclaimer */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-600">
            <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Legal Education Disclaimer: </strong>
              This knowledge guide is published for public legal awareness and informational purposes under the Advocates Act, 1961. It does not constitute formal legal advice or create an advocate-client relationship. For specific legal issues, please consult a verified advocate with your documents.
            </div>
          </div>
        </div>

        {/* Lawyer Consultation Callout */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200">
              <Scale className="h-3.5 w-3.5 text-amber-400" /> Need Guidance on This Topic?
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              Consult a Lawyer in {post.category}
            </h3>
            <p className="text-xs text-blue-100 max-w-md">
              Schedule a private online video consultation with a verified advocate to discuss your case documents and strategy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={!user ? "/register?redirect=/lawyers" : user.role === "client" ? "/lawyers" : "/lawyer-dashboard?restricted=booking"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition-colors shadow"
            >
              <Scale className="h-4 w-4" /> Find Lawyers
            </Link>
            {matchedService && (
              <Link
                to={`/legal-services/${matchedService.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
              >
                Service Details
              </Link>
            )}
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-900" /> Related Knowledge Guides
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blogs/${rel.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {rel.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read Guide →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
