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
  Loader2,
  CalendarDays,
  Sparkles,
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top navigation trail */}
          <div className="flex items-center justify-between">
            <Link
              to="/lawyer-dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Lawyer Dashboard</span>
            </Link>

            <Link
              to="/lawyer/profile/edit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-royal hover:underline"
            >
              <span>Edit Lawyer Profile</span>
              <span>→</span>
            </Link>
          </div>

          {/* Page Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-royal">
                  Consultation Schedule Manager
                </span>
                <h1 className="mt-1 text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
                  Availability & Slot Manager
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your 30-minute bookable consultation slots. Verified clients can immediately book these time windows.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl bg-blue-50/80 border border-blue-200 px-4 py-2.5 text-center min-w-[90px]">
                  <span className="text-2xl font-heading font-black text-navy">{availableCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-royal block">Available</span>
                </div>
                <div className="rounded-2xl bg-amber-50/80 border border-amber-200 px-4 py-2.5 text-center min-w-[90px]">
                  <span className="text-2xl font-heading font-black text-amber-900">{bookedCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Booked</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {/* Slot Creator Form */}
            <form onSubmit={handleCreateSlot} className="mt-6 rounded-2xl bg-slate-50/80 p-5 sm:p-6 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="h-4 w-4 text-royal" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Add New 30-Minute Consultation Slot
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Choose a future date and start time. The system will automatically configure a 30-minute consultation window.
              </p>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[260px]">
                  <label htmlFor="slotDateInput" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Start Date & Time (IST)
                  </label>
                  <input
                    id="slotDateInput"
                    type="datetime-local"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-royal focus:ring-1 focus:ring-royal transition shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={slotCreating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition disabled:opacity-50"
                >
                  {slotCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <PlusCircle className="h-4 w-4 text-gold" />
                  )}
                  <span>{slotCreating ? "Creating..." : "Create Slot"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Slots List Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-heading font-bold text-navy">
                  All Scheduled Slots ({mySlots.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Manage upcoming available and booked appointments
                </p>
              </div>

              <button
                type="button"
                onClick={loadSlots}
                className="text-xs font-bold text-royal hover:underline"
              >
                Refresh Slots
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-royal mb-2" />
                Loading availability schedule...
              </div>
            ) : mySlots.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                <p className="text-sm font-heading font-bold text-navy">No Consultation Slots Created</p>
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
                      className={`rounded-2xl border p-4.5 transition ${
                        isBooked
                          ? "bg-amber-50/40 border-amber-200 shadow-2xs"
                          : isPast
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 shadow-2xs hover:border-royal/50 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isBooked
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : isPast
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isBooked ? "Booked" : isPast ? "Expired" : "Available"}
                        </span>

                        {!isBooked && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot._id)}
                            disabled={deletingSlotId === slot._id}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                            title="Delete Slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-heading font-bold text-navy">
                        {formatDate(slot.startAt)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
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
