import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser, updateProfile } from "../services/authService";
import { getMyAppointments } from "../services/appointmentService";
import Navbar from "../components/Navbar";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
  Calendar,
  Briefcase,
  ShieldCheck,
  User,
  Settings,
  ArrowRight,
  Search,
  FileText,
  Clock,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  X,
  UploadCloud,
  Loader2,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Profile Image Upload Modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const updateUserRef = useRef(updateUser);
  useEffect(() => {
    updateUserRef.current = updateUser;
  }, [updateUser]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userRes, apptRes] = await Promise.allSettled([
        getCurrentUser(),
        getMyAppointments(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.user) {
        setProfileData(userRes.value.user);
        // Sync context
        updateUserRef.current?.(userRes.value.user);
      }

      if (apptRes.status === "fulfilled" && Array.isArray(apptRes.value)) {
        setAppointments(apptRes.value);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Client Information
  const clientName = profileData?.name || user?.name || "Client";
  const clientEmail = profileData?.email || user?.email || "";
  const clientPhone = profileData?.phone || user?.phone || "Not provided";
  const clientImage = profileData?.profileImage || user?.profileImage || null;

  const initials = clientName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "C";

  // Profile Completeness calculation
  const completeness = profileData?.completeness?.percentage ??
    (profileData?.pincode && profileData?.state ? 100 : 70);

  const isGenuinelyCertified = Boolean(profileData?.isCertified);
  const isProfileComplete = completeness === 100;

  // Appointment counts from actual MongoDB data
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" && new Date(a.scheduledAt) > new Date()
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );
  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending"
  );

  // Profile Image Selection Handler
  const handleFileSelect = (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setImageModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Profile Image Save Handler
  const handleSaveProfileImage = async () => {
    if (!previewImage) return;

    setUploading(true);
    setUploadError("");

    try {
      const response = await updateProfile({ profileImage: previewImage });

      if (response?.user) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: response.user.profileImage,
        }));

        if (updateUser) {
          updateUser({ profileImage: response.user.profileImage });
        }

        setSuccessMessage("Profile photo updated successfully!");
        setImageModalOpen(false);
        setPreviewImage(null);

        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error(response?.message || "Failed to update profile photo.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload profile photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onOpenProfileSettings={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Success Banner */}
          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {successMessage}
              </span>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CLIENT PROFILE CARD */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Profile Image with Edit Profile Image button directly underneath */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative">
                    {clientImage ? (
                      <img
                        src={clientImage}
                        alt={clientName}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#101C3A] to-[#2457D6] text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl border border-slate-200 shadow-2xs ${
                        clientImage ? "hidden" : "flex"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Verification Indicator Icon */}
                    {isGenuinelyCertified ? (
                      <div
                        className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white ring-2 ring-white shadow-2xs"
                        title="Certified Client"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    ) : isProfileComplete ? (
                      <div
                        className="absolute -bottom-1 -right-1 rounded-full bg-[#2457D6] p-1 text-white ring-2 ring-white shadow-2xs"
                        title="Profile Complete"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : null}
                  </div>

                  {/* Edit Profile Image Button immediately below */}
                  <label
                    htmlFor="client-photo-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2457D6] bg-slate-100 hover:bg-blue-50 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs transition"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Edit Photo</span>
                    <input
                      id="client-photo-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {/* Client Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {clientName}
                    </h1>

                    {/* Client Role Badge */}
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2457D6] border border-blue-200 uppercase">
                      Client
                    </span>

                    {/* Suitable Client Status Badge */}
                    {isGenuinelyCertified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5" /> Certified Client
                      </span>
                    ) : isProfileComplete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2457D6] border border-blue-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Profile Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" /> Profile in Progress
                      </span>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-0.5">
                    <span className="truncate">
                      <strong>Email:</strong> {clientEmail}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Phone:</strong> {clientPhone}
                    </span>
                    {profileData?.cityVillage && (
                      <>
                        <span>•</span>
                        <span>
                          <strong>Location:</strong> {profileData.cityVillage}, {profileData.state}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="pt-2 max-w-sm">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">Profile Completion</span>
                      <span className="font-bold text-[#2457D6]">{completeness}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2457D6] to-indigo-600 transition-all duration-500"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DASHBOARD SUMMARY KPI CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Total Appointments */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-blue-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Appointments
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2457D6]">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="font-heading mt-4 text-3xl font-black text-slate-900">
                {totalAppointments}
              </p>
              <p className="mt-1 text-xs text-slate-400">Total sessions booked</p>
            </div>

            {/* 2. Upcoming Appointments */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Upcoming
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="font-heading mt-4 text-3xl font-black text-emerald-700">
                {upcomingAppointments.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Confirmed & upcoming</p>
            </div>

            {/* 3. Completed Consultations */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-purple-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Completed
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="font-heading mt-4 text-3xl font-black text-purple-700">
                {completedAppointments.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Successfully conducted</p>
            </div>

            {/* 4. Pending Appointment Requests */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Pending Requests
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="font-heading mt-4 text-3xl font-black text-amber-600">
                {pendingAppointments.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Awaiting lawyer confirmation</p>
            </div>
          </section>

          {/* Recent Appointments Preview */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Recent Appointment History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest consultations booked under your client account.
                </p>
              </div>
              <Link
                to="/my-appointments"
                className="text-xs font-bold text-[#2457D6] hover:underline"
              >
                View All →
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No appointments scheduled yet.</p>
                <p className="mt-1">Book your first legal consultation with a verified advocate.</p>
                <Link
                  to="/client/lawyers"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2457D6] px-4 py-2 font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                >
                  <Search className="h-3.5 w-3.5" /> Find Advocate
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map((appt) => {
                  const lawyerName = appt.lawyer?.user?.name || "Verified Counsel";
                  const lawyerImage = appt.lawyer?.user?.profileImage;
                  return (
                    <div
                      key={appt._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {lawyerImage ? (
                          <img
                            src={lawyerImage}
                            alt={lawyerName}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B132B] text-white font-bold text-xs shadow-2xs">
                            {lawyerName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-heading text-xs sm:text-sm font-bold text-slate-900">
                            Advocate {lawyerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(appt.scheduledAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}{" "}
                            • <span className="capitalize">{appt.consultationType}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                            appt.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : appt.status === "pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : appt.status === "completed"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {appt.status}
                        </span>
                        <Link
                          to="/my-appointments"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* PROFILE IMAGE UPLOAD & PREVIEW MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#2457D6]" />
                Edit Profile Image
              </h3>
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setPreviewImage(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Image Preview Box */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-36 w-36 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-[#2457D6] p-2 text-white shadow-md hover:bg-blue-700 transition"
                    title="Choose different photo"
                  >
                    <UploadCloud className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setPreviewImage(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfileImage}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2457D6] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile Image</span>
                )}
              </button>
            </div>
          </div>
        </div>
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
