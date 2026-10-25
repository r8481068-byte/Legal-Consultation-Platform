
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star, MessageSquare, Award, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { getLawyerById } from "../services/lawyerService";
import { getAvailableSlots } from "../services/availabilityService";
import { getLawyerReviews } from "../services/reviewService";

function formatDateTime(value) {
  if (!value) return "Time not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function displayText(value, fallback = "Not specified") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function formatEducation(education) {
  if (!Array.isArray(education)) {
    return typeof education === "string" ? education : "";
  }

  return education;
}

export default function LawyerProfile() {
  const { lawyerId } = useParams();
  const navigate = useNavigate();

  const [lawyer, setLawyer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [slotsError, setSlotsError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLawyerById(lawyerId);
      setLawyer(data);
    } catch (err) {
      setError(err.message || "Unable to load lawyer profile.");
      setLawyer(null);
    } finally {
      setLoading(false);
    }
  }, [lawyerId]);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError("");
    setSelectedSlot("");

    try {
      const data = await getAvailableSlots(lawyerId);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setSlotsError(err.message || "Unable to load available slots.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [lawyerId]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await getLawyerReviews(lawyerId);
      setReviewsData(data || { reviews: [], averageRating: 0, totalReviews: 0 });
    } catch {
      // silently fallback to empty reviews
    } finally {
      setReviewsLoading(false);
    }
  }, [lawyerId]);

  useEffect(() => {
    loadProfile();
    loadSlots();
    loadReviews();
  }, [loadProfile, loadSlots, loadReviews]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-50">
        <p className="text-lg text-gray-600">
          Loading lawyer profile...
        </p>
      </main>
    );
  }

  if (error || !lawyer) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Unable to open profile
          </h1>

          <p className="mt-3 text-red-600">
            {error || "Lawyer not found."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-lg bg-blue-700 px-4 py-2 text-white"
            >
              Try Again
            </button>

            <Link
              to="/lawyers"
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              Back to Lawyers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const user =
    lawyer.user && typeof lawyer.user === "object"
      ? lawyer.user
      : {};

  const name = displayText(user.name, "Lawyer");

  const specializations = Array.isArray(lawyer.specialization)
    ? lawyer.specialization
    : typeof lawyer.specialization === "string" &&
        lawyer.specialization.trim()
      ? [lawyer.specialization]
      : [];

  const education = formatEducation(lawyer.education);

  const languages = Array.isArray(lawyer.languages)
    ? lawyer.languages.filter(
        (language) => typeof language === "string"
      )
    : typeof lawyer.languages === "string"
      ? [lawyer.languages]
      : [];

  const selectedSlotData = slots.find(
    (slot) => slot._id === selectedSlot
  );

  function handleContinueToBooking() {
    if (!selectedSlotData) return;

    sessionStorage.setItem(
      "pendingConsultation",
      JSON.stringify({
        lawyerId: lawyer._id,
        slotId: selectedSlotData._id,
        startAt: selectedSlotData.startAt,
        endAt: selectedSlotData.endAt,
      })
    );

    navigate("/book-appointment");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/lawyers"
            className="text-sm text-blue-100 hover:text-white"
          >
            ← Back to Lawyers
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Lawyer Profile
          </h1>

          <p className="mt-2 text-blue-100">
            Review the lawyer&apos;s details and available consultation times.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Lawyer details */}
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Lawyer
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : (lawyer.averageRating || 5.0).toFixed(1)}
                    <span className="text-gray-400 font-normal">
                      ({reviewsData.totalReviews || lawyer.totalReviews || 0} reviews)
                    </span>
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold text-gray-900">
                  {name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {displayText(lawyer.city, "City not specified")}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {Number(lawyer.experienceYears) || 0} years of experience
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-900">
                About the Lawyer
              </h3>

              <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                {displayText(
                  lawyer.bio,
                  "No biography has been added yet."
                )}
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-900">
                Specialization
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Not specified
                  </p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Education
                </h3>

                {Array.isArray(education) ? (
                  education.length > 0 ? (
                    <ul className="mt-2 space-y-3">
                      {education.map((item, index) => {
                        if (!item || typeof item !== "object") {
                          return null;
                        }

                        return (
                          <li
                            key={item._id || index}
                            className="rounded-lg bg-gray-50 p-3"
                          >
                            <p className="font-medium text-gray-800">
                              {displayText(
                                item.degree,
                                "Degree not provided"
                              )}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {displayText(
                                item.institution,
                                "Institution not provided"
                              )}
                            </p>

                            {item.year !== undefined &&
                              item.year !== null &&
                              item.year !== "" && (
                                <p className="mt-1 text-sm text-gray-500">
                                  Year: {displayText(item.year)}
                                </p>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-1 text-gray-500">
                      Education not provided
                    </p>
                  )
                ) : (
                  <p className="mt-1 text-gray-600">
                    {education || "Education not provided"}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Languages
                </h3>

                <p className="mt-1 text-gray-600">
                  {languages.length > 0
                    ? languages.join(", ")
                    : "Not specified"}
                </p>
              </div>
            </div>
          </article>

          {/* Availability slots */}
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Available Time Slots
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select a time for your consultation.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSlots}
                disabled={slotsLoading}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {slotsLoading ? "Refreshing..." : "Refresh Slots"}
              </button>
            </div>

            {slotsLoading && (
              <p className="py-8 text-center text-gray-600">
                Loading available slots...
              </p>
            )}

            {!slotsLoading && slotsError && (
              <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
                <p>{slotsError}</p>

                <button
                  type="button"
                  onClick={loadSlots}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!slotsLoading &&
              !slotsError &&
              slots.length === 0 && (
                <p className="mt-5 rounded-lg bg-gray-50 p-5 text-center text-gray-600">
                  No available slots right now. Please check again later.
                </p>
              )}

            {!slotsLoading &&
              !slotsError &&
              slots.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot._id;

                    return (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlot(slot._id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-700 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-400"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-gray-900">
                          {formatDateTime(slot.startAt)}
                        </span>

                        <span className="mt-1 block text-sm text-gray-500">
                          Until {formatDateTime(slot.endAt)}
                        </span>

                        <span
                          className={`mt-3 inline-block text-xs font-semibold ${
                            isSelected
                              ? "text-blue-700"
                              : "text-green-700"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select this slot"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
          </article>

          {/* Genuine Client Reviews Section */}
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  Client Reviews & Ratings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Verified feedback from completed legal consultations
                </p>
              </div>

              <div className="flex items-baseline gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                <span className="text-2xl font-bold text-amber-700">
                  {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : (lawyer.averageRating || 5.0).toFixed(1)}
                </span>
                <span className="text-sm font-medium text-amber-800">
                  / 5.0 ({reviewsData.totalReviews || lawyer.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {reviewsLoading && (
              <p className="py-8 text-center text-gray-500">Loading reviews...</p>
            )}

            {!reviewsLoading && (!reviewsData.reviews || reviewsData.reviews.length === 0) && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-800">No client reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  Be the first client to book a consultation and leave feedback for {name}.
                </p>
              </div>
            )}

            {!reviewsLoading && reviewsData.reviews && reviewsData.reviews.length > 0 && (
              <div className="mt-6 space-y-4">
                {reviewsData.reviews.map((rev) => {
                  const clientName = rev.client?.name || "Verified Client";
                  const initial = clientName.charAt(0).toUpperCase();
                  const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Recently";

                  return (
                    <div key={rev._id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-sm">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{clientName}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </span>
                              <span className="text-xs text-gray-400">• {reviewDate}</span>
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> Verified Consultation
                        </span>
                      </div>

                      {rev.reviewText && (
                        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                          {rev.reviewText}
                        </p>
                      )}

                      {/* Optional Category Feedback Badges */}
                      {rev.categories && Object.keys(rev.categories).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          {rev.categories.communication && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                              💬 Communication: {rev.categories.communication}/5
                            </span>
                          )}
                          {rev.categories.professionalism && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                              👔 Professionalism: {rev.categories.professionalism}/5
                            </span>
                          )}
                          {rev.categories.clarity && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                              💡 Advice Clarity: {rev.categories.clarity}/5
                            </span>
                          )}
                          {rev.categories.punctuality && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                              ⏱️ Punctuality: {rev.categories.punctuality}/5
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </div>

        {/* Booking summary */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Consultation Fee
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-700">
            {lawyer.consultationFee !== undefined &&
            lawyer.consultationFee !== null &&
            Number.isFinite(Number(lawyer.consultationFee))
              ? `₹${Number(lawyer.consultationFee).toLocaleString("en-IN")}`
              : "Contact for fee"}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Fee per consultation, as listed by the lawyer.
          </p>

          <div className="my-6 border-t border-gray-100" />

          <h3 className="font-bold text-gray-900">
            Your Selection
          </h3>

          {!selectedSlotData ? (
            <p className="mt-3 text-sm text-gray-500">
              Choose an available time slot to continue.
            </p>
          ) : (
            <div className="mt-3 rounded-lg bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">
                {name}
              </p>

              <p className="mt-2 text-sm text-blue-800">
                {formatDateTime(selectedSlotData.startAt)}
              </p>

              <p className="mt-1 text-sm text-blue-800">
                Until {formatDateTime(selectedSlotData.endAt)}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlotData}
            onClick={handleContinueToBooking}
            className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Continue to Booking
          </button>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            Selecting a slot does not reserve it. Your appointment
            will only be created after the booking step.
          </p>
        </aside>
      </section>
    </main>
  );
}
