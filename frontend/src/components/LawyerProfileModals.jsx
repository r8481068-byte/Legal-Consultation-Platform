import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Scale,
  GraduationCap,
  Award,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Clock,
  Globe,
  Building2,
  BookOpen,
} from "lucide-react";
import { updateLawyerProfile } from "../services/lawyerService";

// =========================================================================
// SECTION 1: EDIT BASIC DETAILS MODAL
// =========================================================================
export function EditBasicDetailsModal({
  isOpen,
  onClose,
  lawyerProfile,
  onSaveSuccess,
  onUserUpdated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    consultationFee: 0,
    consultationDuration: 30,
    languages: "English",
    officeAddress: "",
    city: "",
    district: "",
    state: "",
    headline: "",
    designation: "Advocate",
    hidePhone: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (lawyerProfile) {
      setFormData({
        name: lawyerProfile?.user?.name || "",
        phone: lawyerProfile?.phone || lawyerProfile?.user?.phone || "",
        consultationFee: lawyerProfile?.consultationFee ?? 0,
        consultationDuration: lawyerProfile?.consultationDuration || 30,
        languages: Array.isArray(lawyerProfile?.languages)
          ? lawyerProfile.languages.join(", ")
          : "English",
        officeAddress: lawyerProfile?.officeAddress || "",
        city: lawyerProfile?.city || "",
        district: lawyerProfile?.district || "",
        state: lawyerProfile?.state || "",
        headline: lawyerProfile?.headline || "",
        designation: lawyerProfile?.designation || "Advocate",
        hidePhone: Boolean(lawyerProfile?.hidePhone),
      });
      setError("");
      setSuccess("");
    }
  }, [lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please provide a valid full name (at least 2 characters).");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please provide your primary practice city / location.");
      return;
    }

    const fee = Number(formData.consultationFee);
    if (isNaN(fee) || fee < 0) {
      setError("Consultation fee must be a valid number of ₹0 or higher.");
      return;
    }

    setLoading(true);
    try {
      const languagesArray = formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        consultationFee: fee,
        consultationDuration: Number(formData.consultationDuration) || 30,
        languages: languagesArray.length > 0 ? languagesArray : ["English"],
        officeAddress: formData.officeAddress.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        headline: formData.headline.trim(),
        designation: formData.designation.trim() || "Advocate",
        hidePhone: Boolean(formData.hidePhone),
      };

      const updated = await updateLawyerProfile(payload);
      if (onUserUpdated && updated?.user) {
        onUserUpdated(updated.user);
      }
      setSuccess("Basic details updated successfully!");
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update basic details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Update Basic Details
              </h2>
              <p className="text-xs text-slate-500">
                Personal identity, consultation fee, available time, and contact information
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Rajesh Kumar"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Email (Read Only Display) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Account Login)</span>
              </label>
              <input
                type="email"
                value={lawyerProfile?.user?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 pl-8.5 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Fee (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({ ...formData, consultationFee: e.target.value })
                  }
                  placeholder="e.g. 1500"
                  required
                  className="w-full rounded-xl border border-slate-200 pl-8.5 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            {/* Consultation Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Duration / Available Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={formData.consultationDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationDuration: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 pl-8.5 pr-3 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes (Standard)</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 Hour)</option>
                </select>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Languages Spoken
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  placeholder="English, Hindi, Bengali"
                  className="w-full rounded-xl border border-slate-200 pl-8.5 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Location & Address Section */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              Location & Chambers Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  City / Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. New Delhi"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  placeholder="e.g. South Delhi"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="e.g. Delhi"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Office / Chamber Street Address
              </label>
              <input
                type="text"
                value={formData.officeAddress}
                onChange={(e) =>
                  setFormData({ ...formData, officeAddress: e.target.value })
                }
                placeholder="e.g. Chamber No. 412, Lawyers Block, High Court Complex"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          {/* Headline & Designation */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                placeholder="e.g. Advocate / Senior Counsel"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) =>
                  setFormData({ ...formData, headline: e.target.value })
                }
                placeholder="e.g. Specialist in Criminal Appeals & Constitutional Litigation"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          {/* Privacy Option */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.hidePhone}
                onChange={(e) =>
                  setFormData({ ...formData, hidePhone: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Keep phone number private (visible only after appointment booking)</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Basic Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 2: EDIT SPECIALIZATION & PRACTICE AREA MODAL
// =========================================================================
const DEFAULT_SPECIALIZATIONS = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Law",
  "Family & Matrimonial Law",
  "Constitutional Law",
  "Intellectual Property (IPR)",
  "Cyber Law",
  "Taxation & GST",
  "Real Estate & Property",
  "Banking & Finance",
  "Labour & Employment Law",
  "Arbitration & Dispute Resolution",
  "Immigration Law",
  "Consumer Protection",
];

const COURT_LEVELS_OPTIONS = [
  "District Court",
  "High Court",
  "Supreme Court",
  "Tribunal",
];

export function EditSpecializationModal({
  isOpen,
  onClose,
  lawyerProfile,
  onSaveSuccess,
}) {
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [secondarySpecs, setSecondarySpecs] = useState("");
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [jurisdictionsText, setJurisdictionsText] = useState("");
  const [customSpecInput, setCustomSpecInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (lawyerProfile) {
      setSelectedSpecializations(
        Array.isArray(lawyerProfile?.specialization)
          ? lawyerProfile.specialization
          : []
      );
      setSecondarySpecs(
        Array.isArray(lawyerProfile?.secondarySpecializations)
          ? lawyerProfile.secondarySpecializations.join(", ")
          : ""
      );
      setSelectedCourts(
        Array.isArray(lawyerProfile?.courtLevels)
          ? lawyerProfile.courtLevels
          : ["District Court", "High Court"]
      );
      setJurisdictionsText(
        Array.isArray(lawyerProfile?.jurisdictions)
          ? lawyerProfile.jurisdictions.join(", ")
          : ""
      );
      setError("");
      setSuccess("");
    }
  }, [lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const toggleSpecialization = (spec) => {
    if (selectedSpecializations.includes(spec)) {
      if (selectedSpecializations.length === 1) {
        setError("At least one primary specialization is required.");
        return;
      }
      setSelectedSpecializations(
        selectedSpecializations.filter((item) => item !== spec)
      );
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
    setError("");
  };

  const handleAddCustomSpec = (e) => {
    e.preventDefault();
    const trimmed = customSpecInput.trim();
    if (trimmed && !selectedSpecializations.includes(trimmed)) {
      setSelectedSpecializations([...selectedSpecializations, trimmed]);
      setCustomSpecInput("");
    }
  };

  const toggleCourtLevel = (court) => {
    if (selectedCourts.includes(court)) {
      setSelectedCourts(selectedCourts.filter((c) => c !== court));
    } else {
      setSelectedCourts([...selectedCourts, court]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (selectedSpecializations.length === 0) {
      setError("Please select at least one primary specialization.");
      return;
    }

    setLoading(true);
    try {
      const secondaryArray = secondarySpecs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const jurisdictionsArray = jurisdictionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        specialization: selectedSpecializations,
        secondarySpecializations: secondaryArray,
        courtLevels: selectedCourts,
        jurisdictions: jurisdictionsArray,
      };

      const updated = await updateLawyerProfile(payload);
      setSuccess("Specializations & practice areas updated successfully!");
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update specializations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Update Specialization & Practice Area
              </h2>
              <p className="text-xs text-slate-500">
                Manage primary practice domains, legal expertise, and court admissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* Primary Specializations */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Primary Specializations & Practice Areas <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Click to select or deselect your main areas of legal practice (minimum 1 required):
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_SPECIALIZATIONS.map((spec) => {
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>

            {/* Custom Specialization Tag Adder */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSpecInput}
                onChange={(e) => setCustomSpecInput(e.target.value)}
                placeholder="Add other specialization..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddCustomSpec}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                + Add Custom
              </button>
            </div>
          </div>

          {/* Other / Secondary Specializations */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Other / Secondary Specializations
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Comma-separated list of secondary practice areas and niche advisory expertise
            </p>
            <input
              type="text"
              value={secondarySpecs}
              onChange={(e) => setSecondarySpecs(e.target.value)}
              placeholder="e.g. White Collar Crimes, Insolvency & Bankruptcy (IBC), Maritime Law"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          {/* Court Admissions & Jurisdictions */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Court Admissions & Levels
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Select judicial forums where you have standing and actively represent clients:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COURT_LEVELS_OPTIONS.map((court) => {
                  const isChecked = selectedCourts.includes(court);
                  return (
                    <label
                      key={court}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-xs font-bold ${
                        isChecked
                          ? "bg-blue-50/80 border-blue-300 text-blue-800"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCourtLevel(court)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>{court}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Specific Court Jurisdictions & Benches
              </label>
              <input
                type="text"
                value={jurisdictionsText}
                onChange={(e) => setJurisdictionsText(e.target.value)}
                placeholder="e.g. Supreme Court of India, Delhi High Court, Patiala House Courts, NCLT Delhi"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Specializations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 3: EDIT EDUCATION & ACADEMIC QUALIFICATIONS MODAL
// =========================================================================
export function EditEducationModal({
  isOpen,
  onClose,
  lawyerProfile,
  onSaveSuccess,
}) {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (lawyerProfile) {
      const items = Array.isArray(lawyerProfile?.education)
        ? lawyerProfile.education.map((e) => ({
            degree: e.degree || "",
            institution: e.institution || e.university || "",
            cityState: e.cityState || "",
            year: e.year || "",
            certifications: e.certifications || "",
          }))
        : [];
      setEducationList(
        items.length > 0
          ? items
          : [
              {
                degree: "",
                institution: "",
                cityState: "",
                year: "",
                certifications: "",
              },
            ]
      );
      setError("");
      setSuccess("");
    }
  }, [lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setEducationList([
      ...educationList,
      {
        degree: "",
        institution: "",
        cityState: "",
        year: "",
        certifications: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = educationList.filter((_, idx) => idx !== index);
    setEducationList(updated);
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Filter out rows that are completely blank
    const cleaned = educationList
      .map((item) => ({
        degree: (item.degree || "").trim(),
        institution: (item.institution || "").trim(),
        cityState: (item.cityState || "").trim(),
        year: item.year ? Number(item.year) : null,
        certifications: (item.certifications || "").trim(),
      }))
      .filter((item) => item.degree || item.institution);

    // Validate that if row exists, both degree and institution are provided
    for (let i = 0; i < cleaned.length; i++) {
      if (!cleaned[i].degree) {
        setError(`Entry #${i + 1} is missing Degree / Course qualification.`);
        return;
      }
      if (!cleaned[i].institution) {
        setError(`Entry #${i + 1} is missing College / University name.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        education: cleaned,
      };

      const updated = await updateLawyerProfile(payload);
      setSuccess("Education credentials updated successfully!");
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update education credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Update Education & Academic Qualifications
              </h2>
              <p className="text-xs text-slate-500">
                Record your law degrees, colleges, passing years, and academic honors
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            {educationList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Qualification #{idx + 1}
                  </span>
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Degree / Course <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) =>
                        handleChangeRow(idx, "degree", e.target.value)
                      }
                      placeholder="e.g. LL.B., LL.M., B.A. LL.B. (Hons)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      College / University <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) =>
                        handleChangeRow(idx, "institution", e.target.value)
                      }
                      placeholder="e.g. National Law School of India University"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Location (City, State)
                    </label>
                    <input
                      type="text"
                      value={item.cityState}
                      onChange={(e) =>
                        handleChangeRow(idx, "cityState", e.target.value)
                      }
                      placeholder="e.g. Bengaluru, Karnataka"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Passing Year
                    </label>
                    <input
                      type="number"
                      min="1950"
                      max="2100"
                      value={item.year}
                      onChange={(e) =>
                        handleChangeRow(idx, "year", e.target.value)
                      }
                      placeholder="e.g. 2018"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Additional Qualifications / Certifications
                    </label>
                    <input
                      type="text"
                      value={item.certifications}
                      onChange={(e) =>
                        handleChangeRow(idx, "certifications", e.target.value)
                      }
                      placeholder="e.g. Gold Medalist / Diploma in Cyber Law"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Degree / Qualification</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Qualifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 4: EDIT INTERNSHIPS & JUDICIAL TRAINING MODAL
// =========================================================================
export function EditInternshipsModal({
  isOpen,
  onClose,
  lawyerProfile,
  onSaveSuccess,
}) {
  const [internshipsList, setInternshipsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (lawyerProfile) {
      const items = Array.isArray(lawyerProfile?.internships)
        ? lawyerProfile.internships.map((item) => ({
            institution: item.institution || "",
            role: item.role || "",
            practiceArea: item.practiceArea || "",
            duration: item.duration || "",
            responsibilities: item.responsibilities || "",
          }))
        : [];
      setInternshipsList(
        items.length > 0
          ? items
          : [
              {
                institution: "",
                role: "",
                practiceArea: "",
                duration: "",
                responsibilities: "",
              },
            ]
      );
      setError("");
      setSuccess("");
    }
  }, [lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setInternshipsList([
      ...internshipsList,
      {
        institution: "",
        role: "",
        practiceArea: "",
        duration: "",
        responsibilities: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = internshipsList.filter((_, idx) => idx !== index);
    setInternshipsList(updated);
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...internshipsList];
    updated[index][field] = value;
    setInternshipsList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Filter out rows that are completely empty
    const cleaned = internshipsList
      .map((item) => ({
        institution: (item.institution || "").trim(),
        role: (item.role || "").trim(),
        practiceArea: (item.practiceArea || "").trim(),
        duration: (item.duration || "").trim(),
        responsibilities: (item.responsibilities || "").trim(),
      }))
      .filter((item) => item.institution || item.role);

    // Validate that if row exists, institution is present
    for (let i = 0; i < cleaned.length; i++) {
      if (!cleaned[i].institution) {
        setError(`Entry #${i + 1} is missing Organization / Institution name.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        internships: cleaned,
      };

      const updated = await updateLawyerProfile(payload);
      setSuccess("Internships & judicial training updated successfully!");
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update internships.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Update Internships & Judicial Training
              </h2>
              <p className="text-xs text-slate-500">
                Manage court clerkships, chamber internships, roles, and practice training
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            {internshipsList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Internship / Training #{idx + 1}
                  </span>
                  {internshipsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Organization / Court / Chambers <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) =>
                        handleChangeRow(idx, "institution", e.target.value)
                      }
                      placeholder="e.g. Chambers of Senior Advocate, Delhi High Court"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Position / Role
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) =>
                        handleChangeRow(idx, "role", e.target.value)
                      }
                      placeholder="e.g. Legal Intern / Judicial Law Clerk"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Practice Area / Focus Domain
                    </label>
                    <input
                      type="text"
                      value={item.practiceArea}
                      onChange={(e) =>
                        handleChangeRow(idx, "practiceArea", e.target.value)
                      }
                      placeholder="e.g. Criminal Appeals & Special Leave Petitions"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Start Date – End Date / Duration
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) =>
                        handleChangeRow(idx, "duration", e.target.value)
                      }
                      placeholder="e.g. Jan 2020 – Jun 2020 (6 Months)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Description & Key Responsibilities
                  </label>
                  <textarea
                    rows={2}
                    value={item.responsibilities}
                    onChange={(e) =>
                      handleChangeRow(idx, "responsibilities", e.target.value)
                    }
                    placeholder="Briefly describe legal research, case briefing, drafting pleadings, or court appearances assisting senior advocates..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Internship / Training</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Internships</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 5: EDIT ACHIEVEMENTS & PROFESSIONAL RECOGNITION MODAL
// =========================================================================
export function EditAchievementsModal({
  isOpen,
  onClose,
  lawyerProfile,
  onSaveSuccess,
}) {
  const [awardsList, setAwardsList] = useState([]);
  const [achievementsText, setAchievementsText] = useState("");
  const [publicationsText, setPublicationsText] = useState("");
  const [membershipsText, setMembershipsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (lawyerProfile) {
      const initialAwards = Array.isArray(lawyerProfile?.awards)
        ? lawyerProfile.awards.map((a) => ({
            name: a.name || "",
            organization: a.organization || "",
            year: a.year || "",
            description: a.description || "",
          }))
        : [];
      setAwardsList(initialAwards);
      setAchievementsText(lawyerProfile?.achievements || "");
      setPublicationsText(lawyerProfile?.publications || "");
      setMembershipsText(lawyerProfile?.memberships || "");
      setError("");
      setSuccess("");
    }
  }, [lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const handleAddAward = () => {
    setAwardsList([
      ...awardsList,
      {
        name: "",
        organization: "",
        year: "",
        description: "",
      },
    ]);
  };

  const handleRemoveAward = (index) => {
    setAwardsList(awardsList.filter((_, idx) => idx !== index));
  };

  const handleAwardChange = (index, field, value) => {
    const updated = [...awardsList];
    updated[index][field] = value;
    setAwardsList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    try {
      const cleanedAwards = awardsList
        .map((a) => ({
          name: (a.name || "").trim(),
          organization: (a.organization || "").trim(),
          year: a.year ? Number(a.year) : null,
          description: (a.description || "").trim(),
        }))
        .filter((a) => a.name || a.organization || a.description);

      const payload = {
        awards: cleanedAwards,
        achievements: achievementsText.trim(),
        publications: publicationsText.trim(),
        memberships: membershipsText.trim(),
      };

      const updated = await updateLawyerProfile(payload);
      setSuccess("Achievements and professional recognitions updated successfully!");
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update achievements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Update Achievements & Recognition
              </h2>
              <p className="text-xs text-slate-500">
                Manage awards, published articles, bar memberships, and professional milestones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* Awards & Honors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  Awards & Recognition
                </h4>
                <p className="text-[11px] text-slate-500">
                  Legal industry awards, government honors, and bar association recognitions
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAward}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Award</span>
              </button>
            </div>

            {awardsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                No awards added yet. Click &ldquo;Add Award&rdquo; to add your professional accolades.
              </p>
            ) : (
              <div className="space-y-3">
                {awardsList.map((award, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">
                        Award #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAward(idx)}
                        className="text-rose-600 hover:text-rose-700 p-1 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Award Name
                        </label>
                        <input
                          type="text"
                          value={award.name}
                          onChange={(e) =>
                            handleAwardChange(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Criminal Trial Advocate of the Year"
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Year
                        </label>
                        <input
                          type="number"
                          min="1950"
                          max="2100"
                          value={award.year}
                          onChange={(e) =>
                            handleAwardChange(idx, "year", e.target.value)
                          }
                          placeholder="e.g. 2023"
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Organization / Issuing Authority
                        </label>
                        <input
                          type="text"
                          value={award.organization}
                          onChange={(e) =>
                            handleAwardChange(idx, "organization", e.target.value)
                          }
                          placeholder="e.g. Bar Association of India / LexFalcon"
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Brief Description / Citation
                        </label>
                        <input
                          type="text"
                          value={award.description}
                          onChange={(e) =>
                            handleAwardChange(idx, "description", e.target.value)
                          }
                          placeholder="e.g. Recognized for landmark pro-bono defense verdicts"
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Professional Achievements */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Professional Achievements & Key Milestones
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Notable case verdicts, pro-bono accomplishments, high-profile settlements, and court milestones (one per line)
            </p>
            <textarea
              rows={3}
              value={achievementsText}
              onChange={(e) => setAchievementsText(e.target.value)}
              placeholder="• Successfully defended 100+ criminal appeals before High Court benches.&#10;• Secured landmark arbitration award exceeding ₹15 Crores for commercial infrastructure consortium.&#10;• Empaneled Special Counsel for statutory regulatory authority."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition leading-relaxed font-mono"
            />
          </div>

          {/* Publications & Research */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Publications, Seminars & Legal Research
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Authored legal treatises, law review articles, keynote addresses, and seminar papers (one per line)
            </p>
            <textarea
              rows={3}
              value={publicationsText}
              onChange={(e) => setPublicationsText(e.target.value)}
              placeholder="• 'Digital Evidence Admissibility Under Section 65B', National Law Review (2022).&#10;• Keynote Speaker, Annual Arbitration Summit on Emergency Arbitrators (New Delhi, 2023)."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition leading-relaxed font-mono"
            />
          </div>

          {/* Professional Memberships */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Professional Memberships & Bar Associations
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Bar associations, law societies, arbitration councils, and international federations (one per line)
            </p>
            <textarea
              rows={2}
              value={membershipsText}
              onChange={(e) => setMembershipsText(e.target.value)}
              placeholder="• Supreme Court Bar Association (SCBA)&#10;• Delhi High Court Bar Association (DHCBA)&#10;• Chartered Institute of Arbitrators (CIArb)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition leading-relaxed font-mono"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Achievements</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

