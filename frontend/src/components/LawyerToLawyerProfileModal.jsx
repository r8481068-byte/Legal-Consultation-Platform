import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  ShieldCheck,
  Clock,
  Star,
  MapPin,
  CreditCard,
  Globe,
  Briefcase,
  Scale,
  GraduationCap,
  Award,
  BookOpen,
  Phone,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { getLawyerById } from "../services/lawyerService";

export default function LawyerToLawyerProfileModal({
  isOpen,
  onClose,
  lawyerId,
  initialLawyer = null,
}) {
  const [lawyer, setLawyer] = useState(initialLawyer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && lawyerId) {
      setLoading(true);
      setError("");
      getLawyerById(lawyerId)
        .then((data) => {
          setLawyer(data);
        })
        .catch((err) => {
          setError(err.message || "Failed to load advocate profile.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isOpen) {
      setLawyer(null);
      setError("");
    }
  }, [isOpen, lawyerId]);

  if (!isOpen) return null;

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

  const isVerified = lawyer?.verificationStatus === "approved";
  const barCouncilId = lawyer?.barCouncilId || null;
  const experienceYears = Number(lawyer?.experienceYears) || 0;
  const locationText =
    [lawyer?.officeAddress, lawyer?.district, lawyer?.city, lawyer?.state]
      .filter(Boolean)
      .join(", ") ||
    [lawyer?.city, lawyer?.state].filter(Boolean).join(", ") ||
    "National Practice, India";

  const rawFee = Number(lawyer?.consultationFee);
  const feeText =
    Number.isFinite(rawFee) && rawFee >= 0
      ? `₹${rawFee.toLocaleString("en-IN")}`
      : "Contact for fee";

  const durationText = lawyer?.consultationDuration
    ? `${lawyer.consultationDuration} mins`
    : "30 mins";

  const ratingValue =
    lawyer?.averageRating > 0 ? Number(lawyer.averageRating).toFixed(1) : "5.0";
  const reviewCount = lawyer?.totalReviews || 0;

  const specializations = Array.isArray(lawyer?.specialization)
    ? lawyer.specialization
    : lawyer?.specialization
    ? [lawyer.specialization]
    : [];

  const secondarySpecs = Array.isArray(lawyer?.secondarySpecializations)
    ? lawyer.secondarySpecializations
    : [];

  const courtLevels = Array.isArray(lawyer?.courtLevels) && lawyer.courtLevels.length > 0
    ? lawyer.courtLevels
    : ["District Court", "High Court"];

  const jurisdictions = Array.isArray(lawyer?.jurisdictions)
    ? lawyer.jurisdictions
    : [];

  const languages = Array.isArray(lawyer?.languages) && lawyer.languages.length > 0
    ? lawyer.languages
    : ["English"];

  const educationList = Array.isArray(lawyer?.education) ? lawyer.education : [];
  const internshipsList = Array.isArray(lawyer?.internships) ? lawyer.internships : [];
  const awardsList = Array.isArray(lawyer?.awards) ? lawyer.awards : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Advocate Professional Profile
              </h2>
              <p className="text-xs text-slate-500">
                Lawyer-to-Lawyer Professional Directory View
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
              <p className="text-xs font-bold text-slate-600">
                Loading advocate profile...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Unable to load advocate profile
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          ) : lawyer ? (
            <>
              {/* Identity & Verification Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative shrink-0">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={name}
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-20 w-20 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md ${
                        profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {initials}
                    </div>

                    {isVerified && (
                      <div
                        className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white ring-2 ring-white shadow-xs"
                        title="BCI Verified Advocate"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-black text-xl text-slate-900 truncate">
                        {name}
                      </h3>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          BCI Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <Clock className="h-3 w-3 text-amber-600" />
                          Verification Pending
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-blue-600">
                      {lawyer.designation || "Advocate"}
                      {barCouncilId && (
                        <>
                          {" "}• Bar Council ID:{" "}
                          <span className="text-slate-900">{barCouncilId}</span>
                        </>
                      )}
                    </p>

                    {lawyer.headline && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {lawyer.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {experienceYears} {experienceYears === 1 ? "year" : "years"} experience
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {ratingValue} ({reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-blue-600" /> Consultation Rate
                    </span>
                    <p className="font-extrabold text-blue-700 text-sm">
                      {feeText} <span className="text-[10px] text-slate-500 font-normal">/ {durationText}</span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-600" /> Practice City
                    </span>
                    <p className="font-bold text-slate-800 truncate">
                      {lawyer.city || "India"}{lawyer.state ? `, ${lawyer.state}` : ""}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-600" /> Languages
                    </span>
                    <p className="font-bold text-slate-800 truncate">
                      {languages.join(", ")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Phone className="h-3 w-3 text-blue-600" /> Contact Info
                    </span>
                    <p className="font-bold text-slate-800 truncate">
                      {lawyer.phone && !lawyer.hidePhone ? (
                        lawyer.phone
                      ) : (
                        <span className="text-slate-400 font-normal italic">
                          Chamber Registered
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Overview / Bio */}
              {(lawyer.bio || lawyer.describeUs) && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    About Chambers & Professional Practice
                  </h4>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {lawyer.bio || lawyer.describeUs}
                  </p>
                  {lawyer.describeUs && lawyer.bio && lawyer.describeUs !== lawyer.bio && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800 block mb-1">
                        Practice Overview:
                      </span>
                      <p className="italic text-slate-600 whitespace-pre-line">
                        {lawyer.describeUs}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Specializations & Jurisdictions */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-blue-600" />
                    Specializations & Practice Areas
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {specializations.map((spec, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-bold shadow-2xs"
                      >
                        {spec}
                      </span>
                    ))}
                    {secondarySpecs.map((spec, i) => (
                      <span
                        key={`sec-${i}`}
                        className="rounded-xl bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">
                      Court Admissions & Standing
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {courtLevels.map((court, i) => (
                        <span
                          key={i}
                          className="rounded-xl bg-slate-50 text-slate-800 border border-slate-200 px-2.5 py-1 text-xs font-semibold"
                        >
                          🏛️ {court}
                        </span>
                      ))}
                    </div>
                  </div>

                  {jurisdictions.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">
                        Active Jurisdictions & Benches
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {jurisdictions.map((j, i) => (
                          <span
                            key={i}
                            className="rounded-xl bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs font-medium"
                          >
                            {j}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Education & Qualifications */}
              {educationList.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Education & Academic Qualifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {educationList.map((edu, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-sm">
                            {edu.degree || "Law Degree"}
                          </h5>
                          {edu.year && (
                            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                              Class of {edu.year}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium">
                          {edu.institution}
                          {edu.cityState ? `, ${edu.cityState}` : ""}
                        </p>
                        {edu.certifications && (
                          <p className="text-blue-700 font-semibold text-[11px] pt-0.5">
                            Honors: {edu.certifications}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships & Judicial Training */}
              {internshipsList.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Internships & Judicial Training
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {internshipsList.map((intern, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900">
                            {intern.institution}
                          </h5>
                          {intern.duration && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {intern.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-700 font-semibold text-[11px]">
                          {intern.role || "Intern"}
                          {intern.practiceArea ? ` • ${intern.practiceArea}` : ""}
                        </p>
                        {intern.responsibilities && (
                          <p className="text-slate-600 pt-0.5 leading-relaxed text-[11px]">
                            {intern.responsibilities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements & Awards */}
              {(awardsList.length > 0 ||
                lawyer.achievements ||
                lawyer.publications ||
                lawyer.memberships) && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" />
                    Achievements & Professional Recognition
                  </h4>

                  {awardsList.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Awards & Honors
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {awardsList.map((award, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-amber-50/50 p-3 border border-amber-200/80 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <h6 className="font-bold text-slate-900">
                                {award.name}
                              </h6>
                              {award.year && (
                                <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                  {award.year}
                                </span>
                              )}
                            </div>
                            {award.organization && (
                              <p className="text-amber-900 text-[11px] font-semibold">
                                {award.organization}
                              </p>
                            )}
                            {award.description && (
                              <p className="text-slate-600 text-[11px] pt-0.5 leading-relaxed">
                                {award.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lawyer.achievements && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Notable Accomplishments
                      </h5>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {lawyer.achievements}
                      </p>
                    </div>
                  )}

                  {lawyer.publications && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                        Publications & Legal Treatises
                      </h5>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {lawyer.publications}
                      </p>
                    </div>
                  )}

                  {lawyer.memberships && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <Scale className="h-3 w-3 text-indigo-600" />
                        Professional Memberships & Bar Councils
                      </h5>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {lawyer.memberships}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">
            LegalConnect Verified Advocate Network
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

