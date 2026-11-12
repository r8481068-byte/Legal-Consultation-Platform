import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Award,
  Clock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Scale,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Check,
  Camera,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getLawyerById } from "../services/lawyerService";
import { getAvailableSlots } from "../services/availabilityService";
import { getLawyerReviews } from "../services/reviewService";
import { getBookingEligibility, updateProfile } from "../services/authService";

function formatDateTime(value) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

export default function LawyerProfile() {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  // Profile image upload state
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [lawyer, setLawyer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [slotsError, setSlotsError] = useState("");

  // Preferred time state if no slots configured
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [isFlexibleTime, setIsFlexibleTime] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [checkingEligibility, setCheckingEligibility] = useState(false);

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
      setReviewsData({ reviews: [], averageRating: 0, totalReviews: 0 });
    } finally {
      setReviewsLoading(false);
    }
  }, [lawyerId]);

  useEffect(() => {
    loadProfile();
    loadSlots();
    loadReviews();
  }, [loadProfile, loadSlots, loadReviews]);

  // Selected slot lookup
  const selectedSlotData = useMemo(() => {
    return slots.find((s) => s._id === selectedSlot) || null;
  }, [slots, selectedSlot]);

  // Calculated Reviews & Rating statistics from actual reviews
  const reviewStats = useMemo(() => {
    const list = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
    const count = list.length;
    if (count === 0) {
      const fallbackRating = lawyer?.averageRating > 0 ? Number(lawyer.averageRating).toFixed(1) : "5.0";
      const fallbackCount = lawyer?.totalReviews || 0;
      return { count: fallbackCount, average: fallbackRating, reviews: [] };
    }
    const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / count).toFixed(1);
    return { count, average: avg, reviews: list };
  }, [reviewsData, lawyer]);

  const user = lawyer?.user || {};
  const rawName = user.name || lawyer?.name || "Verified Advocate";
  const name = rawName.startsWith("Adv.") || rawName.startsWith("Advocate")
    ? rawName
    : `Advocate ${rawName}`;
  const isApproved = lawyer?.verificationStatus === "approved";
  const experienceYears = Number(lawyer?.experienceYears) || 0;
  const consultationFee = Number(lawyer?.consultationFee);
  const feeText = Number.isFinite(consultationFee) && consultationFee > 0
    ? `₹${consultationFee.toLocaleString("en-IN")}`
    : "Contact for fee";

  const specializations = Array.isArray(lawyer?.specialization)
    ? lawyer.specialization
    : lawyer?.specialization
    ? [lawyer.specialization]
    : [];

  const initials = rawName
    .replace(/^Advocate\s+/i, "")
    .replace(/^Adv\.\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  const isOwnProfile =
    currentUser &&
    lawyer &&
    (currentUser._id === (lawyer.user?._id || lawyer.user) ||
      currentUser.id === (lawyer.user?._id || lawyer.user));

  const canEditProfile =
    isOwnProfile ||
    currentUser?.role === "lawyer" ||
    currentUser?.role === "admin" ||
    !currentUser;

  // Handler: Upload new profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size cannot exceed 2MB.");
      return;
    }

    setUploadError("");
    setUploadSuccess("");
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await updateProfile({ profileImage: base64Data });
        const newImage = res?.user?.profileImage || base64Data;

        // Immediately update lawyer profile image in view
        setLawyer((prev) => {
          if (!prev) return prev;
          const prevUser = typeof prev.user === "object" ? prev.user : {};
          return {
            ...prev,
            user: {
              ...prevUser,
              profileImage: newImage,
            },
            profileImage: newImage,
          };
        });

        // Persist to auth context and session storage
        if (updateUser) {
          updateUser({ profileImage: newImage });
        }

        setUploadSuccess("Profile image updated successfully!");
        setTimeout(() => setUploadSuccess(""), 4000);
      } catch (err) {
        setUploadError(err.message || "Failed to upload profile photo.");
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Failed to read image file.");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Flow Handler: Book Consultation
  async function handleBookConsultation() {
    setBookingError("");

    // If lawyer has slots, require either selecting a slot OR entering preferred time
    if (slots.length > 0 && !selectedSlot && !preferredDate && !isFlexibleTime) {
      setBookingError("Please select an available time slot above to continue with your booking.");
      const slotsSection = document.getElementById("available-slots-section");
      if (slotsSection) slotsSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (slots.length === 0 && !preferredDate && !isFlexibleTime) {
      setBookingError("Please select a preferred date and time, or choose flexible timing.");
      const slotsSection = document.getElementById("available-slots-section");
      if (slotsSection) slotsSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Save selection in session storage
    const selectionPayload = {
      lawyerId: lawyer._id,
      lawyerName: name,
      slotId: selectedSlot || null,
      startAt: selectedSlotData?.startAt || null,
      endAt: selectedSlotData?.endAt || null,
      isPreferredTime: !selectedSlot,
      isFlexibleTime: Boolean(isFlexibleTime),
      preferredDate: preferredDate || "",
      preferredTime: preferredTime || "",
    };

    sessionStorage.setItem("pendingConsultation", JSON.stringify(selectionPayload));

    // 1. If not logged in -> redirect to register with return redirect
    if (!currentUser) {
      navigate(`/register?redirect=${encodeURIComponent(`/lawyers/${lawyer._id}`)}`);
      return;
    }

    // 2. If logged in as non-client (e.g. lawyer or admin)
    if (currentUser.role !== "client") {
      setBookingError("Advocate accounts cannot access client consultation booking. Consultations can only be booked from a Client account.");
      return;
    }

    // 3. Centralized profile completion check
    setCheckingEligibility(true);
    try {
      const eligibility = await getBookingEligibility();

      // If client profile is incomplete (< 100%), redirect directly to Client Portal My Profile
      if (!eligibility.eligible || eligibility.checks?.profilePercentage !== 100 || !eligibility.checks?.profileCompleted) {
        navigate("/dashboard?tab=profile", {
          state: {
            fromBooking: true,
            lawyerId: lawyer._id,
            lawyerName: name,
          },
        });
        return;
      }

      // If 100% complete, proceed to dedicated booking page
      navigate("/book-appointment");
    } catch {
      navigate("/book-appointment");
    } finally {
      setCheckingEligibility(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#2457D6] border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">
            Loading advocate profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !lawyer) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-xs border border-slate-200">
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Advocate Profile Unavailable
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {error || "Advocate profile not found or currently unavailable."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/lawyers"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Available Advocates
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="bg-gradient-to-r from-[#070D1E] via-[#0B132B] to-[#101C3A] text-white px-4 py-8 sm:px-6 shadow-md border-b border-slate-800">
        <div className="mx-auto max-w-6xl">
          <Link
            to={currentUser?.role === "client" ? "/client/lawyers" : "/lawyers"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition mb-4"
          >
            ← Back to Available Advocates
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9A441] block mb-1">
                Verified Advocate Profile
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBookConsultation}
                disabled={checkingEligibility}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D9A441] px-6 py-3 text-xs font-black tracking-wide text-slate-950 shadow-md shadow-amber-500/20 hover:bg-[#c89432] transition transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>{checkingEligibility ? "Checking Eligibility..." : "Book Consultation"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Profile Content: Sections A through I in strict specified order */}
      <div className="mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A: LAWYER PROFILE HEADER */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Profile Image with Edit Profile Image option directly underneath */}
              <div className="relative shrink-0 flex flex-col items-center gap-2">
                <div className="relative">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={name}
                      className="h-28 w-28 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-28 w-28 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#101C3A] to-[#2457D6] text-white flex items-center justify-center text-3xl font-extrabold shadow-2xs border border-slate-200 ${
                      user.profileImage ? "hidden" : "flex"
                    }`}
                  >
                    {initials}
                  </div>
                  {isApproved && (
                    <span
                      className="absolute -bottom-2 -right-2 rounded-full bg-emerald-600 p-1.5 text-white ring-4 ring-white shadow-2xs"
                      title="Verified Advocate by LegalConnect"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {/* Edit Profile Image Button directly below */}
                {canEditProfile && (
                  <label
                    htmlFor="lawyer-profile-image-input"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#2457D6] bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2457D6]" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Edit Photo"}</span>
                    <input
                      id="lawyer-profile-image-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}

                {uploadError && (
                  <span className="text-[11px] font-medium text-red-600 text-center max-w-[130px]">
                    {uploadError}
                  </span>
                )}
                {uploadSuccess && (
                  <span className="text-[11px] font-medium text-emerald-600 text-center max-w-[130px]">
                    {uploadSuccess}
                  </span>
                )}
              </div>

              {/* Header Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Verified Lawyer Badge */}
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Lawyer
                    </span>
                  )}

                  {/* Rating and Total Review Count */}
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
                    <Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" />
                    <span>{reviewStats.average}</span>
                    <span className="text-amber-700 font-normal">
                      ({reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"})
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                    {lawyer.designation || "Advocate"}
                  </span>
                </div>

                {/* Full Name */}
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {name}
                </h2>

                {lawyer.headline && (
                  <p className="text-sm font-semibold text-[#2457D6] leading-snug">
                    {lawyer.headline}
                  </p>
                )}

                {/* Professional Specialization & Experience */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {experienceYears} {experienceYears === 1 ? "year" : "years"} legal experience
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {[lawyer.city, lawyer.state].filter(Boolean).join(", ") || "India"}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* SECTION B: ABOUT LAWYER */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-[#2457D6]" />
              About Advocate {name}
            </h3>
            {lawyer.bio && lawyer.bio.trim() ? (
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {lawyer.bio}
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No biography has been added by this advocate yet.
              </div>
            )}
          </article>

          {/* SECTION C: SPECIALIZATIONS */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-[#2457D6]" />
              Specializations & Practice Areas
            </h3>
            {specializations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, idx) => (
                  <span
                    key={`${spec}-${idx}`}
                    className="rounded-xl bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-[#1D4ED8] border border-blue-200/60"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No specializations specified yet.
              </div>
            )}

            {/* Court Levels / Admissions */}
            {Array.isArray(lawyer.courtLevels) && lawyer.courtLevels.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  Court Admissions & Jurisdictions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {lawyer.courtLevels.map((court, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      🏛️ {court}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* SECTION D: EDUCATION DETAILS */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-[#2457D6]" />
              Education & Academic Credentials
            </h3>

            {Array.isArray(lawyer.education) && lawyer.education.length > 0 ? (
              <div className="space-y-3">
                {lawyer.education.map((edu, idx) => {
                  const degree = edu.degree || "Law Degree";
                  const institution = edu.institution || edu.university || "University / College";
                  const year = edu.year || edu.passingYear || null;

                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-50/70 p-4 border border-slate-200/70 space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{degree}</h4>
                        {year && (
                          <span className="text-xs font-semibold text-slate-500">
                            Class of {year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {institution}
                        {edu.cityState ? `, ${edu.cityState}` : ""}
                      </p>
                      {edu.certifications && (
                        <p className="text-xs text-[#2457D6] pt-1">
                          Certifications: {edu.certifications}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                Education details have not been entered by this advocate yet.
              </div>
            )}
          </article>

          {/* SECTION E: INTERNSHIP AND PROFESSIONAL PRACTICE DETAILS */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-[#2457D6]" />
                Professional Practice & Chambers History
              </h3>

              {Array.isArray(lawyer.experiences) && lawyer.experiences.length > 0 ? (
                <div className="space-y-3">
                  {lawyer.experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-50/70 p-4 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {exp.organization}
                        </h4>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-xs font-medium text-slate-500">
                            {exp.startDate || "Start"} — {exp.endDate || "Present"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#2457D6]">
                        {exp.designation || "Counsel"} {exp.employmentType ? `• ${exp.employmentType}` : ""}
                      </p>
                      {exp.practiceAreas && (
                        <p className="text-xs text-slate-500">
                          Focus: {exp.practiceAreas}
                        </p>
                      )}
                      {exp.responsibilities && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-1 whitespace-pre-line">
                          {exp.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-xs text-slate-500">
                  No chamber or law firm practice history entered yet.
                </div>
              )}
            </div>

            {/* Internships & Judicial Training */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900 mb-3">
                Internships & Judicial Training
              </h4>

              {Array.isArray(lawyer.internships) && lawyer.internships.length > 0 ? (
                <div className="space-y-3">
                  {lawyer.internships.map((intern, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-50/70 p-4 border border-slate-200/70 space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-bold text-slate-900 text-xs">
                          {intern.institution}
                        </h5>
                        {intern.duration && (
                          <span className="text-[11px] text-slate-500">
                            {intern.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-900">
                        {intern.role || "Legal Intern"} {intern.practiceArea ? `• ${intern.practiceArea}` : ""}
                      </p>
                      {intern.responsibilities && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {intern.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                  No judicial internships entered.
                </div>
              )}
            </div>
          </article>

          {/* SECTION F: AWARDS, HONOURS AND ACHIEVEMENTS */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-[#D9A441]" />
              Awards, Honours & Professional Recognitions
            </h3>

            {Array.isArray(lawyer.awards) && lawyer.awards.length > 0 ? (
              <div className="space-y-3">
                {lawyer.awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-[#D9A441]" />
                        {award.name}
                      </h4>
                      {award.year && (
                        <span className="text-xs font-bold text-amber-800">
                          {award.year}
                        </span>
                      )}
                    </div>
                    {award.organization && (
                      <p className="text-xs font-medium text-amber-900">
                        Conferred by: {award.organization}
                      </p>
                    )}
                    {award.description && (
                      <p className="text-xs text-slate-700 pt-1 leading-relaxed">
                        {award.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : lawyer.achievements ? (
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4">
                <p className="text-xs text-slate-800 leading-relaxed">
                  🏆 {lawyer.achievements}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No awards or honours added by this advocate yet.
              </div>
            )}
          </article>

          {/* SECTION G: CONSULTATION FEE */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Consultation Pricing
              </span>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Current Consultation Fee
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fee set directly by the advocate for a 30-minute consultation.
              </p>
            </div>
            <div className="text-right">
              <span className="font-heading text-3xl font-black text-[#0B132B] block">
                {feeText}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Per 30-min consultation session
              </span>
            </div>
          </article>

          {/* SECTION H: AVAILABLE SLOTS & PREFERRED TIME REQUEST */}
          <article
            id="available-slots-section"
            className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#2457D6]" />
                  Available Appointment Slots
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a confirmed available slot or propose a preferred consultation time.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSlots}
                disabled={slotsLoading}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                {slotsLoading ? "Refreshing..." : "Refresh Slots"}
              </button>
            </div>

            {slotsLoading && (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#2457D6] border-t-transparent" />
                <p>Loading advocate availability slots...</p>
              </div>
            )}

            {!slotsLoading && slotsError && (
              <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
                <p>{slotsError}</p>
                <button
                  type="button"
                  onClick={loadSlots}
                  className="mt-2 font-bold underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* If Slots are configured by the lawyer */}
            {!slotsLoading && !slotsError && slots.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
                  ✓ Select from {slots.length} pre-configured available slot{slots.length === 1 ? "" : "s"}:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot._id;
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot._id);
                          setPreferredDate("");
                          setPreferredTime("");
                          setIsFlexibleTime(false);
                          setBookingError("");
                        }}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#2457D6] bg-blue-50/70 ring-2 ring-[#2457D6] shadow-2xs"
                            : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900">
                          {formatDateTime(slot.startAt)}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-500">
                          Until {formatDateTime(slot.endAt)}
                        </span>
                        <span
                          className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold ${
                            isSelected ? "text-[#2457D6]" : "text-emerald-700"
                          }`}
                        >
                          {isSelected ? "✓ Selected Slot" : "+ Select this Slot"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If NO slots are configured by the lawyer */}
            {!slotsLoading && !slotsError && slots.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-950">
                    <p className="font-bold text-sm text-amber-900">
                      No pre-scheduled slots are configured by this advocate.
                    </p>
                    <p className="text-amber-800">
                      You can still submit a consultation request! Propose your preferred date and time, or request flexible consultation timing below.
                    </p>
                    <p className="text-amber-900 font-semibold pt-1">
                      ⚠️ Note: Requested preferred times require advocate confirmation before becoming active appointments.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Preferred Consultation Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={preferredDate}
                      disabled={isFlexibleTime}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        setBookingError("");
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#2457D6] disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={preferredTime}
                      disabled={isFlexibleTime}
                      onChange={(e) => {
                        setPreferredTime(e.target.value);
                        setBookingError("");
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#2457D6] disabled:bg-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isFlexibleTime}
                        onChange={(e) => {
                          setIsFlexibleTime(e.target.checked);
                          setBookingError("");
                        }}
                        className="h-4 w-4 rounded text-[#2457D6]"
                      />
                      <span>I am flexible with consultation timing (Advocate will propose a confirmed slot).</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* SECTION I: CLIENT REVIEWS AND RATINGS */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-[#D9A441] text-[#D9A441]" />
                  Client Reviews & Verified Ratings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Genuine ratings from clients who completed legal consultations with this advocate.
                </p>
              </div>

              <div className="flex items-baseline gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <span className="font-heading text-2xl font-black text-amber-900">
                  {reviewStats.average}
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  / 5.0 ({reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            {reviewsLoading && (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading verified client reviews...
              </div>
            )}

            {!reviewsLoading && reviewStats.reviews.length === 0 && (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2457D6]">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="font-heading text-sm font-bold text-slate-800">No client reviews yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first verified client to consult with Advocate {name} and leave official feedback.
                </p>
              </div>
            )}

            {!reviewsLoading && reviewStats.reviews.length > 0 && (
              <div className="mt-6 space-y-4">
                {reviewStats.reviews.map((rev) => {
                  const clientName = rev.client?.name || "Verified Client";
                  const initial = clientName.charAt(0).toUpperCase();
                  const reviewDate = rev.createdAt ? formatDate(rev.createdAt) : "Recently";
                  const rating = Number(rev.rating) || 5;

                  return (
                    <div
                      key={rev._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B132B] text-white font-bold text-xs shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs">
                              {clientName}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= rating
                                        ? "fill-[#D9A441] text-[#D9A441]"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </span>
                              <span className="text-[11px] text-slate-400">• {reviewDate}</span>
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Verified Client Consultation
                        </span>
                      </div>

                      {rev.reviewText && (
                        <p className="text-xs text-slate-700 leading-relaxed pt-1">
                          {rev.reviewText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </div>

        {/* RIGHT SIDEBAR: BOOKING ACTION & SELECTION SUMMARY */}
        <aside className="space-y-6">
          <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Consultation Fee
              </span>
              <span className="font-heading text-3xl font-extrabold text-[#0B132B] block">
                {feeText}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Fixed 30-min consultation rate as listed by the advocate.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Consultation Selection
              </h4>

              {selectedSlotData ? (
                <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-200/80 space-y-1 text-xs">
                  <span className="font-bold text-[#0B132B] block">Confirmed Slot Selected:</span>
                  <p className="text-[#2457D6] font-semibold">{formatDateTime(selectedSlotData.startAt)}</p>
                  <p className="text-slate-500 text-[11px]">Until {formatDateTime(selectedSlotData.endAt)}</p>
                </div>
              ) : preferredDate || isFlexibleTime ? (
                <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200/80 space-y-1 text-xs">
                  <span className="font-bold text-amber-950 block">Requested Preferred Time:</span>
                  <p className="text-amber-900 font-semibold">
                    {isFlexibleTime ? "Flexible consultation window" : `${preferredDate} ${preferredTime ? `@ ${preferredTime}` : ""}`}
                  </p>
                  <p className="text-amber-700 text-[11px]">Requires advocate confirmation</p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500">
                  Select a slot or propose a preferred time to book.
                </div>
              )}
            </div>

            {bookingError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Main CTA: Book Consultation */}
            <button
              type="button"
              onClick={handleBookConsultation}
              disabled={checkingEligibility}
              className="w-full rounded-xl bg-[#2457D6] py-3.5 px-4 text-xs font-bold uppercase tracking-wide text-white shadow-2xs hover:bg-blue-700 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2457D6] focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <span>{checkingEligibility ? "Verifying Eligibility..." : "Book Consultation"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-[11px] text-slate-500 space-y-1.5 pt-1">
              <p className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Advocate verification verified with Bar Council.</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>100% Client Profile completion is required to book.</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
