import { Link } from "react-router-dom";
import { Star, ShieldCheck, MapPin, ChevronRight, Briefcase } from "lucide-react";

export default function LawyerCard({ lawyer }) {
  const user = lawyer.user || {};
  const rawName = user.name || lawyer.name || "Verified Advocate";
  const name = rawName.startsWith("Adv.") || rawName.startsWith("Advocate")
    ? rawName
    : `Advocate ${rawName}`;

  const profileImage = user.profileImage || lawyer.profileImage || null;
  const initials = rawName
    .replace(/^Advocate\s+/i, "")
    .replace(/^Adv\.\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  const isApproved = lawyer.verificationStatus === "approved";
  const experienceYears = Number(lawyer.experienceYears) || 0;

  const specializations = Array.isArray(lawyer.specialization)
    ? lawyer.specialization
    : lawyer.specialization
    ? [lawyer.specialization]
    : [];

  const locationText = [lawyer.city, lawyer.state].filter(Boolean).join(", ") || "India";

  const rawFee = Number(lawyer.consultationFee);
  const feeText = Number.isFinite(rawFee) && rawFee > 0
    ? `₹${rawFee.toLocaleString("en-IN")}`
    : "Contact for fee";

  const ratingValue = lawyer.averageRating > 0
    ? Number(lawyer.averageRating).toFixed(1)
    : "5.0";
  const reviewCount = lawyer.totalReviews || 0;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div>
        {/* ============================================================== */}
        {/* TOP SECTION: Profile Image, Name, Experience, Badge, Rating   */}
        {/* ============================================================== */}
        <div className="flex items-start gap-4">
          {/* Lawyer Profile Image */}
          <div className="relative shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#101C3A] to-[#2457D6] text-white flex items-center justify-center font-extrabold text-xl shadow-2xs border border-slate-200 ${
                profileImage ? "hidden" : "flex"
              }`}
            >
              {initials}
            </div>
            {isApproved && (
              <span
                className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-2xs"
                title="Verified by LegalConnect"
              >
                <ShieldCheck className="h-3 w-3" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Full Name */}
            <Link
              to={`/lawyers/${lawyer._id}`}
              className="block font-heading font-bold text-slate-900 text-base group-hover:text-[#2457D6] hover:underline transition-colors truncate"
              title={name}
            >
              {name}
            </Link>

            {/* Experience */}
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-slate-400" />
              <span>{experienceYears} {experienceYears === 1 ? "year" : "years"} experience</span>
            </p>

            {/* Badges: Verified Lawyer Badge & Rating with Review Count */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isApproved && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Verified
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200/80">
                <Star className="h-3 w-3 fill-[#D9A441] text-[#D9A441]" />
                <span>{ratingValue}</span>
                <span className="text-amber-700 font-normal">
                  ({reviewCount})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{locationText}</span>
        </div>

        {/* Specializations Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specializations.length > 0 ? (
            specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="rounded-lg bg-blue-50/70 px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] border border-blue-100/80"
              >
                {spec}
              </span>
            ))
          ) : (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 border border-slate-200">
              General Practice
            </span>
          )}
          {specializations.length > 3 && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              +{specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Short Headline / Bio preview if available */}
        {(lawyer.headline || lawyer.bio) && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {lawyer.headline || lawyer.bio}
          </p>
        )}
      </div>

      {/* ============================================================== */}
      {/* BOTTOM SECTION: Fee (Left corner) & View Profile (Right corner) */}
      {/* ============================================================== */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Consultation Fee
          </span>
          <span className="font-heading text-lg font-black text-[#0B132B]">
            {feeText}
          </span>
        </div>

        <Link
          to={`/lawyers/${lawyer._id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#2457D6] focus:ring-offset-2"
        >
          <span>View Profile</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
