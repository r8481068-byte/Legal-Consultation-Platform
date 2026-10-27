import { useState, useEffect } from "react";
import { getAuthorizedClientDetail } from "../services/lawyerService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Video,
  FileText,
  MessageSquare,
  ShieldCheck,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ClientDetailModal({
  clientId,
  isOpen,
  onClose,
  onOpenChat,
  onOpenDocuments,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !clientId) {
      setData(null);
      setError("");
      return;
    }

    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError("");
      try {
        const res = await getAuthorizedClientDetail(clientId);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load client profile details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const client = data?.client || {};
  const appointments = data?.appointments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700/60 text-white font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Client Professional File</h2>
              <p className="text-xs text-blue-200">Authorized Consultation Record</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
              <p className="text-sm font-semibold">Loading verified client details...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Client Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
                {client.profileImage ? (
                  <img
                    src={client.profileImage}
                    alt={client.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-900 text-2xl font-bold text-white shadow-xs">
                    {client.name ? client.name.charAt(0).toUpperCase() : "C"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {client.name || "Client"}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Client
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                    {client.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </p>
                    )}
                    {client.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </p>
                    )}
                    {(client.cityVillage || client.state) && (
                      <p className="flex items-center gap-1.5 truncate sm:col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {[client.cityVillage, client.district, client.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultation History with this Lawyer */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-700" />
                    Consultation History With You ({appointments.length})
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Member since{" "}
                    {client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>

                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No consultation records found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((app) => {
                      const isVideo = app.consultationType === "video";
                      return (
                        <div
                          key={app._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {new Date(app.scheduledAt).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="capitalize flex items-center gap-1 text-slate-600">
                                {isVideo ? <Video className="h-3 w-3 text-blue-700" /> : null}
                                {app.consultationType} ({app.durationMinutes || 30}m)
                              </span>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                app.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : app.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          {app.notes && (
                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                              <span className="font-semibold text-slate-700">Client Note: </span>
                              <span>{app.notes}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
