import { useCallback, useEffect, useState } from "react";
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
  MapPin
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

function getLawyerName(appointment) {
  const lawyer = appointment.lawyer;
  return lawyer?.user?.name || "Verified Advocate";
}

function getStatusClasses(status) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-slate-100 text-slate-700 border-slate-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
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

  // Modals state
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [receiptAppointment, setReceiptAppointment] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleCancel(appointmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;

    setCancellingId(appointmentId);
    setError("");
    setSuccess("");

    try {
      await cancelAppointment(appointmentId);
      setSuccess("Appointment cancelled successfully.");
      await loadAppointments();
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

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "LegalConnect",
        description: `Consultation Fee with ${getLawyerName(appointment)}`,
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
          color: "#1e3a8a",
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                My Consultations
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your scheduled appointments, join video calls, and access legal advice.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/lawyers"
                className="inline-flex items-center rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition"
              >
                Find Another Lawyer
              </Link>
            </div>
          </div>

          {/* Feedback banners */}
          {success && (
            <div
              role="status"
              className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800 border border-green-200"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200"
            >
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={loadAppointments}
                className="mt-1 text-xs underline font-semibold text-red-800"
              >
                Try refreshing
              </button>
            </div>
          )}

          {/* Appointments Content */}
          {loading ? (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center text-slate-500 shadow-sm border border-slate-200">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-sm">Loading your consultations...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No consultations booked yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Connect with verified legal experts and book your first consultation in minutes.
              </p>
              <Link
                to="/lawyers"
                className="mt-5 inline-block rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition"
              >
                Browse Available Lawyers
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {appointments.map((appointment) => {
                const lawyer = appointment.lawyer || {};
                const lawyerUser = lawyer.user || {};
                const lawyerName = lawyerUser.name || "Verified Lawyer";
                const isVideo = appointment.consultationType === "video";
                const canJoinVideo = isVideo && appointment.status === "confirmed";
                const canReview = appointment.status === "completed" && !appointment.isReviewed;

                return (
                  <article
                    key={appointment._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex items-start gap-4">
                        {lawyerUser.profileImage ? (
                          <img
                            src={lawyerUser.profileImage}
                            alt={lawyerName}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-900">
                            {lawyerName.charAt(0)}
                          </div>
                        )}

                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            {lawyerName}
                          </h2>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {lawyer.city || "City not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {appointment.isPaid ? (
                          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                            Fee Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                            Payment Pending
                          </span>
                        )}

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>

                    {/* Consultation Meta Grid */}
                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Date & Time
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Type
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900 flex items-center gap-1.5">
                          {isVideo ? (
                            <>
                              <Video className="h-4 w-4 text-blue-700" />
                              Video Call
                            </>
                          ) : (
                            "In-Person"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Duration
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {appointment.durationMinutes || 30} mins
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Consultation Fee
                        </p>
                        <p className="mt-1 text-sm font-bold text-blue-900">
                          {lawyer.consultationFee != null
                            ? `₹${Number(lawyer.consultationFee).toLocaleString("en-IN")}`
                            : "Contact"}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Your Case Notes
                        </p>
                        <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Interactive Action Buttons */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      {/* Secondary Quick Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Chat button */}
                        <button
                          type="button"
                          onClick={() => setChatAppointment(appointment)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </button>

                        {/* Case Documents button */}
                        <button
                          type="button"
                          onClick={() => setDocumentAppointment(appointment)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                        >
                          <FileText className="h-4 w-4" />
                          Case Documents
                        </button>

                        {/* View Receipt button */}
                        {appointment.isPaid && (
                          <button
                            type="button"
                            onClick={() => setReceiptAppointment(appointment)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                          >
                            <Receipt className="h-4 w-4 text-emerald-600" />
                            Receipt
                          </button>
                        )}
                      </div>

                      {/* Primary Lifecycle Actions */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Join Video Consultation */}
                        {canJoinVideo && (
                          <button
                            type="button"
                            onClick={() => navigate(`/video-room/${appointment._id}`)}
                            className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition"
                          >
                            <Video className="h-4 w-4 animate-pulse" />
                            Join Video Consultation
                          </button>
                        )}

                        {/* Pay Consultation Fee */}
                        {appointment.status === "pending" && !appointment.isPaid && (
                          <button
                            type="button"
                            disabled={payingId === appointment._id}
                            onClick={() => handlePay(appointment)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
                          >
                            <CreditCard className="h-4 w-4" />
                            {payingId === appointment._id
                              ? "Connecting Razorpay..."
                              : `Pay Fee (₹${lawyer.consultationFee || 0})`}
                          </button>
                        )}

                        {/* Review Lawyer Button */}
                        {canReview && (
                          <button
                            type="button"
                            onClick={() => setReviewAppointment(appointment)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition"
                          >
                            <Star className="h-4 w-4 fill-slate-900" />
                            Review Lawyer
                          </button>
                        )}

                        {/* Already Reviewed Tag */}
                        {appointment.status === "completed" && appointment.isReviewed && (
                          <span className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            Reviewed
                          </span>
                        )}

                        {/* Cancel Appointment Button */}
                        {appointment.status === "pending" && (
                          <button
                            type="button"
                            disabled={cancellingId === appointment._id}
                            onClick={() => handleCancel(appointment._id)}
                            className="flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {cancellingId === appointment._id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Interactive Modals */}
      {reviewAppointment && (
        <ReviewModal
          appointment={reviewAppointment}
          isOpen={!!reviewAppointment}
          onClose={() => setReviewAppointment(null)}
          onReviewSubmitted={() => {
            setReviewAppointment(null);
            loadAppointments();
          }}
        />
      )}

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

      {receiptAppointment && (
        <ReceiptModal
          appointment={receiptAppointment}
          isOpen={!!receiptAppointment}
          onClose={() => setReceiptAppointment(null)}
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
