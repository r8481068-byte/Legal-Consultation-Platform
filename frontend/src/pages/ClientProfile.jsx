import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCurrentUser,
  updateProfile,
  updateClientAddress,
  updateClientIdentity,
  changePassword,
} from "../services/authService";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  X,
  Loader2,
  FileText,
  UserCheck,
  Save,
  KeyRound,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";

// Safe date helper functions
const safeFormatDateForInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const safeFormatDateForDisplay = (val) => {
  if (!val) return "Not specified";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "Not specified" : d.toLocaleDateString("en-IN", { dateStyle: "medium" });
};

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingBooking, setPendingBooking] = useState(null);
  const [profileData, setProfileData] = useState(() => user || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Section Edit Modals / Form toggles
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states initialized with existing user session data
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    dob: safeFormatDateForInput(user?.dob),
    state: user?.state || "",
    district: user?.district || "",
    subDistrict: user?.subDistrict || "",
    locality: user?.locality || "",
    cityVillage: user?.cityVillage || "",
    pincode: user?.pincode || "",
    addressLine: user?.addressLine || "",
  });

  const [aboutText, setAboutText] = useState(user?.about || "");
  const [identityForm, setIdentityForm] = useState({
    aadhaar: "",
    pan: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Profile Image Upload
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateUserRef = useRef(updateUser);
  useEffect(() => {
    updateUserRef.current = updateUser;
  }, [updateUser]);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getCurrentUser();
      if (res?.user) {
        const u = res.user;
        setProfileData(u);

        // Populate forms safely
        setPersonalForm({
          name: u.name || "",
          phone: u.phone || "",
          gender: u.gender || "",
          dob: safeFormatDateForInput(u.dob),
          state: u.state || "",
          district: u.district || "",
          subDistrict: u.subDistrict || "",
          locality: u.locality || "",
          cityVillage: u.cityVillage || "",
          pincode: u.pincode || "",
          addressLine: u.addressLine || "",
        });

        setAboutText(u.about || "");

        updateUserRef.current?.(u);
      }
    } catch (err) {
      setError(err.message || "Unable to load client profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (location.state?.fromBooking) {
      setPendingBooking({
        lawyerId: location.state.lawyerId,
        lawyerName: location.state.lawyerName,
        message: location.state.message,
      });
    } else {
      try {
        const stored = sessionStorage.getItem("pendingConsultation");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.lawyerId || parsed.lawyerName)) {
            setPendingBooking(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [location.state]);

  const showNotification = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4500);
  };

  // Image Upload Handler
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size cannot exceed 2MB.");
      return;
    }

    setError("");
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await updateProfile({ profileImage: base64Data });

        if (res?.user) {
          setProfileData((prev) => ({
            ...prev,
            profileImage: res.user.profileImage,
          }));

          if (updateUser) {
            updateUser({ profileImage: res.user.profileImage });
          }

          showNotification("Profile image updated successfully!");
        }
      } catch (err) {
        setError(err.message || "Failed to upload profile photo.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save Personal Info
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updates = {};

      if (personalForm.name.trim()) {
        updates.name = personalForm.name.trim();
      }
      if (personalForm.phone.trim()) {
        updates.phone = personalForm.phone.trim();
      }
      if (personalForm.gender !== undefined) {
        updates.gender = personalForm.gender || null;
      }
      if (personalForm.dob !== undefined) {
        updates.dob = personalForm.dob ? new Date(personalForm.dob) : null;
      }

      // Address fields
      const addressKeys = [
        "state",
        "district",
        "subDistrict",
        "locality",
        "cityVillage",
        "pincode",
        "addressLine",
      ];
      for (const key of addressKeys) {
        if (personalForm[key] !== undefined && personalForm[key] !== "") {
          updates[key] = personalForm[key].trim();
        }
      }

      const res = await updateProfile(updates);

      if (res?.user) {
        setProfileData((prev) => ({
          ...prev,
          ...res.user,
        }));

        if (updateUser) {
          updateUser(res.user);
        }
      }

      showNotification("Personal and address information saved successfully!");
      setIsEditingPersonal(false);
      await loadUserProfile();
    } catch (err) {
      setError(err.message || "Failed to update personal information.");
    } finally {
      setSaving(false);
    }
  };

  // Save About Me
  const handleSaveAbout = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await updateProfile({ about: aboutText.trim() });
      if (res?.user) {
        setProfileData((prev) => ({ ...prev, about: res.user.about }));
        if (updateUser) {
          updateUser({ about: res.user.about });
        }
        showNotification("About Me section updated successfully!");
        setIsEditingAbout(false);
      }
    } catch (err) {
      setError(err.message || "Failed to update About Me introduction.");
    } finally {
      setSaving(false);
    }
  };

  // Save Identity (Aadhaar & PAN)
  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const cleanAadhaar = identityForm.aadhaar.trim();
      const cleanPan = identityForm.pan.trim().toUpperCase();

      if (!cleanAadhaar || !cleanPan) {
        throw new Error("Both Aadhaar number and PAN number are required.");
      }

      const res = await updateClientIdentity({
        aadhaar: cleanAadhaar,
        pan: cleanPan,
      });

      if (res?.identityStatus || res?.user) {
        setProfileData((prev) => ({
          ...prev,
          aadhaarMasked: res.identityStatus?.aadhaarMasked || res.user?.aadhaarMasked || prev?.aadhaarMasked,
          panMasked: res.identityStatus?.panMasked || res.user?.panMasked || prev?.panMasked,
        }));
      }

      showNotification("Identity documents securely submitted and encrypted.");
      setIsEditingIdentity(false);
      setIdentityForm({ aadhaar: "", pan: "" });
      await loadUserProfile();
    } catch (err) {
      setError(err.message || "Failed to submit identity documents.");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showNotification("Account password updated successfully!");
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const clientName = profileData?.name || user?.name || "Client";
  const initials = clientName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "C";

  const completeness = profileData?.completeness?.percentage ??
    (profileData?.pincode && profileData?.state ? 100 : 70);

  // Status badge rule: ONLY display "Certified Client" if genuinely verified (e.g. isCertified === true)
  const isGenuinelyCertified = Boolean(profileData?.isCertified);
  const isProfileComplete = completeness === 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Notifications */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={loadUserProfile}
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
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

          {/* Pending Consultation / 100% Profile Completion Gate Notice */}
          {pendingBooking && (
            <div
              className={`rounded-3xl border p-5 shadow-xs transition-all ${
                isProfileComplete
                  ? "border-emerald-300 bg-emerald-50/80 text-emerald-950"
                  : "border-amber-300 bg-amber-50/90 text-amber-950"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                      isProfileComplete
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {isProfileComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-snug">
                      {isProfileComplete
                        ? "Profile 100% Complete! You can now book your consultation."
                        : `100% Profile Completion Required to Book Consultation`}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {isProfileComplete ? (
                        <>
                          Your client credentials and Indian address details meet all legal compliance standards. Continue booking your appointment with{" "}
                          <span className="font-semibold text-slate-900">
                            Advocate {pendingBooking.lawyerName || "your selected lawyer"}
                          </span>.
                        </>
                      ) : (
                        <>
                          You were redirected here because booking an appointment with{" "}
                          <span className="font-semibold text-slate-900">
                            Advocate {pendingBooking.lawyerName || "your selected lawyer"}
                          </span>{" "}
                          requires your profile to be 100% completed. Currently at{" "}
                          <span className="font-bold text-amber-800">{completeness}%</span>. Please complete any missing personal, address, and identity fields below.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {isProfileComplete ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = pendingBooking.lawyerId;
                        navigate(targetId ? `/book-appointment?lawyerId=${targetId}` : "/book-appointment", {
                          state: pendingBooking,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                    >
                      Return to Advocate & Continue Booking
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setPendingBooking(null);
                      sessionStorage.removeItem("pendingConsultation");
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition"
                    title="Dismiss alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* A. PROFILE HEADER CARD                                                    */}
          {/* ========================================================================= */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Large Client Profile Image */}
                <div className="relative shrink-0 flex flex-col items-center gap-2">
                  <div className="relative">
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt={clientName}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-navy via-navy-light to-royal text-white flex items-center justify-center font-heading font-black text-3xl sm:text-4xl border-2 border-slate-200 shadow-xs ${
                        profileData?.profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Change Photo Trigger */}
                    <label
                      htmlFor="profile-header-photo-input"
                      className="cursor-pointer absolute -bottom-1 -right-1 rounded-full bg-navy p-2 text-white shadow-xs hover:bg-navy-light transition"
                      title="Upload New Profile Image"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Camera className="h-4 w-4 text-gold" />
                      )}
                      <input
                        id="profile-header-photo-input"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Profile Header Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
                      {clientName}
                    </h1>

                    <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-navy border border-blue-200 uppercase">
                      Client
                    </span>

                    {/* Appropriate Status Badge */}
                    {isGenuinelyCertified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Certified Client
                      </span>
                    ) : isProfileComplete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-royal border border-blue-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-royal" /> Profile Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <Clock className="h-3.5 w-3.5 text-amber-600" /> Profile in Progress
                      </span>
                    )}
                  </div>

                  {/* Short Introduction if available */}
                  {profileData?.about ? (
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-xl italic">
                      "{profileData.about}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Registered LegalConnect Client
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {profileData?.email || user?.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {profileData?.phone || "Mobile not provided"}
                    </span>
                  </div>

                  {/* Profile Completion Indicator */}
                  <div className="pt-2 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-500">Profile Completion:</span>
                      <span className="font-extrabold text-navy">{completeness}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-navy via-navy-light to-royal transition-all duration-500"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition shrink-0"
              >
                <Edit3 className="h-3.5 w-3.5 text-gold" />
                <span>{isEditingPersonal ? "Cancel Edit" : "Edit Profile"}</span>
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* B. PERSONAL INFORMATION SECTION                                           */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-900" />
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your personal details and registered residential address.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditingPersonal ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditingPersonal ? (
              /* Editable Personal Info Form */
              <form onSubmit={handleSavePersonal} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.name}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileData?.email || ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={personalForm.phone}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, gender: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={personalForm.dob}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, dob: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Address Line
                    </label>
                    <input
                      type="text"
                      placeholder="House / Flat / Street address"
                      value={personalForm.addressLine}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, addressLine: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Village *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.cityVillage}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, cityVillage: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.locality}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, locality: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Block / Sub-District *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.subDistrict}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, subDistrict: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.district}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, district: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra, Delhi, Karnataka"
                      value={personalForm.state}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, state: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={personalForm.pincode}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, pincode: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode: Section-wise Grid */
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">{clientName}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Email Address</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {profileData?.email || user?.email}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Mobile Number</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.phone || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Gender</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {profileData?.gender ? profileData.gender.replace(/_/g, " ") : "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Date of Birth</span>
                  <span className="font-bold text-slate-900">
                    {safeFormatDateForDisplay(profileData?.dob)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Address Line</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.addressLine || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">City / Village</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.cityVillage || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Locality / Area</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.locality || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">Block / Sub-District</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.subDistrict || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">District</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.district || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">State</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.state || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-400 block mb-1">PIN Code</span>
                  <span className="font-bold text-slate-900">
                    {profileData?.pincode || "Not specified"}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* C. IDENTITY INFORMATION SECTION                                           */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-900" />
                  Identity Information & Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Stored securely with AES-256-GCM encryption at rest. Never exposed publicly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingIdentity(!isEditingIdentity)}
                className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditingIdentity ? "Cancel" : profileData?.aadhaarMasked ? "Update" : "Provide"}
              </button>
            </div>

            {/* Display Masked Numbers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                <span className="text-xs font-semibold text-slate-500">Aadhaar Card Number</span>
                <p className="text-sm font-mono font-bold text-slate-900">
                  {profileData?.aadhaarMasked || "Not Provided"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Format: XXXX-XXXX-1234 (Always masked in responses)
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                <span className="text-xs font-semibold text-slate-500">PAN Card Number</span>
                <p className="text-sm font-mono font-bold text-slate-900">
                  {profileData?.panMasked || "Not Provided"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Format: XXXXX1234F (Always masked in responses)
                </p>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex items-start gap-3 text-xs text-blue-900">
              <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Identity Verification Notice</span>
                <p className="text-blue-800 leading-relaxed mt-0.5">
                  {isGenuinelyCertified
                    ? "Your identity documents have been genuinely verified by administrative compliance."
                    : "Your identity details are recorded securely and encrypted. Format verification has passed. Full UIDAI/NSDL certification badge is reserved for official identity compliance."}
                </p>
              </div>
            </div>

            {/* Edit Identity Form */}
            {isEditingIdentity && (
              <form onSubmit={handleSaveIdentity} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Submit or Update Identity Numbers
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      12-Digit Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456789012"
                      maxLength={14}
                      value={identityForm.aadhaar}
                      onChange={(e) =>
                        setIdentityForm({ ...identityForm, aadhaar: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      10-Character PAN Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      value={identityForm.pan}
                      onChange={(e) =>
                        setIdentityForm({ ...identityForm, pan: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingIdentity(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    <span>Encrypt & Save Identity</span>
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ========================================================================= */}
          {/* D. ABOUT ME SECTION                                                       */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-900" />
                  About Me
                </h2>
                <p className="text-xs text-slate-500">
                  Share a brief summary of yourself, your background, or what legal help you require.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAbout(!isEditingAbout)}
                className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditingAbout ? "Cancel" : profileData?.about ? "Edit About Me" : "Add About Me"}
              </button>
            </div>

            {isEditingAbout ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={5}
                    maxLength={1000}
                    placeholder="Write something about yourself, your background, or what kind of legal assistance you are looking for."
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none leading-relaxed"
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400">
                    {aboutText.length} / 1000 characters
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAbout(false);
                      setAboutText(profileData?.about || "");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAbout}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save About Me</span>
                  </button>
                </div>
              </div>
            ) : profileData?.about ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {profileData.about}
              </div>
            ) : (
              /* Empty state placeholder */
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  "Write something about yourself, your background, or what kind of legal assistance you are looking for."
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(true)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-900 px-4 py-1.5 text-xs font-semibold transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Write Introduction</span>
                </button>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* E. OTHER EXISTING SECTIONS: Security & Password                          */}
          {/* ========================================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-900" />
                  Account Security & Password
                </h2>
                <p className="text-xs text-slate-500">
                  Update your login credentials and view authentication security settings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                {isChangingPassword ? "Cancel" : "Change Password"}
              </button>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                  <span className="text-[11px] text-slate-400">Must be at least 6 characters</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Password & Authentication</span>
                  <p className="text-slate-500 mt-0.5">
                    Your password was last updated securely. Direct session login is active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Change Password
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
