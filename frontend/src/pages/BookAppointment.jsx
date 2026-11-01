import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Sparkles,
  Upload,
  FileText,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Star,
  Home,
  Check
} from "lucide-react";
import { bookAppointment } from "../services/appointmentService";
import { getLawyerById } from "../services/lawyerService";
import { getAvailableSlots } from "../services/availabilityService";
import { getBookingEligibility } from "../services/authService";
import { uploadDocument } from "../services/documentService";

function formatDateTime(value) {
  if (!value) return "Time not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BookAppointment() {
  const navigate = useNavigate();

  const [selection, setSelection] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  // Consultation configuration
  const [consultationType, setConsultationType] = useState("video"); // 'chat', 'video', 'both'
  const [notes, setNotes] = useState("");

  // Preferred time state (if no slot or client chooses custom)
  const [usePreferredTime, setUsePreferredTime] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [isFlexibleTime, setIsFlexibleTime] = useState(false);

  // Document attachments state
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Flow states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBookingDetails() {
      try {
        const saved = sessionStorage.getItem("pendingConsultation");

        if (!saved) {
          if (active) {
            setError("No selected advocate found. Please choose an advocate from the directory.");
            setLoading(false);
          }
          return;
        }

        const parsed = JSON.parse(saved);

        if (!parsed.lawyerId) {
          throw new Error("Invalid booking selection. Please select an advocate first.");
        }

        // 1. Mandatory 100% Client Profile Pre-Check (Requirement 4 & 7)
        const [lawyerData, eligData, slotsData] = await Promise.all([
          getLawyerById(parsed.lawyerId),
          getBookingEligibility().catch(() => null),
          getAvailableSlots(parsed.lawyerId).catch(() => []),
        ]);

        if (!active) return;

        // If client profile is incomplete (< 100%), redirect immediately to My Profile
        if (
          eligData &&
          (!eligData.eligible ||
            eligData.checks?.profilePercentage !== 100 ||
            !eligData.checks?.profileCompleted)
        ) {
          navigate("/client/profile", {
            replace: true,
            state: {
              fromBooking: true,
              lawyerId: parsed.lawyerId,
              lawyerName: lawyerData?.user?.name || "Advocate",
              message:
                "100% profile completion is required before booking an advocate consultation. Please fill in the remaining profile fields below to proceed.",
            },
          });
          return;
        }

        setSelection(parsed);
        setLawyer(lawyerData);
        setAvailableSlots(Array.isArray(slotsData) ? slotsData : []);

        if (parsed.slotId) {
          setSelectedSlotId(parsed.slotId);
        } else if (parsed.preferredDate || parsed.isFlexibleTime) {
          setUsePreferredTime(true);
          setPreferredDate(parsed.preferredDate || "");
          setPreferredTime(parsed.preferredTime || "");
          setIsFlexibleTime(Boolean(parsed.isFlexibleTime));
        } else if (Array.isArray(slotsData) && slotsData.length === 0) {
          setUsePreferredTime(true);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load booking details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookingDetails();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Handle selected slot data lookup
  const activeSlot = useMemo(() => {
    return availableSlots.find((s) => s._id === selectedSlotId) || null;
  }, [availableSlots, selectedSlotId]);

  // Lawyer Information Normalization
  const user = lawyer?.user || {};
  const rawName = user.name || lawyer?.name || "Verified Advocate";
  const lawyerName = rawName.startsWith("Adv.") || rawName.startsWith("Advocate")
    ? rawName
    : `Advocate ${rawName}`;
  const profileImage = user.profileImage || lawyer?.profileImage || null;
  const initials = rawName
    .replace(/^Advocate\s+/i, "")
    .replace(/^Adv\.\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  const experienceYears = Number(lawyer?.experienceYears) || 0;
  const consultationFee = Number(lawyer?.consultationFee);
  const feeText = Number.isFinite(consultationFee) && consultationFee > 0
    ? `₹${consultationFee.toLocaleString("en-IN")}`
    : "Contact for fee";

  const ratingValue = lawyer?.averageRating > 0
    ? Number(lawyer.averageRating).toFixed(1)
    : "5.0";
  const reviewCount = lawyer?.totalReviews || 0;

  const specializations = Array.isArray(lawyer?.specialization)
    ? lawyer.specialization
    : lawyer?.specialization
    ? [lawyer.specialization]
    : [];

  // File Attachment Handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the 15MB limit.`);
        continue;
      }
      validFiles.push(f);
    }
    setAttachedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = ""; // Reset input
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission Handler
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validate date/time selection
    if (!usePreferredTime && !selectedSlotId) {
      setError("Please select an available appointment time slot.");
      return;
    }

    if (usePreferredTime && !preferredDate && !isFlexibleTime) {
      setError("Please choose a preferred consultation date or check flexible timing.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        consultationType,
        notes: notes.trim(),
      };

      if (!usePreferredTime && selectedSlotId) {
        payload.slotId = selectedSlotId;
      } else {
        payload.lawyerId = lawyer._id;
        payload.isPreferredTime = true;
        payload.isFlexibleTime = isFlexibleTime;
        payload.preferredDate = preferredDate;
        payload.preferredTime = preferredTime;
      }

      // Backend appointment booking with independent 100% eligibility check
      const result = await bookAppointment(payload);
      const appointment = result.appointment;

      if (!appointment || !appointment._id) {
        throw new Error("Backend did not confirm appointment creation.");
      }

      // Upload attached documents if any
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("appointmentId", appointment._id);
            formData.append("title", file.name);
            await uploadDocument(formData);
          } catch {
            // Silently continue if single file upload encounters issue
          }
        }
      }

      // Clean session storage
      sessionStorage.removeItem("pendingConsultation");

      // Set confirmed state to display Success Page (Requirement 6)
      setConfirmedBooking({
        appointment,
        lawyerName,
        consultationType,
        consultationFee: feeText,
        scheduledAt: appointment.scheduledAt,
        isPreferredTime: appointment.isPreferredTime,
        isFlexibleTime: appointment.isFlexibleTime,
        preferredDate: appointment.preferredDate,
        preferredTime: appointment.preferredTime,
        status: appointment.status || "pending",
      });
    } catch (err) {
      if (err.data?.code === "BOOKING_INELIGIBLE" || err.data?.eligibility) {
        navigate("/client/profile", {
          state: {
            fromBooking: true,
            lawyerId: lawyer._id,
            lawyerName,
            message:
              "100% profile completion is required before booking an advocate consultation. Please complete the remaining fields below.",
          },
        });
      } else {
        setError(err.message || "Failed to book appointment. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================================
  // REQUIREMENT 6: BOOKING SUCCESS PAGE
  // Appears ONLY after backend confirmation of appointment creation
  // =========================================================================
  if (confirmedBooking) {
    const apt = confirmedBooking.appointment;
    const isPreferred = confirmedBooking.isPreferredTime;
    const typeLabel =
      confirmedBooking.consultationType === "video"
        ? "Video Consultation"
        : confirmedBooking.consultationType === "chat"
        ? "Chat Consultation"
        : "Both Chat & Video Consultation";

    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
        <div className="w-full max-w-2xl space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            {/* Header Success Celebration */}
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 sm:p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

              {/* Success Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 mb-5 animate-bounce">
                <Check className="h-10 w-10 stroke-[3]" />
              </div>

              <span className="inline-block rounded-full bg-emerald-400/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 mb-3">
                Booking Request Submitted
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Your consultation request has been submitted successfully.
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                {isPreferred
                  ? "Your preferred consultation request has been sent to the advocate for schedule confirmation."
                  : "Your appointment slot has been reserved and is awaiting final advocate confirmation."}
              </p>
            </div>

            {/* Appointment Details Card */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Appointment Reference ID
                  </span>
                  <span className="font-mono text-sm font-extrabold text-blue-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    #APT-{apt._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      Advocate Name
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {confirmedBooking.lawyerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      Consultation Type
                    </span>
                    <span className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                      {confirmedBooking.consultationType === "chat" ? (
                        <MessageSquare className="h-4 w-4 text-blue-700" />
                      ) : (
                        <Video className="h-4 w-4 text-blue-700" />
                      )}
                      {typeLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      Consultation Fee
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {confirmedBooking.consultationFee}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      Appointment Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Pending Advocate Confirmation
                    </span>
                  </div>
                </div>

                {/* Date & Time with Preferred Notice */}
                <div className="pt-3 border-t border-slate-200/80">
                  <span className="text-xs font-bold text-slate-500 block mb-1">
                    Scheduled Consultation Time:
                  </span>
                  <div className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-1">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-900" />
                      {confirmedBooking.scheduledAt
                        ? formatDateTime(confirmedBooking.scheduledAt)
                        : `${confirmedBooking.preferredDate || "Selected Date"} (${confirmedBooking.preferredTime || "Flexible Window"})`}
                    </p>

                    {isPreferred && (
                      <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 pt-1">
                        ⚠️ Pending Advocate Confirmation: You requested a preferred time. The advocate will review and confirm this window.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Back to Home & View My Appointments */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/my-appointments")}
                  className="w-full sm:flex-1 rounded-2xl bg-blue-900 py-3.5 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  View My Appointments
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto rounded-2xl border border-slate-300 py-3.5 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Loading State
  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">
            Verifying profile eligibility and loading booking details...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb Back Link */}
        <Link
          to={lawyer?._id ? `/lawyers/${lawyer._id}` : "/lawyers"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition"
        >
          ← Back to Advocate Profile
        </Link>

        {/* Page Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-0.5">
            LegalConnect Consultations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Book Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review the consultation details, select your consultation mode, and confirm your appointment.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{error}</p>
              {!selection && (
                <Link to="/lawyers" className="mt-1 inline-block font-bold underline">
                  Return to Available Advocates
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================================= */}
          {/* SECTION A: CONSULTATION FEE                                               */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Section A • Consultation Fee
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Advocate Consultation Fee
              </h2>
              <p className="text-xs text-slate-500">
                Standard fee set by the advocate for this 30-minute consultation.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-900 block">
                {feeText}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                Flat consultation rate
              </span>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION B: BOOKING SUMMARY                                                */}
          {/* Photo, Name, Experience, Rating & reviews, Specialization, Fee, Time      */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Section B • Booking Summary
            </span>

            <div className="flex flex-col sm:flex-row sm:items-start gap-5 pt-1">
              {/* Profile Image */}
              <div className="relative shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={lawyerName}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white font-extrabold text-2xl shadow-xs">
                    {initials}
                  </div>
                )}
                {lawyer?.verificationStatus === "approved" && (
                  <span
                    className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-xs"
                    title="Verified Advocate"
                  >
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {lawyerName}
                  </h3>
                  {lawyer?.verificationStatus === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    {ratingValue} ({reviewCount})
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {experienceYears} {experienceYears === 1 ? "year" : "years"} of legal experience • {[lawyer?.city, lawyer?.state].filter(Boolean).join(", ") || "India"}
                </p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specializations.slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-100"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Selected Time Preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Selected Schedule:</span>{" "}
                  <strong className="text-blue-900 font-bold">
                    {activeSlot
                      ? formatDateTime(activeSlot.startAt)
                      : usePreferredTime
                      ? isFlexibleTime
                        ? "Flexible Consultation Window (Pending Advocate Confirmation)"
                        : `${preferredDate || "Date TBD"} ${preferredTime ? `@ ${preferredTime}` : ""} (Pending Advocate Confirmation)`
                      : "No slot selected yet"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION C: SELECT CONSULTATION TYPE                                       */}
          {/* Chat, Video, Both Chat and Video                                          */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Section C • Consultation Mode
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Select Consultation Type
              </h2>
              <p className="text-xs text-slate-500">
                Choose how you want to conduct your legal consultation with the advocate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Chat Consultation */}
              <button
                type="button"
                onClick={() => setConsultationType("chat")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  consultationType === "chat"
                    ? "border-blue-900 bg-blue-50 ring-2 ring-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-900 font-bold">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      consultationType === "chat"
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {consultationType === "chat" && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Chat Consultation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Private instant messaging with file attachment capabilities.
                </p>
              </button>

              {/* Option 2: Video Consultation */}
              <button
                type="button"
                onClick={() => setConsultationType("video")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  consultationType === "video"
                    ? "border-blue-900 bg-blue-50 ring-2 ring-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900 font-bold">
                    <Video className="h-5 w-5" />
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      consultationType === "video"
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {consultationType === "video" && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Video Consultation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Live encrypted 1-on-1 WebRTC video call with device preview.
                </p>
              </button>

              {/* Option 3: Both Chat and Video */}
              <button
                type="button"
                onClick={() => setConsultationType("both")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  consultationType === "both"
                    ? "border-blue-900 bg-blue-50 ring-2 ring-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-900 font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      consultationType === "both"
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {consultationType === "both" && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Both Chat & Video</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full access to both live video room and ongoing chat messaging.
                </p>
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION D: DATE AND TIME                                                  */}
          {/* Available slots OR Propose preferred time                                 */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Section D • Date & Time
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Appointment Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Select a confirmed slot or propose a preferred consultation time.
                </p>
              </div>

              {availableSlots.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUsePreferredTime(false);
                      setError("");
                    }}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      !usePreferredTime
                        ? "bg-blue-900 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Configured Slots ({availableSlots.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsePreferredTime(true);
                      setSelectedSlotId("");
                      setError("");
                    }}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      usePreferredTime
                        ? "bg-blue-900 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Propose Custom Time
                  </button>
                </div>
              )}
            </div>

            {/* Sub-view 1: Available Slots configured by lawyer */}
            {!usePreferredTime && availableSlots.length > 0 && (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold text-slate-600">
                  Click a slot to select it:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot._id;
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot._id);
                          setError("");
                        }}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-blue-900 bg-blue-50 ring-2 ring-blue-900 shadow-xs"
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
                          className={`mt-2 block text-[11px] font-bold ${
                            isSelected ? "text-blue-900" : "text-emerald-700"
                          }`}
                        >
                          {isSelected ? "✓ Selected" : "Select Slot"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-view 2: Preferred Time Form */}
            {(usePreferredTime || availableSlots.length === 0) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-1">
                    <p className="font-bold text-sm text-amber-900">
                      {availableSlots.length === 0
                        ? "No fixed slots configured by this advocate."
                        : "Propose a preferred consultation schedule."}
                    </p>
                    <p className="text-amber-800">
                      Propose a date and time that fits your availability, or select flexible timing.
                    </p>
                    <p className="text-amber-900 font-semibold pt-1">
                      ⚠️ Note: Unconfirmed requested times require advocate confirmation before becoming active appointments.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={preferredDate}
                      disabled={isFlexibleTime}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={preferredTime}
                      disabled={isFlexibleTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-900 disabled:bg-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isFlexibleTime}
                        onChange={(e) => setIsFlexibleTime(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-900"
                      />
                      <span>Flexible consultation time (Advocate will propose a confirmed slot).</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* SECTION E: UPLOAD DOCUMENTS (OPTIONAL)                                    */}
          {/* Reusing existing secure document upload functionality                      */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Section E • Case Documents (Optional)
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Upload Relevant Legal Documents
              </h2>
              <p className="text-xs text-slate-500">
                Share relevant agreements, notices, plaints, or case papers with the advocate prior to consultation.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-600 transition bg-slate-50/50">
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <label className="cursor-pointer">
                <span className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition inline-block">
                  Choose Files to Upload
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 15MB each)
              </p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700">
                  Files ready to attach ({attachedFiles.length}):
                </span>
                <div className="space-y-1.5">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-100 px-3.5 py-2 text-xs border border-slate-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-blue-900 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* SECTION F: DESCRIBE YOUR LEGAL ISSUE (OPTIONAL)                           */}
          {/* Textarea for brief explanation                                             */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Section F • Case Background (Optional)
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Describe Your Legal Issue
              </h2>
              <p className="text-xs text-slate-500">
                Provide a brief summary of your legal matter so the advocate can prepare in advance.
              </p>
            </div>

            <div>
              <textarea
                rows={4}
                value={notes}
                maxLength={1000}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your legal issue, key facts, court history (if any), and specific questions for the advocate..."
                className="w-full rounded-2xl border border-slate-300 p-4 text-xs text-slate-800 leading-relaxed outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Safe and confidential. Protected by advocate–client privilege.</span>
                <span>{notes.length} / 1000</span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION G: CONFIRM APPOINTMENT                                            */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Section G • Confirmation
            </span>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span>Advocate:</span>
                <strong className="text-slate-900 font-bold">{lawyerName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Mode:</span>
                <strong className="text-blue-900 font-bold uppercase">
                  {consultationType} consultation
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Consultation Fee:</span>
                <strong className="text-slate-900 font-extrabold text-sm">{feeText}</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-900 py-4 px-6 text-sm font-bold text-white shadow-lg hover:bg-blue-800 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{submitting ? "Submitting Booking Request..." : "Confirm Appointment"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              Your appointment request will be securely created and assigned to Advocate {lawyerName}.
              You will be able to review receipts and manage consultation links in My Appointments.
            </p>
          </section>
        </form>
      </div>
    </main>
  );
}
