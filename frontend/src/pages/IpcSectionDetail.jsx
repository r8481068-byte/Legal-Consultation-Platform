import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Gavel,
  Scale,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Lock,
  FileText
} from "lucide-react";
import { getSectionBySlug, IPC_BNS_SECTIONS } from "../data/ipcSectionsData";

export default function IpcSectionDetail() {
  const { sectionSlug } = useParams();
  const section = useMemo(() => getSectionBySlug(sectionSlug), [sectionSlug]);

  const relatedSections = useMemo(() => {
    if (!section) return [];
    return IPC_BNS_SECTIONS.filter((s) => s.id !== section.id && s.category === section.category).slice(0, 3);
  }, [section]);

  if (!section) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Gavel className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Section Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">
            The criminal law provision you are looking for does not exist or has been relocated.
          </p>
          <Link
            to="/ipc-sections"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to IPC & BNS Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/ipc-sections" className="hover:text-navy">IPC & BNS Sections</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy font-bold truncate max-w-xs">
            IPC {section.ipcSection} / BNS {section.bnsSection}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          to="/ipc-sections"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-royal hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all criminal provisions
        </Link>

        {/* Header Hero Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-navy border border-blue-200">
              {section.category}
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  section.bailable === "Bailable"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {section.bailable}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {section.cognizable}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-royal">
                Indian Penal Code (Historical - Pre 1 July 2024)
              </span>
              <h2 className="text-2xl font-heading font-black text-navy">
                Section {section.ipcSection}
              </h2>
              <p className="text-sm font-bold text-navy">
                {section.ipcTitle}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                Bharatiya Nyaya Sanhita (Current - From 1 July 2024)
              </span>
              <h2 className="text-2xl font-heading font-black text-emerald-950">
                Section {section.bnsSection}
              </h2>
              <p className="text-sm font-bold text-emerald-900">
                {section.bnsTitle}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Court of Trial
              </span>
              <p className="text-sm font-black text-slate-900">
                {section.trialCourt}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Bail Classification
              </span>
              <p className="text-sm font-black text-slate-900">
                {section.bailable}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Police Power to Arrest
              </span>
              <p className="text-sm font-black text-slate-900">
                {section.cognizable} (Cognizable Offence)
              </p>
            </div>
          </div>

          {/* Plain Language Explanation */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-900" /> Plain-Language Legal Explanation
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {section.plainLanguageExplanation}
            </p>
          </div>

          {/* Statutory Ingredients */}
          {section.ingredients && section.ingredients.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Essential Legal Ingredients to Establish Offence
              </h3>
              <p className="text-xs text-slate-500">
                The prosecution must prove all of the following statutory elements beyond reasonable doubt:
              </p>
              <ul className="space-y-2 pt-1">
                {section.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-bold text-blue-900 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Statutory Punishment Box */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <Scale className="h-4 w-4 text-amber-700" /> Statutory Punishment & Penalty
            </div>
            <p className="text-sm font-black text-amber-950 leading-relaxed">
              {section.punishment}
            </p>
          </div>

          {/* Transitional Note */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Clock className="h-4 w-4 text-blue-900" />
              <span>Transitional Law & Precedent Guidance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {section.transitionalNote}
            </p>
          </div>

          {/* Official Government References */}
          {section.officialReferences && section.officialReferences.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Statutory Sources
              </h3>
              <div className="flex flex-wrap gap-3">
                {section.officialReferences.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-blue-900 hover:bg-white hover:border-blue-400 transition"
                  >
                    <span>{ref.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-600">
            <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Legal Disclaimer: </strong>
              This entry provides general statutory awareness and comparative reference between the Indian Penal Code, 1860 and the Bharatiya Nyaya Sanhita, 2023. It does not constitute formal legal defense advice. If you or someone you know faces police proceedings or an FIR, consult a qualified criminal defense counsel immediately.
            </div>
          </div>
        </div>

        {/* Lawyer Consultation Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200">
              <Gavel className="h-3.5 w-3.5 text-amber-400" /> Criminal Defense Counsel
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              Facing Charges or Need Anticipatory Bail?
            </h3>
            <p className="text-xs text-blue-100 max-w-md">
              Connect with verified criminal defense advocates to discuss FIR quashing, bail hearings, or Section 41A notices under strict confidentiality.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/lawyers?specialization=Criminal%20Law"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition-colors shadow"
            >
              <Gavel className="h-4 w-4" /> Consult Criminal Lawyers
            </Link>
            <Link
              to="/legal-services/criminal-law"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Criminal Practice Area
            </Link>
          </div>
        </div>

        {/* Related Criminal Provisions */}
        {relatedSections.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-blue-900" /> Related Criminal Provisions in {section.category}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedSections.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/ipc-sections/${rel.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        IPC {rel.ipcSection}
                      </span>
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        BNS {rel.bnsSection}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {rel.ipcTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {rel.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View Provision →
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
