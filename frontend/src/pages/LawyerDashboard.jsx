import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";
import {
  getLawyerAppointments,
  confirmLawyerAppointment,
  rejectLawyerAppointment,
  completeLawyerAppointment,
} from "../services/lawyerAppointmentService";
import {
  getMyEarnings,
  getMyLawyerProfile,
} from "../services/lawyerService";
import { getLawyerReviews } from "../services/reviewService";
import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import DocumentModal from "../components/DocumentModal";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import ClientDetailModal from "../components/ClientDetailModal";
import AppointmentSummaryModal from "../components/AppointmentSummaryModal";
import ClientFeedbackModal from "../components/ClientFeedbackModal";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  UserCheck,
  Scale,
  Eye,
  User,
  CreditCard,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Inbox,
  CheckCircle2,
  CalendarCheck,
  Briefcase,
  ShieldCheck,
  Camera,
  Loader2,
  Sparkles,
  MapPin,
  Award,
  DollarSign,
  PhoneCall,
  Users,
} from "lucide-react";

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-blue-50 text-royal border-blue-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
};

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Tabs: EXACTLY THREE MAIN TABS
  // 1. "requests" (Appointment Requests)
  // 2. "completed" (Appointments Completed)
  // 3. "reviews" (Client Reviews)
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "completed" || tabParam === "reviews" ? tabParam : "requests";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sub-filter for requests tab
  const [requestFilter, setRequestFilter] = useState("all"); // "all" | "pending" | "confirmed"

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  // Earnings summary
  const [earningsData, setEarningsData] = useState(null);

  // Reviews
  const [reviewsData, setReviewsData] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Lawyer Profile
  const [lawyerProfile, setLawyerProfile] = useState(null);

  // Profile image upload state
  const { updateUser } = useAuth();
  const lawyerFileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

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
        setLawyerProfile((prev) => {
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

  // Modals state
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [summaryAppointment, setSummaryAppointment] = useState(null);
  const [feedbackAppointment, setFeedbackAppointment] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const loadAppointments = useCallback(async () => {
    try {
      setError("");
      const result = await getLawyerAppointments();
      setAppointments(result.appointments || []);
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEarnings = useCallback(async () => {
    try {
      const data = await getMyEarnings();
      setEarningsData(data);
    } catch (err) {
      console.error("Earnings load error:", err);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMyLawyerProfile();
      setLawyerProfile(profile);

      // Load real reviews for this lawyer
      if (profile._id) {
        setReviewsLoading(true);
        try {
          const revRes = await getLawyerReviews(profile._id);
          setReviewsData(revRes.reviews || []);
        } catch (rErr) {
          console.error("Reviews load error:", rErr);
        } finally {
          setReviewsLoading(false);
        }
      }
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadEarnings();
    loadProfile();
  }, [loadAppointments, loadEarnings, loadProfile]);

  const handleAction = async (appointmentId, action) => {
    const labels = {
      confirm: "accepted",
      reject: "declined",
      complete: "marked as completed",
    };

    if (
      action === "reject" &&
      !window.confirm("Are you sure you want to decline this appointment request?")
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setProcessingId(appointmentId);

      let result;
      if (action === "confirm") {
        result = await confirmLawyerAppointment(appointmentId);
      } else if (action === "reject") {
        result = await rejectLawyerAppointment(appointmentId);
      } else {
        result = await completeLawyerAppointment(appointmentId);
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                ...result.appointment,
                client:
                  result.appointment?.client &&
                  typeof result.appointment.client === "object"
                    ? result.appointment.client
                    : appointment.client,
              }
            : appointment
        )
      );

      setMessage(
        result.message || `Appointment ${labels[action]} successfully.`
      );
      loadEarnings();
    } catch (err) {
      setError(err.message || "Unable to update appointment.");
    } finally {
      setProcessingId("");
    }
  };

  // Helper date & time formatters
  const formatDateOnly = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });

  const formatTimeRange = (startDate, durationMinutes = 30) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const startStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${startStr} – ${endStr}`;
  };

  // Categorize appointments strictly according to business logic
  const appointmentRequests = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status)
  );

  const filteredRequests = appointmentRequests.filter((a) => {
    if (requestFilter === "pending") return a.status === "pending";
    if (requestFilter === "confirmed") return a.status === "confirmed";
    return true;
  });

  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = completedAppointments.length;

  // Profile completeness calculation
  const calculateCompleteness = (profile) => {
    if (!profile) return 0;
    let score = 0;
    if (profile.user?.name || profile.name) score += 10;
    if (profile.headline || profile.designation) score += 10;
    if (profile.city) score += 10;
    if (profile.bio && profile.bio.trim().length >= 50) score += 20;
    if (Array.isArray(profile.education) && profile.education.length > 0) score += 15;
    if (
      (Array.isArray(profile.specialization) && profile.specialization.length > 0) ||
      (typeof profile.specialization === "string" && profile.specialization)
    ) {
      score += 15;
    }
    if (
      profile.consultationFee !== undefined &&
      profile.consultationFee !== null &&
      profile.consultationFee > 0
    ) {
      score += 10;
    }
    if (
      (Array.isArray(profile.experiences) && profile.experiences.length > 0) ||
      profile.barCouncilId
    ) {
      score += 10;
    }
    return Math.min(100, score);
  };

  const completenessPercentage = calculateCompleteness(lawyerProfile);

  const lawyerName = lawyerProfile?.user?.name || "Advocate";
  const initials = lawyerName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVerified =
    lawyerProfile?.verificationStatus === "approved" ||
    lawyerProfile?.verificationStatus === "verified";

  const headline =
    lawyerProfile?.headline ||
    `${lawyerProfile?.designation || "Advocate"} | ${
      Array.isArray(lawyerProfile?.specialization)
        ? lawyerProfile.specialization.join(", ")
        : lawyerProfile?.specialization || "Legal Counsel"
    }`;

  const specializationText = Array.isArray(lawyerProfile?.specialization)
    ? lawyerProfile.specialization.join(", ")
    : lawyerProfile?.specialization || "General Practice";

  const experienceText = `${lawyerProfile?.experienceYears || 0} yrs`;
  const feesText = lawyerProfile?.consultationFee || 0;
  const barRegText = lawyerProfile?.barCouncilId || "N/A";

  const ratingValue =
    lawyerProfile?.averageRating > 0
      ? lawyerProfile.averageRating.toFixed(1)
      : reviewsData.length > 0
      ? (
          reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) /
          reviewsData.length
        ).toFixed(1)
      : "5.0";

  const reviewCount = lawyerProfile?.totalReviews || reviewsData.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ========================================================================= */}
          {/* LAWYER PROFILE SUMMARY CARD                                               */}
          {/* ========================================================================= */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="absolute top-0 right-0 h-40 w-72 bg-gradient-to-bl from-blue-50/60 via-indigo-50/20 to-transparent pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Profile Avatar with fallback and verification badge */}
                <div className="relative shrink-0 flex flex-col items-center gap-2">
                  <div className="relative">
                    {lawyerProfile?.user?.profileImage ? (
                      <img
                        src={lawyerProfile.user.profileImage}
                        alt={lawyerName}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-navy via-navy-light to-royal text-white flex items-center justify-center font-heading font-black text-2xl sm:text-3xl border-2 border-slate-200 shadow-xs ${
                        lawyerProfile?.user?.profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {initials}
                    </div>
                    {isVerified && (
                      <div
                        className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-xs"
                        title="Verified Advocate (Bar Council of India Verified)"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Edit Profile Image Button */}
                  <label
                    htmlFor="lawyer-dashboard-photo-input"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        lawyerFileInputRef.current?.click();
                      }
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy bg-slate-50 hover:bg-blue-50 hover:text-royal px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-3 w-3 animate-spin text-royal" />
                    ) : (
                      <Camera className="h-3 w-3 text-slate-500" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Edit Photo"}</span>
                    <input
                      id="lawyer-dashboard-photo-input"
                      ref={lawyerFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  {uploadError && (
                    <span className="text-[10px] font-medium text-rose-600 text-center max-w-[120px]">
                      {uploadError}
                    </span>
                  )}
                  {uploadSuccess && (
                    <span className="text-[10px] font-medium text-emerald-600 text-center max-w-[120px]">
                      {uploadSuccess}
                    </span>
                  )}
                </div>

                {/* Profile Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-navy tracking-tight">
                      {lawyerName}
                    </h1>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        BCI Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" />
                        Verification Pending
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-royal">
                    {headline}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-slate-400" />
                      <strong className="font-semibold text-slate-800">Specialization:</strong> {specializationText}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <strong className="font-semibold text-slate-800">Exp:</strong> {experienceText}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      <strong className="font-semibold text-slate-800">Fee:</strong> ₹{feesText} / session
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      <strong className="font-semibold text-slate-800">Bar Reg:</strong> {barRegText}
                    </span>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200/80">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ★ {ratingValue} / 5 ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-navy border border-blue-200">
                      <CheckCircle className="h-3.5 w-3.5 text-royal" />
                      Profile: {completenessPercentage}% Complete
                    </span>

                    {lawyerProfile?.city && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {lawyerProfile.city}{lawyerProfile.state ? `, ${lawyerProfile.state}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* KPI STATS CARDS                                                           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Total Appointments */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Sessions
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-royal">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
                  {appointments.length}
                </span>
                <span className="text-xs text-slate-500">all-time</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Scheduled consultations across all modes
              </div>
            </div>

            {/* Stat 2: Active / Pending Requests */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pending Action
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-600">
                  {pendingCount}
                </span>
                <span className="text-xs text-slate-500">requests</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {pendingCount > 0 ? "Awaiting your acceptance" : "No pending booking requests"}
              </div>
            </div>

            {/* Stat 3: Completed Consultations */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Concluded Cases
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-700">
                  {completedCount}
                </span>
                <span className="text-xs text-slate-500">successful</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Completed consultation summaries archived
              </div>
            </div>

            {/* Stat 4: Estimated Earnings */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Consultation Earnings
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
                  ₹{Number(earningsData?.totalEarnings || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> Settled
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Direct client booking settlements
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {searchParams.get("restricted") === "booking" && (
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 text-xs font-semibold text-amber-900 border border-amber-300 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <span>
                  <strong>Advocate Account Notice:</strong> Advocate accounts cannot access client consultation booking. You have been redirected to your Advocate Dashboard.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete("restricted");
                  setSearchParams(next);
                }}
                className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-sm cursor-pointer"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* ================= EXACTLY THREE MAIN TABS NAVIGATION ================= */}
          <div className="border-b border-slate-200">
            <nav className="flex flex-wrap gap-2 pb-3" aria-label="Dashboard Tabs">
              {/* TAB 1: Appointment Requests */}
              <button
                type="button"
                onClick={() => handleTabChange("requests")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-2xs ${
                  activeTab === "requests"
                    ? "bg-navy text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Appointment Requests</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    activeTab === "requests"
                      ? "bg-blue-900/60 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {appointmentRequests.length}
                </span>
              </button>

              {/* TAB 2: Appointments Completed */}
              <button
                type="button"
                onClick={() => handleTabChange("completed")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-2xs ${
                  activeTab === "completed"
                    ? "bg-navy text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Appointments Completed</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    activeTab === "completed"
                      ? "bg-blue-900/60 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {completedCount}
                </span>
              </button>

              {/* TAB 3: Client Reviews */}
              <button
                type="button"
                onClick={() => handleTabChange("reviews")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-2xs ${
                  activeTab === "reviews"
                    ? "bg-navy text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span>Client Reviews</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    activeTab === "reviews"
                      ? "bg-blue-900/60 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {reviewsData.length}
                </span>
              </button>
            </nav>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: APPOINTMENT REQUESTS                                              */}
          {/* ========================================================================= */}
          {activeTab === "requests" && (
            <section className="mt-6 space-y-6">
              {/* Sub-header & Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-navy">
                    Active Appointment Requests
                  </h2>
                  <p className="text-xs text-slate-500">
                    Consultations awaiting confirmation or scheduled for upcoming sessions.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      requestFilter === "all"
                        ? "bg-navy text-white"
                        : "text-slate-600 hover:text-navy"
                    }`}
                  >
                    All ({appointmentRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("pending")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      requestFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "text-slate-600 hover:text-amber-700"
                    }`}
                  >
                    Pending Approval ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("confirmed")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      requestFilter === "confirmed"
                        ? "bg-royal text-white"
                        : "text-slate-600 hover:text-royal"
                    }`}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-royal mb-2" />
                  Loading appointment requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-3 text-base font-heading font-bold text-navy">
                    No Appointment Requests Matching Filter
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {requestFilter === "pending"
                      ? "You have no pending consultation requests awaiting confirmation."
                      : "No active consultation requests scheduled at this time. Ensure you have added availability slots."}
                  </p>
                  <div className="mt-5">
                    <Link
                      to="/lawyer/availability"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-light transition shadow-xs"
                    >
                      <Clock className="h-4 w-4 text-gold" />
                      Add Consultation Slots
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((appointment) => {
                    const client = appointment.client || {};
                    const isVideo = appointment.consultationType === "video";
                    const canJoinVideo = isVideo && appointment.status === "confirmed";

                    return (
                      <article
                        key={appointment._id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                      >
                        {/* Top Card Bar: Avatar, Clickable Name, Meta Badges */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Clickable Client Avatar */}
                            <button
                              type="button"
                              onClick={() => setSelectedClientId(client._id)}
                              className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-navy to-royal text-base font-bold text-white shadow-2xs transition hover:scale-105 focus:outline-none"
                              title="Click to view verified client profile"
                            >
                              {client.profileImage ? (
                                <img
                                  src={client.profileImage}
                                  alt={client.name}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                              ) : client.name ? (
                                client.name.charAt(0).toUpperCase()
                              ) : (
                                "C"
                              )}
                            </button>

                            <div>
                              {/* Clickable Client Name */}
                              <button
                                type="button"
                                onClick={() => setSelectedClientId(client._id)}
                                className="text-left text-base font-heading font-bold text-navy hover:text-royal hover:underline transition flex items-center gap-1.5 group"
                              >
                                <span>{client.name || "Client Name"}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                              </button>

                              <p className="text-xs text-slate-500 mt-0.5">
                                {client.email || "Confidential Contact"}
                                {client.phone && ` • ${client.phone}`}
                              </p>
                            </div>
                          </div>

                          {/* Consultation Type & Payment Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                              {isVideo ? <Video className="h-3.5 w-3.5 text-royal" /> : null}
                              {appointment.consultationType} Consultation
                            </span>

                            {appointment.isPaid ? (
                              <span className="rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                                Fee Paid
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                                Fee Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ================= Table-like row within card ================= */}
                        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-xs">
                            {/* 1. Date */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Consultation Date
                              </span>
                              <span className="font-heading font-bold text-navy text-sm">
                                {formatDateOnly(appointment.scheduledAt)}
                              </span>
                            </div>

                            {/* 2. Time */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Time Window
                              </span>
                              <span className="font-semibold text-slate-800">
                                {formatTimeRange(
                                  appointment.scheduledAt,
                                  appointment.durationMinutes || 30
                                )}
                              </span>
                            </div>

                            {/* 3. Status */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Current Status
                              </span>
                              <span
                                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${
                                  statusStyles[appointment.status] || "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {appointment.status === "pending"
                                  ? "Pending Confirmation"
                                  : appointment.status === "confirmed"
                                  ? "Confirmed & Booked"
                                  : appointment.status}
                              </span>
                            </div>

                            {/* 4. Actions (Table column) */}
                            <div className="sm:text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 sm:text-right">
                                Primary Action
                              </span>
                              {appointment.status === "pending" && (
                                <div className="flex sm:justify-end items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAction(appointment._id, "confirm")}
                                    disabled={processingId === appointment._id}
                                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-2xs"
                                  >
                                    {processingId === appointment._id ? "..." : "Accept"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAction(appointment._id, "reject")}
                                    disabled={processingId === appointment._id}
                                    className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 shadow-2xs"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}

                              {appointment.status === "confirmed" && (
                                <div className="flex sm:justify-end items-center gap-2">
                                  {canJoinVideo ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/video-room/${appointment._id}`)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-royal px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      Join Call
                                    </button>
                                  ) : null}

                                  <button
                                    type="button"
                                    onClick={() => handleAction(appointment._id, "complete")}
                                    disabled={processingId === appointment._id}
                                    className="rounded-xl bg-navy px-3.5 py-1.5 text-xs font-bold text-white hover:bg-navy-light transition disabled:opacity-50 shadow-2xs"
                                  >
                                    Mark Complete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Client Consultation Note / Issue */}
                        {appointment.notes && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/70 text-xs">
                            <span className="font-bold text-slate-800">Client Case Note: </span>
                            <span className="text-slate-600">{appointment.notes}</span>
                          </div>
                        )}

                        {/* Card Secondary Actions Bar: Chat, Case Documents */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy transition shadow-2xs"
                            >
                              <MessageSquare className="h-4 w-4 text-royal" />
                              Client Chat
                            </button>

                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy transition shadow-2xs"
                            >
                              <FileText className="h-4 w-4 text-royal" />
                              Case Documents
                            </button>
                          </div>

                          <div className="text-xs text-slate-400">
                            Booked on {new Date(appointment.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: APPOINTMENTS COMPLETED                                            */}
          {/* ========================================================================= */}
          {activeTab === "completed" && (
            <section className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-navy">
                    Appointments Completed ({completedAppointments.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Concluded legal consultations. Access full session summaries, verified client feedback, and uploaded case files.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadAppointments}
                  className="text-xs font-semibold text-royal hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-royal mb-2" />
                  Loading completed consultations...
                </div>
              ) : completedAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-3 text-base font-heading font-bold text-navy">
                    No Completed Consultations Yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    When you conclude scheduled consultations, their permanent case record, summaries, client reviews, and documents will be archived here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAppointments.map((appointment) => {
                    const client = appointment.client || {};
                    const isVideo = appointment.consultationType === "video";

                    return (
                      <article
                        key={appointment._id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                      >
                        {/* Header info */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Clickable Client Avatar */}
                            <button
                              type="button"
                              onClick={() => setSelectedClientId(client._id)}
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition focus:outline-none"
                              title="Click to view verified client profile"
                            >
                              {client.profileImage ? (
                                <img
                                  src={client.profileImage}
                                  alt={client.name}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                              ) : client.name ? (
                                client.name.charAt(0).toUpperCase()
                              ) : (
                                "C"
                              )}
                            </button>

                            <div>
                              {/* Clickable Client Name */}
                              <button
                                type="button"
                                onClick={() => setSelectedClientId(client._id)}
                                className="text-left text-base font-heading font-bold text-navy hover:text-royal hover:underline transition flex items-center gap-1.5"
                              >
                                <span>{client.name || "Client Name"}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                              </button>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {client.email || "Confidential Contact"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                              Fee Paid
                            </span>

                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 capitalize">
                              ✓ Completed
                            </span>
                          </div>
                        </div>

                        {/* Session Date & Time Row */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-4 border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Concluded Date
                            </span>
                            <span className="font-heading font-bold text-navy">
                              {formatDateOnly(appointment.scheduledAt)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Scheduled Window
                            </span>
                            <span className="font-semibold text-slate-800">
                              {formatTimeRange(
                                appointment.scheduledAt,
                                appointment.durationMinutes || 30
                              )}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Mode
                            </span>
                            <span className="font-semibold text-slate-800 capitalize flex items-center gap-1">
                              {isVideo ? <Video className="h-3.5 w-3.5 text-royal" /> : null}
                              {appointment.consultationType} ({appointment.durationMinutes || 30}m)
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Summary, Feedback/Review, Case Docs, Chat */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Summary Button */}
                            <button
                              type="button"
                              onClick={() => setSummaryAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-navy transition shadow-2xs"
                            >
                              <FileText className="h-4 w-4 text-royal" />
                              Summary
                            </button>

                            {/* Client Feedback / Review Button */}
                            <button
                              type="button"
                              onClick={() => setFeedbackAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                            >
                              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                              {appointment.review ? "Client Feedback (★)" : "Client Feedback"}
                            </button>

                            {/* Case Documents Button */}
                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy transition shadow-2xs"
                            >
                              <FileText className="h-4 w-4 text-slate-500" />
                              Case Documents
                            </button>

                            {/* Chat Button */}
                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy transition shadow-2xs"
                            >
                              <MessageSquare className="h-4 w-4 text-slate-500" />
                              Chat
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Ref #{appointment._id?.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CLIENT REVIEWS                                                    */}
          {/* ========================================================================= */}
          {activeTab === "reviews" && (
            <section className="mt-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                {/* Reviews Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-navy">
                      Client Reviews & Testimonials
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ratings submitted by clients following completed legal consultation sessions.
                    </p>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50/80 border border-amber-200 px-4 py-2.5">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-2xl font-heading font-extrabold text-navy">
                        {lawyerProfile?.averageRating > 0
                          ? lawyerProfile.averageRating.toFixed(1)
                          : "5.0"}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        / 5 ({reviewsData.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-royal mb-2" />
                    Loading verified reviews...
                  </div>
                ) : reviewsData.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Star className="mx-auto h-8 w-8 text-slate-300" />
                    <h3 className="text-sm font-heading font-bold text-navy">No Client Reviews Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Reviews appear automatically once verified clients conclude consultations and rate their experience.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {reviewsData.map((rev) => {
                      const client = rev.client || {};
                      const appRef = rev.appointment;

                      return (
                        <div
                          key={rev._id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs hover:border-slate-300 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar */}
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-xs font-bold text-white">
                                {client.name ? client.name.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <p className="text-sm font-heading font-bold text-navy">
                                  {client.name || "Verified Client"}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                    dateStyle: "medium",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* 5-Star Rating */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    rev.rating >= s
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Related Appointment Reference */}
                          {appRef && (
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-navy bg-blue-50/70 px-3 py-1 rounded-xl w-fit">
                              <CalendarCheck className="h-3.5 w-3.5 text-royal" />
                              <span>
                                Consultation on{" "}
                                {formatDateOnly(appRef.scheduledAt)} (
                                {appRef.consultationType} session)
                              </span>
                            </div>
                          )}

                          {/* Review Text */}
                          {rev.reviewText && (
                            <p className="mt-3 text-xs text-slate-700 italic leading-relaxed">
                              &ldquo;{rev.reviewText}&rdquo;
                            </p>
                          )}

                          {/* Category breakdown if provided */}
                          {rev.categories && Object.keys(rev.categories).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                              {Object.entries(rev.categories).map(([cat, score]) => (
                                <span
                                  key={cat}
                                  className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-slate-600 capitalize"
                                >
                                  {cat}: <strong className="text-slate-900">{score}/5</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Clickable Client Detail Modal */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          isOpen={!!selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}

      {/* 2. Completed Appointment Summary Modal */}
      {summaryAppointment && (
        <AppointmentSummaryModal
          appointment={summaryAppointment}
          isOpen={!!summaryAppointment}
          onClose={() => setSummaryAppointment(null)}
          onOpenDocuments={(app) => setDocumentAppointment(app)}
          onOpenChat={(app) => setChatAppointment(app)}
        />
      )}

      {/* 3. Client Feedback / Review Modal */}
      {feedbackAppointment && (
        <ClientFeedbackModal
          appointment={feedbackAppointment}
          isOpen={!!feedbackAppointment}
          onClose={() => setFeedbackAppointment(null)}
        />
      )}

      {/* 4. Chat Modal */}
      {chatAppointment && (
        <ChatModal
          appointment={chatAppointment}
          isOpen={!!chatAppointment}
          onClose={() => setChatAppointment(null)}
          onOpenDocuments={() => {
            const current = chatAppointment;
            setChatAppointment(null);
            setDocumentAppointment(current);
          }}
        />
      )}

      {/* 5. Case Documents Modal */}
      {documentAppointment && (
        <DocumentModal
          appointment={documentAppointment}
          isOpen={!!documentAppointment}
          onClose={() => setDocumentAppointment(null)}
        />
      )}

      {/* 6. Profile Settings Modal */}
      {profileModalOpen && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
