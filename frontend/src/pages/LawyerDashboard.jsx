import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
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
      reject: "rejected",
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
  // Tab A: Appointment Requests (Pending and Confirmed/Upcoming that require lawyer action or are active)
  const appointmentRequests = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status)
  );

  const filteredRequests = appointmentRequests.filter((a) => {
    if (requestFilter === "pending") return a.status === "pending";
    if (requestFilter === "confirmed") return a.status === "confirmed";
    return true;
  });

  // Tab B: Appointments Completed (Only appointments genuinely marked completed)
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = completedAppointments.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Advocate Practice Hub
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500">
                  LegalConnect Verified Portal
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Lawyer Dashboard
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Manage your consultation requests, review completed cases, and monitor verified client reviews.
              </p>
            </div>

            {/* Quick Actions & Profile Header Widget */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/lawyer/edit-profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition"
                title="Edit Complete Professional Profile"
              >
                <Edit className="h-4 w-4 text-blue-700" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/lawyer/availability"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-900 shadow-2xs hover:bg-blue-100 transition"
                title="Manage 30-Minute Consultation Slots"
              >
                <Clock className="h-4 w-4 text-blue-700" />
                <span>Availability Slots</span>
              </Link>

              {lawyerProfile?._id && (
                <a
                  href={`/lawyers/${lawyerProfile._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
                  title="View live public directory profile"
                >
                  <Eye className="h-4 w-4" />
                  <span>Public View</span>
                </a>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-xs font-semibold text-green-800 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Top Metrics Row */}
          <section className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div
              onClick={() => {
                handleTabChange("requests");
                setRequestFilter("pending");
              }}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-sm transition"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Action Required (Pending)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600">
                {pendingCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Consultation requests</p>
            </div>

            <div
              onClick={() => {
                handleTabChange("requests");
                setRequestFilter("confirmed");
              }}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Upcoming & Confirmed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-700">
                {confirmedCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Scheduled sessions</p>
            </div>

            <div
              onClick={() => handleTabChange("completed")}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-400 hover:shadow-sm transition"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Completed Consultations
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                {completedCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Archived cases</p>
            </div>

            <div
              onClick={() => handleTabChange("reviews")}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-sm transition"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Client Rating
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">
                  {lawyerProfile?.averageRating > 0
                    ? lawyerProfile.averageRating.toFixed(1)
                    : "5.0"}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / 5.0 ({reviewsData.length} reviews)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Verified client feedback</p>
            </div>
          </section>

          {/* ================= EXACTLY THREE MAIN TABS NAVIGATION ================= */}
          <div className="mt-8 border-b border-slate-200">
            <nav className="flex flex-wrap gap-2 pb-3" aria-label="Dashboard Tabs">
              {/* TAB 1: Appointment Requests */}
              <button
                type="button"
                onClick={() => handleTabChange("requests")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                  activeTab === "requests"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Appointment Requests</span>
                {appointmentRequests.length > 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeTab === "requests"
                        ? "bg-blue-800 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {appointmentRequests.length}
                  </span>
                )}
              </button>

              {/* TAB 2: Appointments Completed */}
              <button
                type="button"
                onClick={() => handleTabChange("completed")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                  activeTab === "completed"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Appointments Completed</span>
                {completedCount > 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeTab === "completed"
                        ? "bg-blue-800 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {completedCount}
                  </span>
                )}
              </button>

              {/* TAB 3: Client Reviews */}
              <button
                type="button"
                onClick={() => handleTabChange("reviews")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                  activeTab === "reviews"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Client Reviews</span>
                {reviewsData.length > 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeTab === "reviews"
                        ? "bg-blue-800 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {reviewsData.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: APPOINTMENT REQUESTS                                              */}
          {/* ========================================================================= */}
          {activeTab === "requests" && (
            <section className="mt-6 space-y-6 animate-in fade-in duration-200">
              {/* Sub-header & Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Active Appointment Requests
                  </h2>
                  <p className="text-xs text-slate-500">
                    Consultations awaiting confirmation or scheduled for upcoming sessions.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestFilter("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      requestFilter === "all"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({appointmentRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
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
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      requestFilter === "confirmed"
                        ? "bg-blue-700 text-white"
                        : "text-slate-600 hover:text-blue-700"
                    }`}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  Loading appointment requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <Inbox className="mx-auto h-9 w-9 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-800">
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                    >
                      <Clock className="h-4 w-4" />
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
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                      >
                        {/* Top Card Bar: Avatar, Clickable Name, Meta Badges */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Clickable Client Avatar */}
                            <button
                              type="button"
                              onClick={() => setSelectedClientId(client._id)}
                              className="group relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-lg font-bold text-white shadow-xs transition hover:scale-105 focus:outline-none"
                              title="Click to view verified client profile"
                            >
                              {client.profileImage ? (
                                <img
                                  src={client.profileImage}
                                  alt={client.name}
                                  className="h-full w-full rounded-2xl object-cover"
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
                                className="text-left text-lg font-bold text-slate-900 hover:text-blue-900 hover:underline transition flex items-center gap-1.5 group"
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
                              {isVideo ? <Video className="h-3.5 w-3.5 text-blue-700" /> : null}
                              {appointment.consultationType} Consultation
                            </span>

                            {appointment.isPaid ? (
                              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
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
                        {/* | Date | Time | Status | Actions | */}
                        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-xs">
                            {/* 1. Date */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Date
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
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
                                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                                  >
                                    {processingId === appointment._id ? "..." : "Accept"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAction(appointment._id, "reject")}
                                    disabled={processingId === appointment._id}
                                    className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}

                              {appointment.status === "confirmed" && (
                                <div className="flex sm:justify-end items-center gap-2">
                                  {canJoinVideo ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/video-room/${appointment._id}`)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      Join Call
                                    </button>
                                  ) : null}

                                  <button
                                    type="button"
                                    onClick={() => handleAction(appointment._id, "complete")}
                                    disabled={processingId === appointment._id}
                                    className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition disabled:opacity-50"
                                  >
                                    Complete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Client Consultation Note / Issue */}
                        {appointment.notes && (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
                            <span className="font-bold text-slate-700">Client Case Note: </span>
                            <span className="text-slate-600">{appointment.notes}</span>
                          </div>
                        )}

                        {/* Card Secondary Actions Bar: Chat, Case Documents */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition"
                            >
                              <MessageSquare className="h-4 w-4 text-blue-700" />
                              Chat
                            </button>

                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition"
                            >
                              <FileText className="h-4 w-4 text-blue-700" />
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
            <section className="mt-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Appointments Completed ({completedAppointments.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Concluded legal consultations. Access full session summaries, verified client feedback, and uploaded case files.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadAppointments}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  Loading completed consultations...
                </div>
              ) : completedAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-800">
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
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                      >
                        {/* Header info */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Clickable Client Avatar */}
                            <button
                              type="button"
                              onClick={() => setSelectedClientId(client._id)}
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition focus:outline-none"
                              title="Click to view verified client profile"
                            >
                              {client.profileImage ? (
                                <img
                                  src={client.profileImage}
                                  alt={client.name}
                                  className="h-full w-full rounded-2xl object-cover"
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
                                className="text-left text-lg font-bold text-slate-900 hover:text-blue-900 hover:underline transition flex items-center gap-1.5"
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
                            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                              Fee Paid
                            </span>

                            <span className="rounded-full bg-green-100 border border-green-200 px-3 py-1 text-xs font-bold text-green-800 capitalize">
                              ✓ Completed
                            </span>
                          </div>
                        </div>

                        {/* Session Date & Time Row */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-50/70 p-4 border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Concluded Date
                            </span>
                            <span className="font-bold text-slate-900">
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
                              {isVideo ? <Video className="h-3.5 w-3.5 text-blue-700" /> : null}
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
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition"
                            >
                              <FileText className="h-4 w-4 text-blue-700" />
                              Summary
                            </button>

                            {/* Client Feedback / Review Button */}
                            <button
                              type="button"
                              onClick={() => setFeedbackAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                            >
                              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                              {appointment.review ? "Client Feedback (★)" : "Client Feedback"}
                            </button>

                            {/* Case Documents Button */}
                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition"
                            >
                              <FileText className="h-4 w-4 text-slate-500" />
                              Case Documents
                            </button>

                            {/* Chat Button */}
                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition"
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
            <section className="mt-6 space-y-6 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                {/* Reviews Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Client Reviews & Testimonials
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ratings submitted by clients following completed legal consultation sessions.
                    </p>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">
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
                    Loading verified reviews...
                  </div>
                ) : reviewsData.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Star className="mx-auto h-8 w-8 text-slate-300" />
                    <h3 className="text-sm font-bold text-slate-800">No Client Reviews Yet</h3>
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
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900 text-xs font-bold text-white">
                                {client.name ? client.name.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">
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
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 bg-blue-50/70 px-3 py-1 rounded-xl w-fit">
                              <CalendarCheck className="h-3.5 w-3.5 text-blue-700" />
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
