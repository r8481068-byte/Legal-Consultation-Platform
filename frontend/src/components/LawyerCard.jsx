import { Link } from "react-router-dom";

function LawyerCard({ lawyer }) {
  const user = lawyer.user || {};

  const name = user.name || lawyer.name || "Verified Lawyer";

  const specializations = Array.isArray(lawyer.specialization)
    ? lawyer.specialization
    : lawyer.specialization
      ? [lawyer.specialization]
      : [];

  const fee = Number(lawyer.consultationFee);

  const education = Array.isArray(lawyer.education)
    ? lawyer.education
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return [item.degree, item.institution, item.year]
              .filter(
                (value) =>
                  value !== undefined && value !== null && value !== "",
              )
              .join(", ");
          }

          return String(item);
        })
        .filter(Boolean)
        .join(" | ")
    : typeof lawyer.education === "object" && lawyer.education !== null
      ? [
          lawyer.education.degree,
          lawyer.education.institution,
          lawyer.education.year,
        ]
          .filter(
            (value) => value !== undefined && value !== null && value !== "",
          )
          .join(", ")
      : lawyer.education || "";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* Lawyer Information */}
      <div className="mb-4 flex items-start gap-4">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {lawyer.experienceYears ?? 0} years of experience
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
              Approved
            </span>

            {lawyer.averageRating > 0 ? (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ★ {lawyer.averageRating} ({lawyer.totalReviews || 0})
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">
                New Advocate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">
          Specialization
        </p>

        <div className="flex flex-wrap gap-2">
          {specializations.length > 0 ? (
            specializations.map((item) => (
              <span
                key={item}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">Not specified</span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
        <p>
          <span className="font-semibold">City:</span>{" "}
          {lawyer.city || "Not specified"}
        </p>

        <p>
          <span className="font-semibold">Languages:</span>{" "}
          {Array.isArray(lawyer.languages) && lawyer.languages.length > 0
            ? lawyer.languages.join(", ")
            : "Not specified"}
        </p>

        <p>
          <span className="font-semibold">Education:</span>{" "}
          {education || "Not specified"}
        </p>
      </div>

      {/* Fee and View Profile */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-500">Consultation fee</p>

          <p className="text-xl font-bold text-blue-700">
            {Number.isFinite(fee) &&
            lawyer.consultationFee !== null &&
            lawyer.consultationFee !== undefined
              ? `₹${fee}`
              : "Contact for fee"}
          </p>
        </div>

        <Link
          to={`/lawyers/${lawyer._id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export default LawyerCard;
