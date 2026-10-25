import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getLawyerAppointments,
  confirmLawyerAppointment,
  rejectLawyerAppointment,
  completeLawyerAppointment,
} from "../services/lawyerAppointmentService";
import {
  createAvailabilitySlot,
  getMySlots,
  deleteSlot
} from "../services/availabilityService";
import {
  getMyEarnings,
  getMyLawyerProfile,
  updateLawyerProfile
} from "../services/lawyerService";
import { getLawyerReviews } from "../services/reviewService";
import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import DocumentModal from "../components/DocumentModal";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  PlusCircle,
  Trash2,
  TrendingUp,
  AlertCircle,
  Edit,
  Save,
  UserCheck,
  Scale
} from "lucide-react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function LawyerDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("appointments"); // "appointments" | "slots" | "earnings" | "reviews" | "profile"
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  // Slots state
  const [mySlots, setMySlots] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotCreating, setSlotCreating] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState("");

  // Earnings state
  const [earningsData, setEarningsData] = useState(null);

  // Reviews state
  const [reviewsData, setReviewsData] = useState([]);

  // Profile state
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    city: "",
    consultationFee: 1500,
    experienceYears: 5,
    specialization: "",
  });

  // Modals state
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

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

  const loadSlots = useCallback(async () => {
    try {
      const slots = await getMySlots();
      setMySlots(slots);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadEarnings = useCallback(async () => {
    try {
      const data = await getMyEarnings();
      setEarningsData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMyLawyerProfile();
      setLawyerProfile(profile);
      setEditForm({
        bio: profile.bio || "",
        city: profile.city || "",
        consultationFee: profile.consultationFee || 1000,
        experienceYears: profile.experienceYears || 1,
        specialization: Array.isArray(profile.specialization)
          ? profile.specialization.join(", ")
          : profile.specialization || "",
      });

      // Also load reviews for this lawyer
      if (profile._id) {
        const revRes = await getLawyerReviews(profile._id);
        setReviewsData(revRes.reviews || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadSlots();
    loadEarnings();
    loadProfile();
  }, [loadAppointments, loadSlots, loadEarnings, loadProfile]);

  const handleAction = async (appointmentId, action) => {
    const labels = {
      confirm: "confirm",
      reject: "reject",
      complete: "mark as completed",
    };

    if (
      action === "reject" &&
      !window.confirm("Are you sure you want to reject this appointment?")
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
      // Reload slots and earnings
      loadSlots();
      loadEarnings();
    } catch (err) {
      setError(err.message || "Unable to update appointment.");
    } finally {
      setProcessingId("");
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!slotDate) return;

    const startAtDate = new Date(slotDate);
    if (startAtDate <= new Date()) {
      setError("Slot date and time must be in the future.");
      return;
    }

    try {
      setSlotCreating(true);
      setError("");
      setMessage("");
      await createAvailabilitySlot(startAtDate.toISOString());
      setMessage("30-minute consultation slot created successfully.");
      setSlotDate("");
      await loadSlots();
    } catch (err) {
      setError(err.message || "Failed to create slot.");
    } finally {
      setSlotCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Delete this available time slot?")) return;
    try {
      setDeletingSlotId(slotId);
      setError("");
      await deleteSlot(slotId);
      setMySlots((prev) => prev.filter((s) => s._id !== slotId));
      setMessage("Slot removed successfully.");
    } catch (err) {
      setError(err.message || "Failed to remove slot.");
    } finally {
      setDeletingSlotId("");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setError("");
    setMessage("");

    try {
      const specializations = editForm.specialization
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateLawyerProfile({
        bio: editForm.bio.trim(),
        city: editForm.city.trim(),
        consultationFee: Number(editForm.consultationFee),
        experienceYears: Number(editForm.experienceYears),
        specialization: specializations,
      });

      setLawyerProfile(updated);
      setMessage("Lawyer profile details updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header Title */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Lawyer Practice Hub
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your consultations, availability schedule, client communications, and earnings.
              </p>
            </div>

            {lawyerProfile && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-bold">
                  {lawyerProfile.user?.name ? lawyerProfile.user.name.charAt(0) : "L"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{lawyerProfile.user?.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    Verified Advocate
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Newly Approved Lawyer Setup Guide */}
          {showSetupGuide && (
            <div className="mt-6 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-6 shadow-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-200/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900 text-amber-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Advocate Portal Quick-Start Setup Guide</h3>
                    <p className="text-xs text-slate-500">3 simple steps to configure your practice and receive client consultations</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSetupGuide(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 self-start sm:self-auto"
                >
                  Dismiss Guide ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("profile")}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                      1
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Step 1</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Set Consultation Fee & Bio</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Confirm your court specializations, fee in INR, and practicing biography for clients.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("slots")}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                      2
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Step 2</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Add Bookable Slots</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Open consultation dates & time windows directly on your calendar for client booking.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("appointments")}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                      3
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 3</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Join Video Room & Consult</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Accept appointments, review shared case files, and launch HD WebRTC video calls.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Metric Cards */}
          <section className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Requests
              </p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Confirmed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-700">
                {confirmedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                {completedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Net Earnings
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                ₹{(earningsData?.summary?.netEarningsRupees || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </section>

          {/* Tabs Navigation */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "appointments", label: "Consultations", icon: Calendar, count: appointments.length },
              { id: "slots", label: "Availability Slots", icon: Clock, count: mySlots.length },
              { id: "earnings", label: "Earnings & Payouts", icon: DollarSign },
              { id: "reviews", label: "Client Reviews", icon: Star, count: reviewsData.length },
              { id: "profile", label: "Edit Public Profile", icon: Edit },
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === id
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.2 text-xs font-bold ${
                      activeTab === id ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: CONSULTATIONS */}
          {activeTab === "appointments" && (
            <section className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Consultation Bookings</h2>
                <button
                  type="button"
                  onClick={loadAppointments}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-xs">
                  Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                  <Calendar className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-base font-bold text-slate-800">No appointments scheduled</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ensure you have added availability slots so clients can book consultations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const client = appointment.client || {};
                    const isVideo = appointment.consultationType === "video";
                    const canJoinVideo = isVideo && appointment.status === "confirmed";

                    return (
                      <article
                        key={appointment._id}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-700">
                              {client.name ? client.name.charAt(0) : "C"}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {client.name || "Client Name"}
                              </h3>
                              <p className="text-xs text-slate-500">{client.email || "No email"}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {appointment.isPaid ? (
                              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                                Fee Paid
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                                Fee Pending
                              </span>
                            )}

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                statusStyles[appointment.status] || "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3 text-xs">
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Scheduled At</span>
                            <p className="font-semibold text-slate-800 mt-0.5">{formatDate(appointment.scheduledAt)}</p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Consultation Type</span>
                            <p className="font-semibold text-slate-800 mt-0.5 capitalize flex items-center gap-1">
                              {isVideo ? <Video className="h-3.5 w-3.5 text-blue-700" /> : null}
                              {appointment.consultationType} ({appointment.durationMinutes || 30} mins)
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Client Issue / Note</span>
                            <p className="font-semibold text-slate-800 mt-0.5 truncate">
                              {appointment.notes || "No notes provided"}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Chat
                            </button>

                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appointment)}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                            >
                              <FileText className="h-4 w-4" />
                              Case Documents
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {canJoinVideo && (
                              <button
                                type="button"
                                onClick={() => navigate(`/video-room/${appointment._id}`)}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition"
                              >
                                <Video className="h-4 w-4 animate-pulse" />
                                Join Video Consultation
                              </button>
                            )}

                            {appointment.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(appointment._id, "confirm")}
                                  disabled={processingId === appointment._id}
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                                >
                                  {processingId === appointment._id ? "Processing..." : "Confirm Booking"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleAction(appointment._id, "reject")}
                                  disabled={processingId === appointment._id}
                                  className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {appointment.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleAction(appointment._id, "complete")}
                                disabled={processingId === appointment._id}
                                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition disabled:opacity-50"
                              >
                                {processingId === appointment._id ? "Processing..." : "Mark as Completed"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 2: AVAILABILITY SLOTS */}
          {activeTab === "slots" && (
            <section className="mt-6 space-y-6">
              {/* Creator Box */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900">Add 30-Minute Consultation Slot</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Select a future date and start time. Clients can view and book these slots instantly.
                </p>

                <form onSubmit={handleCreateSlot} className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor="slotDate" className="block text-xs font-semibold text-slate-600 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      id="slotDate"
                      type="datetime-local"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      required
                      className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={slotCreating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {slotCreating ? "Adding Slot..." : "Create Slot"}
                  </button>
                </form>
              </div>

              {/* Slots List */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  All Scheduled Slots ({mySlots.length})
                </h3>

                {mySlots.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No availability slots created yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mySlots.map((slot) => {
                      const isBooked = slot.status === "booked";
                      const isPast = new Date(slot.startAt) <= new Date();

                      return (
                        <div
                          key={slot._id}
                          className={`rounded-2xl border p-4 transition ${
                            isBooked
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white border-blue-200 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isBooked
                                  ? "bg-amber-100 text-amber-800"
                                  : isPast
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isBooked ? "Booked" : isPast ? "Expired" : "Available"}
                            </span>

                            {!isBooked && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot._id)}
                                disabled={deletingSlotId === slot._id}
                                className="text-slate-400 hover:text-red-600 transition p-1"
                                title="Delete Slot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <p className="mt-3 text-sm font-bold text-slate-900">
                            {formatDate(slot.startAt)}
                          </p>
                          <p className="text-xs text-slate-500">
                            Until {new Date(slot.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 3: EARNINGS & PAYOUTS */}
          {activeTab === "earnings" && (
            <section className="mt-6 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Consultation Earnings & Payouts</h2>
                    <p className="text-xs text-slate-500">
                      Summary calculated automatically from verified completed consultations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadEarnings}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Consultation Volume</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      ₹{(earningsData?.summary?.grossEarningsRupees || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      From {earningsData?.summary?.paidConsultationsCount || 0} paid sessions
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Service Charge (10%)</p>
                    <p className="mt-2 text-2xl font-extrabold text-amber-700">
                      ₹{(earningsData?.summary?.platformChargesRupees || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Technology & payment gateway fees</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Net Payable Earnings</p>
                    <p className="mt-2 text-2xl font-extrabold text-emerald-950">
                      ₹{(earningsData?.summary?.netEarningsRupees || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1">Eligible for weekly settlement</p>
                  </div>
                </div>

                {/* Transactions Breakdown */}
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Completed Sessions Breakdown</h3>
                  {earningsData?.transactions?.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No completed consultations recorded yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Fee</th>
                            <th className="px-4 py-3">Platform Cut</th>
                            <th className="px-4 py-3">Net Payout</th>
                            <th className="px-4 py-3">Payment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {earningsData?.transactions?.map((t) => (
                            <tr key={t.appointmentId} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-900">{t.clientName}</td>
                              <td className="px-4 py-3 text-slate-600">{formatDate(t.consultationDate)}</td>
                              <td className="px-4 py-3 capitalize">{t.consultationType}</td>
                              <td className="px-4 py-3 font-semibold text-slate-800">₹{t.amountRupees}</td>
                              <td className="px-4 py-3 text-amber-700 font-medium">₹{t.platformCut}</td>
                              <td className="px-4 py-3 font-bold text-emerald-700">₹{t.netPayout}</td>
                              <td className="px-4 py-3">
                                {t.isPaid ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Captured
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: CLIENT REVIEWS */}
          {activeTab === "reviews" && (
            <section className="mt-6 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Genuine Client Reviews</h2>
                    <p className="text-xs text-slate-500">
                      Ratings are calculated dynamically from verified client submissions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {lawyerProfile?.averageRating || 0}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        / 5 ({lawyerProfile?.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {reviewsData.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No client reviews yet. Reviews will automatically appear here once clients complete consultations.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {reviewsData.map((rev) => (
                      <div
                        key={rev._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                              {rev.client?.name ? rev.client.name.charAt(0) : "C"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{rev.client?.name || "Client"}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                              </p>
                            </div>
                          </div>

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

                        {rev.reviewText && (
                          <p className="mt-3 text-xs text-slate-700 leading-relaxed">
                            &ldquo;{rev.reviewText}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeTab === "profile" && (
            <section className="mt-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl">
                <h2 className="text-xl font-bold text-slate-900">Public Lawyer Profile</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Update your publicly discoverable biography, specializations, and consultation fee.
                </p>

                <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Biography
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Describe your legal background, court admissions, and approach..."
                      className="w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary City / Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        value={editForm.experienceYears}
                        onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Fee (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={editForm.consultationFee}
                      onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specializations (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.specialization}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      placeholder="e.g. Criminal Law, Property Disputes, Family Law, Corporate"
                      required
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-800 disabled:opacity-50 transition"
                    >
                      <Save className="h-4 w-4" />
                      {profileSaving ? "Saving..." : "Save Profile Updates"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
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

      {documentAppointment && (
        <DocumentModal
          appointment={documentAppointment}
          isOpen={!!documentAppointment}
          onClose={() => setDocumentAppointment(null)}
        />
      )}

      {profileModalOpen && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
