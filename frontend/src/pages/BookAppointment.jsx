import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookAppointment } from "../services/appointmentService";
import { getLawyerById } from "../services/lawyerService";
import { getBookingEligibility } from "../services/authService";
import BookingEligibilityModal from "../components/BookingEligibilityModal";
import { ShieldAlert, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Not available";

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
  const [consultationType, setConsultationType] = useState("video");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Eligibility state
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBookingDetails() {
      try {
        const saved = sessionStorage.getItem("pendingConsultation");

        if (!saved) {
          if (active) {
            setError("No selected slot found. Please choose a lawyer and time slot first.");
            setLoading(false);
          }
          return;
        }

        const parsed = JSON.parse(saved);

        if (!parsed.lawyerId || !parsed.slotId) {
          throw new Error("The saved consultation selection is invalid.");
        }

        const [lawyerData, eligData] = await Promise.all([
          getLawyerById(parsed.lawyerId),
          getBookingEligibility().catch(() => null),
        ]);

        if (active) {
          setSelection(parsed);
          setLawyer(lawyerData);
          if (eligData) {
            setEligibility(eligData);
            if (!eligData.eligible) {
              setEligibilityModalOpen(true);
            }
          }
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
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selection?.slotId) {
      setError("Please select a time slot from a lawyer's profile.");
      return;
    }

    // Check frontend eligibility status
    if (eligibility && !eligibility.eligible) {
      setEligibilityModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      await bookAppointment({
        slotId: selection.slotId,
        consultationType,
        notes: notes.trim(),
      });

      sessionStorage.removeItem("pendingConsultation");
      navigate("/my-appointments", {
        replace: true,
        state: { message: "Appointment booked successfully." },
      });
    } catch (err) {
      if (err.data?.code === "BOOKING_INELIGIBLE" || err.data?.eligibility) {
        setEligibility(err.data.eligibility || { eligible: false, reasons: [err.message] });
        setEligibilityModalOpen(true);
      } else {
        setError(err.message || "Unable to book appointment.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-50">
        <p className="text-gray-600">Loading booking details...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/lawyers"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to lawyers
        </Link>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Book Consultation
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Confirm your selected lawyer and consultation details.
          </p>

          {/* Eligibility Banner if not eligible */}
          {eligibility && !eligibility.eligible && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <p className="font-bold text-sm text-amber-900">
                    Booking Eligibility Incomplete
                  </p>
                  <p className="text-amber-800">
                    You must verify your contact details and complete client address & identity requirements before confirming this appointment.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEligibilityModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-blue-900 underline hover:text-blue-950"
                  >
                    View Missing Requirements Checklist <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
              {!selection && (
                <p className="mt-2">
                  <Link to="/lawyers" className="font-semibold underline">
                    Browse lawyers
                  </Link>
                </p>
              )}
            </div>
          )}

          {lawyer && selection && (
            <>
              <div className="mt-6 rounded-xl bg-blue-50 p-5">
                <h2 className="text-lg font-semibold text-blue-950">
                  {lawyer.user?.name || "Lawyer"}
                </h2>

                <p className="mt-1 text-sm text-blue-900">
                  {lawyer.city || "City not specified"}
                </p>

                <p className="mt-3 text-sm text-blue-900">
                  Consultation fee:{" "}
                  {lawyer.consultationFee != null
                    ? `₹${Number(lawyer.consultationFee).toLocaleString("en-IN")}`
                    : "Contact for fee"}
                </p>

                <p className="mt-2 text-sm text-blue-900">
                  <span className="font-semibold">Selected Time:</span>{" "}
                  {selection.startAt
                    ? formatDateTime(selection.startAt)
                    : `Slot ID ${selection.slotId}`}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="consultationType"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Consultation Type
                  </label>

                  <select
                    id="consultationType"
                    value={consultationType}
                    onChange={(event) =>
                      setConsultationType(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-600"
                    required
                  >
                    <option value="video">Video Consultation</option>
                    <option value="in-person">In-person Consultation</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Describe Your Legal Issue (Optional)
                  </label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Briefly describe what you need help with..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-600"
                  />

                  <p className="mt-1 text-right text-xs text-gray-500">
                    {notes.length}/1000
                  </p>
                </div>

                {eligibility && !eligibility.eligible ? (
                  <button
                    type="button"
                    onClick={() => setEligibilityModalOpen(true)}
                    className="w-full rounded-lg bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 flex items-center justify-center gap-2"
                  >
                    Complete Eligibility Requirements to Book <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Booking..." : "Confirm Appointment"}
                  </button>
                )}

                <p className="text-xs leading-5 text-gray-500">
                  Your appointment will be created with pending status.
                  The lawyer can then confirm or reject it.
                </p>
              </form>
            </>
          )}
        </section>
      </div>

      {/* Centralized Eligibility Modal */}
      {eligibilityModalOpen && eligibility && (
        <BookingEligibilityModal
          isOpen={eligibilityModalOpen}
          onClose={() => setEligibilityModalOpen(false)}
          eligibility={eligibility}
          pendingSelection={selection}
        />
      )}
    </main>
  );
}
