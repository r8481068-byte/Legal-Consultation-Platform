import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCurrentUser,
  updateClientAddress,
  updateClientIdentity,
  getClientProfileCompletion,
} from "../services/authService";
import {
  ShieldCheck,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other UT",
];

export default function ClientProfileCompletion() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "Delhi NCR",
    district: "",
    subDistrict: "",
    locality: "",
    cityVillage: "",
    pincode: "",
    addressLine: "",
  });

  // Identity Form State
  const [identityForm, setIdentityForm] = useState({
    aadhaar: "",
    pan: "",
  });

  const [completeness, setCompleteness] = useState({
    percentage: 0,
    isComplete: false,
    completedFields: [],
    missingFields: [],
    missingLabels: [],
  });

  const [identityStatus, setIdentityStatus] = useState({
    hasAadhaar: false,
    hasPan: false,
    aadhaarMasked: null,
    panMasked: null,
    isComplete: false,
  });

  useEffect(() => {
    // Check if user came from a pending booking flow
    const pendingConsultation = sessionStorage.getItem("pendingConsultation");
    if (pendingConsultation) {
      setHasPendingBooking(true);
    }

    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, completionRes] = await Promise.all([
          getCurrentUser(),
          getClientProfileCompletion(),
        ]);

        const u = profileRes.user || {};
        setAddressForm({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          state: u.state || "Delhi NCR",
          district: u.district || "",
          subDistrict: u.subDistrict || "",
          locality: u.locality || "",
          cityVillage: u.cityVillage || "",
          pincode: u.pincode || "",
          addressLine: u.addressLine || "",
        });

        if (completionRes.profileCompleteness) {
          setCompleteness(completionRes.profileCompleteness);
        }
        if (completionRes.identityStatus) {
          setIdentityStatus(completionRes.identityStatus);
        }
      } catch (err) {
        setError(err.message || "Failed to load client profile details.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIdentityChange = (e) => {
    const { name, value } = e.target;
    setIdentityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setError("");
    setSuccess("");

    if (!addressForm.pincode || !/^[1-9][0-9]{5}$/.test(addressForm.pincode.trim())) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      setSavingAddress(false);
      return;
    }

    try {
      const res = await updateClientAddress({
        state: addressForm.state,
        district: addressForm.district,
        subDistrict: addressForm.subDistrict,
        locality: addressForm.locality,
        cityVillage: addressForm.cityVillage,
        pincode: addressForm.pincode.trim(),
        addressLine: addressForm.addressLine.trim(),
      });

      if (res.completeness) {
        setCompleteness(res.completeness);
      }
      setSuccess("Address details updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update address details.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setSavingIdentity(true);
    setError("");
    setSuccess("");

    const cleanAadhaar = identityForm.aadhaar.replace(/[\s\-]/g, "");
    if (!/^[2-9]\d{11}$/.test(cleanAadhaar)) {
      setError("Aadhaar must be a 12-digit number (cannot start with 0 or 1).");
      setSavingIdentity(false);
      return;
    }

    const cleanPan = identityForm.pan.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setError("PAN format must be 10 characters (e.g., ABCDE1234F).");
      setSavingIdentity(false);
      return;
    }

    try {
      const res = await updateClientIdentity({
        aadhaar: cleanAadhaar,
        pan: cleanPan,
      });

      if (res.identityStatus) {
        setIdentityStatus(res.identityStatus);
      }
      setIdentityForm({ aadhaar: "", pan: "" });
      setSuccess("Identity documents recorded and encrypted securely!");
    } catch (err) {
      setError(err.message || "Failed to record identity documents.");
    } finally {
      setSavingIdentity(false);
    }
  };

  const allReadyForBooking = completeness.isComplete && identityStatus.isComplete;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-xs font-bold text-blue-800 hover:underline">
            ← Back to Dashboard
          </Link>

          {hasPendingBooking && (
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100"
            >
              <Calendar className="h-3.5 w-3.5" /> Return to Pending Booking
            </Link>
          )}
        </div>

        {/* Hero Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Booking Eligibility Gate
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Complete Your Client Profile
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Before consulting an advocate, statutory compliance requires verified contact information, current residential address details, and identity format validation.
              </p>
            </div>

            {/* Profile Completion Meter */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[180px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Profile Completeness
              </span>
              <div className="mt-2 text-3xl font-black text-amber-300">
                {completeness.percentage}%
              </div>
              <div className="mt-2 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-blue-200">
                {completeness.isComplete ? "All address fields complete" : `${completeness.missingFields.length} field(s) remaining`}
              </p>
            </div>
          </div>
        </div>

        {/* Notification alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-800 border border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Ready to Book Banner */}
        {allReadyForBooking && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:flex sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-base">Eligibility Check Succeeded!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Your profile is 100% complete and identity compliance requirements are satisfied. You may now book legal consultations.
              </p>
            </div>

            <Link
              to={hasPendingBooking ? "/book-appointment" : "/lawyers"}
              className="mt-3 sm:mt-0 inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm"
            >
              {hasPendingBooking ? "Continue Booking Slot →" : "Browse Advocates →"}
            </Link>
          </div>
        )}

        {/* SECTION 1: RESIDENTIAL ADDRESS FORM */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-900" /> 1. Client Contact & Address Details
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Registration details are prefilled. Enter your current residential address.
              </p>
            </div>

            {completeness.isComplete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Address Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                Incomplete
              </span>
            )}
          </div>

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            {/* Prefilled Non-Editable Registration Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name (Prefilled)
                </label>
                <input
                  type="text"
                  value={addressForm.name}
                  disabled
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="text"
                  value={addressForm.email}
                  disabled
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number (Verified)
                </label>
                <input
                  type="text"
                  value={addressForm.phone}
                  disabled
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address Line */}
            <div>
              <label htmlFor="addressLine" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Flat / House / Building / Street Address *
              </label>
              <input
                id="addressLine"
                name="addressLine"
                type="text"
                value={addressForm.addressLine}
                onChange={handleAddressChange}
                required
                minLength={5}
                maxLength={250}
                placeholder="e.g. 42B, Shanti Niketan, Ring Road"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Area & Locality + City / Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locality" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Area / Locality *
                </label>
                <input
                  id="locality"
                  name="locality"
                  type="text"
                  value={addressForm.locality}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. South Extension Part II"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="cityVillage" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City or Village *
                </label>
                <input
                  id="cityVillage"
                  name="cityVillage"
                  type="text"
                  value={addressForm.cityVillage}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. New Delhi"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Sub-District + District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="subDistrict" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Block / Tehsil / Sub-District *
                </label>
                <input
                  id="subDistrict"
                  name="subDistrict"
                  type="text"
                  value={addressForm.subDistrict}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. Hauz Khas"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  value={addressForm.district}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. South Delhi"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* State + PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State / Union Territory *
                </label>
                <select
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pincode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6-Digit Indian PIN Code *
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  required
                  placeholder="110049"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingAddress}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {savingAddress ? "Saving Address..." : "Save Address Details"}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: AADHAAR & PAN IDENTITY GATE */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-700" /> 2. Mandatory Identity Verification (Aadhaar & PAN)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Required by platform policy prior to consultation confirmation to guarantee bona fide client identification.
              </p>
            </div>

            {identityStatus.isComplete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Identity Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                Identity Pending
              </span>
            )}
          </div>

          {/* Privacy & Compliance Disclaimer */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
              <span>Privacy & Encryption at Rest Policy</span>
            </div>
            <p className="leading-relaxed text-blue-900/90 text-[11px]">
              Aadhaar and PAN details are encrypted at rest with hardware-backed AES-256-GCM. Raw document numbers are <strong>never stored in plaintext</strong>, never logged, and never returned in full through public APIs. Values are permanently masked (e.g. <code>XXXX-XXXX-1234</code> and <code>XXXXX1234F</code>).
            </p>
            <p className="text-[10px] text-blue-800 font-medium">
              * Note: Submission performs cryptographic format and Luhn/checksum validation. Platform records adhere to India Information Technology (Reasonable Security Practices) Rules, 2011.
            </p>
          </div>

          {/* Already Saved Status Badges */}
          {(identityStatus.hasAadhaar || identityStatus.hasPan) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Aadhaar Document Status
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {identityStatus.aadhaarMasked || "Not Provided"}
                  </span>
                  {identityStatus.hasAadhaar && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      ✓ Format Validated
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  PAN Document Status
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {identityStatus.panMasked || "Not Provided"}
                  </span>
                  {identityStatus.hasPan && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      ✓ Format Validated
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Identity Update Form */}
          <form onSubmit={handleIdentitySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="aadhaar" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  12-Digit Aadhaar Number *
                </label>
                <input
                  id="aadhaar"
                  name="aadhaar"
                  type="text"
                  maxLength={14}
                  value={identityForm.aadhaar}
                  onChange={handleIdentityChange}
                  required
                  placeholder={identityStatus.hasAadhaar ? "Update 12-digit number" : "e.g. 5432 1098 7654"}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  12 digits without spaces or hyphens. Will be masked as XXXX-XXXX-1234.
                </p>
              </div>

              <div>
                <label htmlFor="pan" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Permanent Account Number (PAN) *
                </label>
                <input
                  id="pan"
                  name="pan"
                  type="text"
                  maxLength={10}
                  value={identityForm.pan}
                  onChange={handleIdentityChange}
                  required
                  placeholder={identityStatus.hasPan ? "Update 10-char PAN" : "e.g. ABCDE1234F"}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono uppercase outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  10 alphanumeric characters. Will be masked as XXXXX1234F.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingIdentity}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-950 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-900 disabled:opacity-50"
              >
                {savingIdentity ? "Encrypting & Saving..." : "Save Identity Information"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
