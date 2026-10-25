
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookAppointment } from "../services/appointmentService";
import { getLawyerById } from "../services/lawyerService";

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

        const lawyerData = await getLawyerById(parsed.lawyerId);

        if (active) {
          setSelection(parsed);
          setLawyer(lawyerData);
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
      setError(err.message || "Unable to book appointment.");
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Booking..." : "Confirm Appointment"}
                </button>

                <p className="text-xs leading-5 text-gray-500">
                  Your appointment will be created with pending status.
                  The lawyer can then confirm or reject it.
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
