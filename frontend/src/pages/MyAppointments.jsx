import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  cancelAppointment,
} from "../services/appointmentService";
import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
} from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ReviewModal from "../components/ReviewModal";
import ChatModal from "../components/ChatModal";
import DocumentModal from "../components/DocumentModal";
import ReceiptModal from "../components/ReceiptModal";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
  Video,
  MessageSquare,
  FileText,
  Receipt,
  Star,
  XCircle,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Filter,
  Eye,
  X,
  Scale,
  RefreshCw,
} from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusBadge(status) {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        label: "Pending Confirmation",
        classes: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Clock,
      };
    case "completed":
      return {
        label: "Completed",
        classes: "bg-blue-50 text-blue-800 border-blue-200",
        icon: CheckCircle2,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        classes: "bg-slate-100 text-slate-700 border-slate-200",
        icon: XCircle,
      };
    case "rejected":
      return {
        label: "Rejected",
        classes: "bg-red-50 text-red-800 border-red-200",
        icon: XCircle,
      };
    default:
      return {
        label: status,
        classes: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Clock,
      };
  }
}

export default function MyAppointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [cancellingId, setCancellingId] = useState("");
  const [payingId, setPayingId] = useState("");

  // Category Tab state: "all" | "upcoming" | "pending" | "completed" | "cancelled"
  const [activeTab, setActiveTab] = useState("all");

  // Modals state
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [receiptAppointment, setReceiptAppointment] = useState(null);
  const [detailAppointment, setDetailAppointment] = useState(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load client appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Tab Filtering
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((appt) => {
      if (activeTab === "all") return true;
      if (activeTab === "upcoming") {
        return (
          appt.status === "confirmed" && new Date(appt.scheduledAt) > now
        );
      }
      if (activeTab === "pending") {
        return appt.status === "pending";
      }
      if (activeTab === "completed") {
        return appt.status === "completed";
      }
      if (activeTab === "cancelled") {
        return appt.status === "cancelled" || appt.status === "rejected";
      }
      return true;
    });
  }, [appointments, activeTab]);

  // Tab Counts for badges
  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: appointments.length,
      upcoming: appointments.filter(
        (a) => a.status === "confirmed" && new Date(a.scheduledAt) > now
      ).length,
      pending: appointments.filter((a) => a.status === "pending").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter(
        (a) => a.status === "cancelled" || a.status === "rejected"
      ).length,
    };
  }, [appointments]);

  async function handleConfirmCancel() {
    if (!cancelModalAppointment) return;

    const appointmentId = cancelModalAppointment._id;
    setCancellingId(appointmentId);
    setError("");
    setSuccess("");

    try {
      await cancelAppointment(appointmentId);
      setSuccess("Appointment cancelled successfully.");
      setCancelModalAppointment(null);
      await loadAppointments();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Unable to cancel appointment.");
    } finally {
      setCancellingId("");
    }
  }

  async function handlePay(appointment) {
    setError("");
    setSuccess("");
    setPayingId(appointment._id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay payment gateway. Please check your internet connection."
        );
      }

      const orderData = await createPaymentOrder(appointment._id);

      if (!orderData?.data?.orderId) {
        throw new Error("Failed to initialize payment order.");
      }

      const { keyId, orderId, amount, currency } = orderData.data;
      const lawyerName =
        appointment.lawyer?.user?.name || "Verified Legal Advocate";

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "LegalConnect",
        description: `Consultation Fee with Advocate ${lawyerName}`,
        order_id: orderId,
        handler: async function (response) {
          setPayingId(appointment._id);
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccess("Payment verified successfully! Your consultation fee is recorded.");
            await loadAppointments();
            setTimeout(() => setSuccess(""), 4000);
          } catch (verifyErr) {
            setError(
              verifyErr.message ||
                "Payment was processed but signature verification failed. Please contact support."
            );
          } finally {
            setPayingId("");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#2457d6",
        },
        modal: {
          ondismiss: function () {
            setPayingId("");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        setError(
          response.error?.description || "Payment failed. Please try again."
        );
        setPayingId("");
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || "Unable to start payment.");
      setPayingId("");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#070D1E] via-[#0B132B] to-[#101C3A] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
                  Client Appointment Manager
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  My Consultations
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Track scheduled sessions with legal counsel, enter video rooms, manage payments, and submit reviews.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/client/lawyers"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D9A441] px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-[#c89432] transition active:scale-[0.98]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book New Consultation</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toast / Notification messages */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={loadAppointments}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-700 transition"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CATEGORY TABS: Upcoming, Pending, Completed, Cancelled, All */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold scrollbar-none">
            {[
              { id: "all", label: "All Appointments", count: counts.all },
              { id: "upcoming", label: "Upcoming", count: counts.upcoming },
              { id: "pending", label: "Pending Requests", count: counts.pending },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                    isSelected
                      ? "border-[#2457D6] text-[#2457D6]"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-[#2457D6] text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-2xs">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2457D6] border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-600">
                Loading your appointments...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-blue-50 text-[#2457D6]">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                No appointments found in this section
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {activeTab === "all"
                  ? "You have not booked any appointments yet. Search our legal panel to find the advocate best suited for your case."
                  : `There are currently no ${activeTab} appointments recorded for your account.`}
              </p>
              <Link
                to="/client/lawyers"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
              >
                <Scale className="h-4 w-4" /> Find an Advocate
              </Link>
            </div>
          )}

          {/* APPOINTMENT CARDS LIST */}
          {!loading && filteredAppointments.length > 0 && (
            <div className="space-y-4">
              {filteredAppointments.map((appt) => {
                const lawyer = appt.lawyer || {};
                const lawyerUser = lawyer.user || {};
                const lawyerName = lawyerUser.name || lawyer.name || "Advocate";
                const lawyerImage = lawyerUser.profileImage || null;
                const lawyerId = lawyer._id;

                const initials = lawyerName
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "A";

                const specializations = Array.isArray(lawyer.specialization)
                  ? lawyer.specialization
                  : lawyer.specialization
                  ? [lawyer.specialization]
                  : ["General Practice"];

                const ratingValue = lawyer.averageRating > 0
                  ? lawyer.averageRating.toFixed(1)
                  : "5.0";
                const reviewCount = lawyer.totalReviews || 0;

                const statusInfo = getStatusBadge(appt.status);
                const StatusIcon = statusInfo.icon;

                const bookingRef = `#LC-${appt._id.slice(-6).toUpperCase()}`;
                const isPaid = appt.isPaid || Boolean(appt.payment);
                const isPending = appt.status === "pending";
                const isConfirmed = appt.status === "confirmed";
                const isCompleted = appt.status === "completed";

                return (
                  <article
                    key={appt._id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Lawyer & Appointment Information */}
                      <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
                        {/* Clickable Lawyer Profile Avatar */}
                        {lawyerId ? (
                          <Link
                            to={`/lawyers/${lawyerId}`}
                            className="relative shrink-0 block group"
                            title="View Public Profile"
                          >
                            {lawyerImage ? (
                              <img
                                src={lawyerImage}
                                alt={lawyerName}
                                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:border-[#2457D6] transition"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#101C3A] to-[#2457D6] text-white flex items-center justify-center font-extrabold text-2xl border border-slate-200 shadow-2xs group-hover:border-[#2457D6] transition ${
                                lawyerImage ? "hidden" : "flex"
                              }`}
                            >
                              {initials}
                            </div>
                            <span
                              className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-xs"
                              title="Verified Advocate"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          </Link>
                        ) : (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center font-extrabold text-2xl shrink-0">
                            {initials}
                          </div>
                        )}

                        {/* Lawyer & Consultation Metadata */}
                        <div className="space-y-2 min-w-0 flex-1">
                          {/* Top row: Status Badge & Reference ID */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${statusInfo.classes}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusInfo.label}
                            </span>

                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              Ref: {bookingRef}
                            </span>

                            <span className="text-xs font-semibold text-[#2457D6] capitalize bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                              {appt.consultationType === "video" ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              {appt.consultationType} Consultation
                            </span>
                          </div>

                          {/* Lawyer Full Name */}
                          <div>
                            {lawyerId ? (
                              <Link
                                to={`/lawyers/${lawyerId}`}
                                className="font-heading text-base font-bold text-slate-900 hover:text-[#2457D6] hover:underline transition inline-flex items-center gap-1.5"
                              >
                                Advocate {lawyerName}
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                              </Link>
                            ) : (
                              <h2 className="font-heading text-base font-bold text-slate-900">
                                Advocate {lawyerName}
                              </h2>
                            )}

                            {/* Rating and Reviews */}
                            <div className="flex items-center gap-2 mt-0.5 text-xs">
                              <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Star className="h-3 w-3 fill-[#D9A441] text-[#D9A441]" />
                                {ratingValue}
                              </span>
                              <span className="text-slate-500 font-medium">
                                ({reviewCount} reviews)
                              </span>
                              {lawyer.city && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-600 font-medium flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {lawyer.city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Specialization Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {specializations.slice(0, 3).map((spec) => (
                              <span
                                key={spec}
                                className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Scheduled Date & Time highlight */}
                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 pt-1">
                            <span className="flex items-center gap-1.5 text-[#2457D6] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 font-bold">
                              <Calendar className="h-3.5 w-3.5 text-[#2457D6]" />
                              {formatDateTime(appt.scheduledAt)}
                            </span>

                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {appt.durationMinutes || 30} mins session
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Appointment Actions */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between sm:justify-start gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                        {/* View Public Lawyer Profile Button */}
                        {lawyerId && (
                          <Link
                            to={`/lawyers/${lawyerId}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#2457D6] transition shadow-2xs"
                          >
                            <Scale className="h-3.5 w-3.5" />
                            <span>View Lawyer Profile</span>
                          </Link>
                        )}

                        {/* View Appointment Details Modal Button */}
                        <button
                          type="button"
                          onClick={() => setDetailAppointment(appt)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>

                        {/* Join Consultation Button (For Confirmed Video Calls) */}
                        {isConfirmed && appt.consultationType === "video" && (
                          <Link
                            to={`/video-room/${appt._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2457D6] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                          >
                            <Video className="h-4 w-4" />
                            <span>Join Video Meeting</span>
                          </Link>
                        )}

                        {/* Submit Review Button (For Completed Sessions) */}
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => setReviewAppointment(appt)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D9A441] px-4 py-2 text-xs font-bold text-slate-950 shadow-2xs hover:bg-[#c89432] transition"
                          >
                            <Star className="h-4 w-4" />
                            <span>Leave Review</span>
                          </button>
                        )}

                        {/* Cancel Appointment Button (Only Permitted for Pending Status) */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setCancelModalAppointment(appt)}
                            disabled={cancellingId === appt._id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel Request</span>
                          </button>
                        )}

                        {/* Payment Button if not paid */}
                        {!isPaid && !appt.isPaid && appt.status !== "cancelled" && appt.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => handlePay(appt)}
                            disabled={payingId === appt._id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50 transition"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>{payingId === appt._id ? "Processing..." : "Pay Fee"}</span>
                          </button>
                        )}

                        {/* Additional Modals Access (Chat, Docs, Receipt) */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setChatAppointment(appt)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-[#2457D6] transition"
                            title="Open Consultation Chat"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocumentAppointment(appt)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-[#2457D6] transition"
                            title="Shared Documents"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptAppointment(appt)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-[#2457D6] transition"
                            title="Consultation Receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* APPOINTMENT DETAIL MODAL */}
      {detailAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2457D6]" />
                Appointment Details
              </h3>
              <button
                type="button"
                onClick={() => setDetailAppointment(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Booking Reference:</span>
                  <span className="font-bold text-slate-900">
                    #LC-{detailAppointment._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Scheduled Date & Time:</span>
                  <span className="font-bold text-[#2457D6]">
                    {formatDateTime(detailAppointment.scheduledAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Consultation Format:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {detailAppointment.consultationType} Consultation
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className="font-bold capitalize text-slate-900">
                    {detailAppointment.status}
                  </span>
                </div>
              </div>

              {/* Counsel Info */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="font-bold text-slate-900 block">Counsel Information</span>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Advocate {detailAppointment.lawyer?.user?.name || "Verified Legal Advocate"}
                </p>
                <p className="text-slate-600">
                  {detailAppointment.lawyer?.city || "High Court Panel"}, India
                </p>
                {detailAppointment.lawyer?._id && (
                  <Link
                    to={`/lawyers/${detailAppointment.lawyer._id}`}
                    className="inline-flex items-center gap-1 font-bold text-[#2457D6] hover:underline pt-1"
                  >
                    View Complete Public Profile →
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailAppointment(null)}
                className="rounded-xl bg-[#2457D6] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Cancel Consultation Request?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your pending consultation request with Advocate{" "}
              <strong>
                {cancelModalAppointment.lawyer?.user?.name || "the advocate"}
              </strong>
              ? If fee was deducted, it will be refunded per policy.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingId)}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewAppointment && (
        <ReviewModal
          isOpen={Boolean(reviewAppointment)}
          appointment={reviewAppointment}
          onClose={() => setReviewAppointment(null)}
          onReviewSubmitted={() => {
            setReviewAppointment(null);
            loadAppointments();
          }}
        />
      )}

      {/* Chat Modal */}
      {chatAppointment && (
        <ChatModal
          isOpen={Boolean(chatAppointment)}
          appointment={chatAppointment}
          onClose={() => setChatAppointment(null)}
        />
      )}

      {/* Document Modal */}
      {documentAppointment && (
        <DocumentModal
          isOpen={Boolean(documentAppointment)}
          appointment={documentAppointment}
          onClose={() => setDocumentAppointment(null)}
        />
      )}

      {/* Receipt Modal */}
      {receiptAppointment && (
        <ReceiptModal
          isOpen={Boolean(receiptAppointment)}
          appointment={receiptAppointment}
          onClose={() => setReceiptAppointment(null)}
        />
      )}

      {/* Profile Settings Modal */}
      {profileModalOpen && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
