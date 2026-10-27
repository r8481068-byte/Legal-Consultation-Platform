import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  createAvailabilitySlot,
  getMySlots,
  deleteSlot,
} from "../services/availabilityService";
import {
  Clock,
  Calendar,
  PlusCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  UserCheck,
} from "lucide-react";

export default function LawyerAvailabilityPage() {
  const [mySlots, setMySlots] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotCreating, setSlotCreating] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSlots = useCallback(async () => {
    try {
      setError("");
      const slots = await getMySlots();
      setMySlots(slots || []);
    } catch (err) {
      setError(err.message || "Failed to load availability slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

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
    if (!window.confirm("Are you sure you want to remove this available time slot?")) {
      return;
    }
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

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const availableCount = mySlots.filter((s) => s.status === "available" && new Date(s.startAt) > new Date()).length;
  const bookedCount = mySlots.filter((s) => s.status === "booked").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Top navigation trail */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/lawyer-dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lawyer Dashboard
            </Link>

            <Link
              to="/lawyer/edit-profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
            >
              Edit Lawyer Profile →
            </Link>
          </div>

          {/* Page Header */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Consultation Schedule Manager
                </span>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Availability & Slot Manager
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your 30-minute bookable consultation slots. Verified clients can immediately book these time windows.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-center">
                  <span className="text-xl font-black text-blue-900">{availableCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Available</span>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-center">
                  <span className="text-xl font-black text-amber-900">{bookedCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Booked</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-xs font-semibold text-green-800 border border-green-200">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Slot Creator Form */}
            <form onSubmit={handleCreateSlot} className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Add New 30-Minute Consultation Slot
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose a future date and start time. The system will automatically configure a 30-minute consultation window.
              </p>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[240px]">
                  <label htmlFor="slotDateInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date & Time (IST)
                  </label>
                  <input
                    id="slotDateInput"
                    type="datetime-local"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={slotCreating}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-50"
                >
                  <PlusCircle className="h-4 w-4" />
                  {slotCreating ? "Creating..." : "Create Slot"}
                </button>
              </div>
            </form>
          </div>

          {/* Slots List Card */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                All Scheduled Slots ({mySlots.length})
              </h2>

              <button
                type="button"
                onClick={loadSlots}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Refresh Slots
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading availability schedule...
              </div>
            ) : mySlots.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-800">No Consultation Slots Created</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first consultation slot above so clients can view and book legal advice appointments with you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySlots.map((slot) => {
                  const isBooked = slot.status === "booked";
                  const isPast = new Date(slot.startAt) <= new Date();

                  return (
                    <div
                      key={slot._id}
                      className={`rounded-2xl border p-4 transition ${
                        isBooked
                          ? "bg-amber-50/40 border-amber-200 shadow-2xs"
                          : isPast
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-blue-200 shadow-xs hover:border-blue-400"
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        Until {new Date(slot.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
