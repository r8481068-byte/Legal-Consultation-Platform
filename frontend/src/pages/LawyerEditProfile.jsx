import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getMyLawyerProfile,
  updateLawyerProfile,
} from "../services/lawyerService";
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Scale,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  PlusCircle,
  Trash2,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Lock,
  Globe,
  BookOpen,
} from "lucide-react";

const AVAILABLE_SPECIALIZATIONS = [
  "Property Law",
  "Criminal Defense",
  "Civil Litigation",
  "Family & Divorce Law",
  "Corporate & Startup Law",
  "Cyber Crime & Data Privacy",
  "Labour & Employment Law",
  "Taxation & GST",
  "Consumer Protection",
  "Constitutional Law",
  "Banking & Finance",
  "Intellectual Property (IPR)",
  "Immigration Law",
  "Arbitration & Dispute Resolution",
];

const COURT_LEVEL_OPTIONS = [
  "District Court",
  "High Court",
  "Supreme Court",
  "Tribunal",
];

export default function LawyerEditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lawyerData, setLawyerData] = useState(null);

  // Form State structured by the 8 required sections
  const [form, setForm] = useState({
    // Section 1: Personal & Professional Info
    name: "",
    headline: "",
    designation: "Advocate",
    languages: "English, Hindi",
    city: "",
    state: "",
    officeAddress: "",
    phone: "",
    hidePhone: false,
    profileImage: "",
    jurisdictions: ["District Court", "High Court"],

    // Section 2: Education
    education: [
      {
        degree: "LL.B.",
        institution: "",
        cityState: "",
        year: 2018,
        certifications: "",
      },
    ],

    // Section 3: Internships
    internships: [],

    // Section 4: Professional Experience
    experiences: [],

    // Section 5: Specialization, Fees & Biography
    specialization: ["Property Law"],
    secondarySpecializations: ["Civil Litigation"],
    experienceYears: 5,
    consultationFee: 1500,
    consultationDuration: 30,
    consultationModes: ["video", "in_person"],
    achievements: "",
    bio: "",

    // Additional Fields (Website, Memberships, Publications)
    website: "",
    memberships: "",
    publications: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const profile = await getMyLawyerProfile();
      setLawyerData(profile);

      const user = profile.user || {};

      setForm({
        name: user.name || "",
        headline: profile.headline || "",
        designation: profile.designation || "Advocate",
        languages: Array.isArray(profile.languages)
          ? profile.languages.join(", ")
          : profile.languages || "English",
        city: profile.city || "",
        state: profile.state || profile.stateOfEnrolment || "",
        officeAddress: profile.officeAddress || "",
        phone: profile.phone || user.phone || "",
        hidePhone: Boolean(profile.hidePhone),
        profileImage: profile.profileImage || user.profileImage || "",
        jurisdictions: Array.isArray(profile.courtLevels) && profile.courtLevels.length > 0
          ? profile.courtLevels
          : ["District Court", "High Court"],

        education:
          Array.isArray(profile.education) && profile.education.length > 0
            ? profile.education.map((e) => ({
                degree: e.degree || "",
                institution: e.institution || "",
                cityState: e.cityState || "",
                year: e.year || "",
                certifications: e.certifications || "",
              }))
            : [
                {
                  degree: "LL.B.",
                  institution: profile.lawCollege || "",
                  cityState: "",
                  year: profile.graduationYear || 2018,
                  certifications: "",
                },
              ],

        internships:
          Array.isArray(profile.internships) && profile.internships.length > 0
            ? profile.internships.map((i) => ({
                institution: i.institution || "",
                role: i.role || "",
                duration: i.duration || "",
                practiceArea: i.practiceArea || "",
                responsibilities: i.responsibilities || "",
              }))
            : [],

        experiences:
          Array.isArray(profile.experiences) && profile.experiences.length > 0
            ? profile.experiences.map((exp) => ({
                organization: exp.organization || "",
                designation: exp.designation || "",
                employmentType: exp.employmentType || "Full-Time",
                startDate: exp.startDate || "",
                endDate: exp.endDate || "",
                practiceAreas: exp.practiceAreas || "",
                responsibilities: exp.responsibilities || "",
              }))
            : [],

        specialization: Array.isArray(profile.specialization) && profile.specialization.length > 0
          ? profile.specialization
          : ["Property Law"],
        secondarySpecializations: Array.isArray(profile.secondarySpecializations)
          ? profile.secondarySpecializations
          : [],
        experienceYears: profile.experienceYears || 5,
        consultationFee: profile.consultationFee || 1500,
        consultationDuration: profile.consultationDuration || 30,
        consultationModes: Array.isArray(profile.consultationModes) && profile.consultationModes.length > 0
          ? profile.consultationModes
          : ["video", "in_person"],
        achievements: profile.achievements || "",
        bio: profile.bio || "",

        website: profile.website || "",
        memberships: profile.memberships || "",
        publications: profile.publications || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load lawyer profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Section 2: Education Handlers
  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", cityState: "", year: "", certifications: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, education: next };
    });
  };

  // Section 3: Internship Handlers
  const addInternship = () => {
    setForm((prev) => ({
      ...prev,
      internships: [
        ...prev.internships,
        { institution: "", role: "", duration: "", practiceArea: "", responsibilities: "" },
      ],
    }));
  };

  const removeInternship = (index) => {
    setForm((prev) => ({
      ...prev,
      internships: prev.internships.filter((_, i) => i !== index),
    }));
  };

  const updateInternship = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.internships];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, internships: next };
    });
  };

  // Section 4: Experience Handlers
  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          organization: "",
          designation: "",
          employmentType: "Full-Time",
          startDate: "",
          endDate: "",
          practiceAreas: "",
          responsibilities: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.experiences];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, experiences: next };
    });
  };

  // Form Save & Submit
  const handleSave = async (isDraftMode = false) => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const langArray = form.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      // Clean education entries
      const cleanEducation = form.education
        .filter((e) => e.degree && e.degree.trim() && e.institution && e.institution.trim())
        .map((e) => ({
          degree: e.degree.trim(),
          institution: e.institution.trim(),
          cityState: e.cityState ? e.cityState.trim() : "",
          year: Number(e.year) || undefined,
          certifications: e.certifications ? e.certifications.trim() : "",
        }));

      // Clean internships
      const cleanInternships = form.internships
        .filter((i) => i.institution && i.institution.trim())
        .map((i) => ({
          institution: i.institution.trim(),
          role: i.role ? i.role.trim() : "",
          duration: i.duration ? i.duration.trim() : "",
          practiceArea: i.practiceArea ? i.practiceArea.trim() : "",
          responsibilities: i.responsibilities ? i.responsibilities.trim() : "",
        }));

      // Clean experience
      const cleanExperiences = form.experiences
        .filter((exp) => exp.organization && exp.organization.trim())
        .map((exp) => ({
          organization: exp.organization.trim(),
          designation: exp.designation ? exp.designation.trim() : "",
          employmentType: exp.employmentType || "Full-Time",
          startDate: exp.startDate ? exp.startDate.trim() : "",
          endDate: exp.endDate ? exp.endDate.trim() : "",
          practiceAreas: exp.practiceAreas ? exp.practiceAreas.trim() : "",
          responsibilities: exp.responsibilities ? exp.responsibilities.trim() : "",
        }));

      const payload = {
        name: form.name.trim(),
        headline: form.headline.trim(),
        designation: form.designation.trim(),
        languages: langArray.length > 0 ? langArray : ["English"],
        city: form.city.trim(),
        state: form.state.trim(),
        officeAddress: form.officeAddress.trim(),
        phone: form.phone.trim(),
        hidePhone: Boolean(form.hidePhone),
        profileImage: form.profileImage.trim(),
        courtLevels: form.jurisdictions,
        education: cleanEducation.length > 0 ? cleanEducation : form.education,
        internships: cleanInternships,
        experiences: cleanExperiences,
        specialization: form.specialization,
        secondarySpecializations: form.secondarySpecializations,
        experienceYears: Number(form.experienceYears) || 0,
        consultationFee: Number(form.consultationFee) || 1000,
        consultationDuration: Number(form.consultationDuration) || 30,
        consultationModes: form.consultationModes,
        achievements: form.achievements.trim(),
        bio: form.bio.trim(),
        website: form.website.trim(),
        memberships: form.memberships.trim(),
        publications: form.publications.trim(),
        isDraft: isDraftMode,
      };

      const updated = await updateLawyerProfile(payload);
      setLawyerData(updated);

      if (isDraftMode) {
        setSuccessMessage("Draft profile saved successfully.");
      } else {
        setSuccessMessage(
          "Professional profile updated and published successfully! Live preview is now updated."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  // Completeness calculation
  const calculateCompleteness = () => {
    let score = 0;
    if (form.name) score += 10;
    if (form.headline) score += 10;
    if (form.city) score += 10;
    if (form.bio && form.bio.length >= 50) score += 20;
    if (form.education.length > 0 && form.education[0].institution) score += 15;
    if (form.specialization.length > 0) score += 15;
    if (form.consultationFee) score += 10;
    if (form.experiences.length > 0) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-slate-500">
          <p className="text-sm font-semibold">Loading profile editor...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/lawyer-dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition"
            >
              ← Back to Lawyer Dashboard
            </Link>

            <div className="flex items-center gap-2">
              {lawyerData?._id && (
                <a
                  href={`/lawyers/${lawyerData._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-700" />
                  Preview Public Profile
                </a>
              )}
            </div>
          </div>

          {/* Page Banner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Advocate Professional Profile
                </span>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Edit Professional Profile
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Update your public legal profile, practice areas, court admissions, fee schedule, and professional biography.
                </p>
              </div>

              {/* Completeness Bar */}
              <div className="w-full sm:w-64 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Profile Completeness</span>
                  <span className="text-blue-900">{completeness}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Notification Alerts */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-xs font-semibold text-green-800 border border-green-200">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(false);
            }}
            className="mt-8 space-y-8"
          >
            {/* ================= SECTION 1: PERSONAL & PROFESSIONAL INFORMATION ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900 text-white font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Section 1: Personal & Professional Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Basic identification, official title, languages spoken, and chamber contact details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Role / Designation *
                  </label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    placeholder="e.g. Senior Advocate, Managing Partner, Advocate"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Display Headline
                  </label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. High Court & Supreme Court Litigator | 15+ Years Practice in Property & Civil Disputes"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Practicing City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Delhi, Maharashtra, Karnataka"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Office / Chamber Address
                  </label>
                  <input
                    type="text"
                    value={form.officeAddress}
                    onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                    placeholder="Chamber No., Court Complex / Law Chambers, Street address"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Languages Spoken (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.languages}
                    onChange={(e) => setForm({ ...form, languages: e.target.value })}
                    placeholder="English, Hindi, Bengali, etc."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={form.profileImage}
                    onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                    placeholder="https://example.com/lawyer-portrait.jpg"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                {/* Privacy Setting */}
                <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hidePhone}
                      onChange={(e) => setForm({ ...form, hidePhone: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Contact Privacy: Keep phone number hidden from public profile
                      </span>
                      <p className="text-[11px] text-slate-500">
                        When enabled, your phone number will never be exposed on your public directory profile. Clients can only contact you via scheduled platform consultations and chat.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Court Jurisdictions */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Court Jurisdictions & Admissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COURT_LEVEL_OPTIONS.map((court) => {
                      const selected = form.jurisdictions.includes(court);
                      return (
                        <button
                          key={court}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setForm({
                                ...form,
                                jurisdictions: form.jurisdictions.filter((c) => c !== court),
                              });
                            } else {
                              setForm({
                                ...form,
                                jurisdictions: [...form.jurisdictions, court],
                              });
                            }
                          }}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                            selected
                              ? "bg-blue-900 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {court}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ================= SECTION 2: EDUCATION AND ACADEMIC QUALIFICATIONS ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-900 text-white font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Section 2: Education & Academic Qualifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Law degree, university, graduation year, and specialized diploma credentials.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Education
                </button>
              </div>

              {form.education.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No academic qualifications added yet. Click &ldquo;Add Education&rdquo; above.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 relative"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-slate-700">
                          Qualification #{idx + 1}
                        </span>
                        {form.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                            title="Remove qualification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Degree / Qualification *
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                            placeholder="e.g. LL.B., LL.M., B.A. LL.B."
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            College / University *
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                            placeholder="e.g. Faculty of Law, University of Delhi"
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            City & State
                          </label>
                          <input
                            type="text"
                            value={edu.cityState}
                            onChange={(e) => updateEducation(idx, "cityState", e.target.value)}
                            placeholder="e.g. New Delhi, Delhi"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Graduation Year
                          </label>
                          <input
                            type="number"
                            min="1950"
                            max="2100"
                            value={edu.year}
                            onChange={(e) => updateEducation(idx, "year", e.target.value)}
                            placeholder="2018"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Additional Honors / Certifications
                          </label>
                          <input
                            type="text"
                            value={edu.certifications}
                            onChange={(e) => updateEducation(idx, "certifications", e.target.value)}
                            placeholder="e.g. Gold Medalist in Criminal Law; Diploma in Cyber Law"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================= SECTION 3: INTERNSHIPS AND JUDICIAL TRAINING ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white font-bold">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Section 3: Internships & Judicial Training
                    </h2>
                    <p className="text-xs text-slate-500">
                      Court clerkships, legal aid clinics, and law firm internships.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addInternship}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Internship
                </button>
              </div>

              {form.internships.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p>No internships added yet. This section is optional.</p>
                  <button
                    type="button"
                    onClick={addInternship}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    + Add an internship or judicial training entry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.internships.map((intern, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-slate-700">
                          Internship Entry #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInternship(idx)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                          title="Remove entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Law Firm / Court / Institution *
                          </label>
                          <input
                            type="text"
                            value={intern.institution}
                            onChange={(e) => updateInternship(idx, "institution", e.target.value)}
                            placeholder="e.g. Chambers of Senior Advocate, Delhi High Court"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Internship Role
                          </label>
                          <input
                            type="text"
                            value={intern.role}
                            onChange={(e) => updateInternship(idx, "role", e.target.value)}
                            placeholder="e.g. Legal Research Intern"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Duration / Dates
                          </label>
                          <input
                            type="text"
                            value={intern.duration}
                            onChange={(e) => updateInternship(idx, "duration", e.target.value)}
                            placeholder="e.g. June 2017 - August 2017"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Practice Area
                          </label>
                          <input
                            type="text"
                            value={intern.practiceArea}
                            onChange={(e) => updateInternship(idx, "practiceArea", e.target.value)}
                            placeholder="e.g. Civil Appeals, Writs"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Work Summary & Key Responsibilities
                          </label>
                          <textarea
                            rows={2}
                            value={intern.responsibilities}
                            onChange={(e) => updateInternship(idx, "responsibilities", e.target.value)}
                            placeholder="Drafted writ petitions, prepared case briefs, and assisted senior counsels..."
                            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================= SECTION 4: PROFESSIONAL LEGAL EXPERIENCE ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-800 text-white font-bold">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Section 4: Professional Legal Experience
                    </h2>
                    <p className="text-xs text-slate-500">
                      Law practice history, chambers, associate roles, and judicial casework summary.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Experience
                </button>
              </div>

              {form.experiences.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p>No past chamber or firm experiences added yet.</p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    + Add your professional casework or legal practice history
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-slate-700">
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(idx)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                          title="Remove entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Organization / Chamber / Court *
                          </label>
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                            placeholder="e.g. Verma & Associates / Delhi High Court Chambers"
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Designation / Role
                          </label>
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) => updateExperience(idx, "designation", e.target.value)}
                            placeholder="e.g. Senior Associate, Counsel"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Employment Type
                          </label>
                          <select
                            value={exp.employmentType}
                            onChange={(e) => updateExperience(idx, "employmentType", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          >
                            <option value="Full-Time">Full-Time Practice</option>
                            <option value="Independent Practice">Independent Practice</option>
                            <option value="Partner">Partner</option>
                            <option value="Senior Associate">Senior Associate</option>
                            <option value="Associate Counsel">Associate Counsel</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                            placeholder="e.g. Jan 2019"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            End Date (or &ldquo;Present&rdquo;)
                          </label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                            placeholder="e.g. Present, Dec 2022"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Key Practice Areas
                          </label>
                          <input
                            type="text"
                            value={exp.practiceAreas}
                            onChange={(e) => updateExperience(idx, "practiceAreas", e.target.value)}
                            placeholder="e.g. Property, Civil Writs, Contracts"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Responsibilities & Casework Summary
                          </label>
                          <textarea
                            rows={2}
                            value={exp.responsibilities}
                            onChange={(e) => updateExperience(idx, "responsibilities", e.target.value)}
                            placeholder="Represented corporate and individual clients in civil and commercial litigation..."
                            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================= SECTION 5: PRACTICE SPECIALIZATION, FEES & BIOGRAPHY ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Section 5: Practice Specialization, Fees & Biography
                  </h2>
                  <p className="text-xs text-slate-500">
                    Primary legal practice areas, consultation pricing in INR, consultation modes, and detailed biography.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Primary Specializations */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Primary Specializations (Select all that apply) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                      const selected = form.specialization.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              if (form.specialization.length === 1) return; // Keep at least one
                              setForm({
                                ...form,
                                specialization: form.specialization.filter((s) => s !== spec),
                              });
                            } else {
                              setForm({
                                ...form,
                                specialization: [...form.specialization, spec],
                              });
                            }
                          }}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                            selected
                              ? "bg-blue-900 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consultation Fee & Experience Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Fee (₹ INR) *
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="100000"
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Duration *
                    </label>
                    <select
                      value={form.consultationDuration}
                      onChange={(e) => setForm({ ...form, consultationDuration: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Years of Legal Practice *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Mode
                    </label>
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consultationModes.includes("video")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                consultationModes: [...form.consultationModes, "video"],
                              });
                            } else {
                              setForm({
                                ...form,
                                consultationModes: form.consultationModes.filter((m) => m !== "video"),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded text-blue-900"
                        />
                        Online Video
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consultationModes.includes("in_person")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                consultationModes: [...form.consultationModes, "in_person"],
                              });
                            } else {
                              setForm({
                                ...form,
                                consultationModes: form.consultationModes.filter((m) => m !== "in_person"),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded text-blue-900"
                        />
                        In-Person
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notable Achievements and Awards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notable Achievements & Awards
                  </label>
                  <input
                    type="text"
                    value={form.achievements}
                    onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                    placeholder="e.g. Recognized by Bar Council for Outstanding Pro Bono Work (2022); Lex Falcon Global Legal Award"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                  />
                </div>

                {/* DETAILED PROFESSIONAL BIOGRAPHY TEXT AREA */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Detailed Professional Biography *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {form.bio.length} / 5000 characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={form.bio}
                    maxLength={5000}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Provide a comprehensive description of your legal background, court admissions, philosophy of practice, client approach, and notable landmark judgments handled..."
                    required
                    className="w-full rounded-2xl border border-slate-300 p-4 text-sm leading-relaxed outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Write in your own words. Safe plain text formatting is preserved. HTML script tags are sanitized.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= SECTION 6: AVAILABILITY AND APPOINTMENT CONFIGURATION ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900 text-white font-bold">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Section 6: Availability & Appointment Configuration
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure your real-time consultation calendar and bookable 30-minute time slots.
                    </p>
                  </div>
                </div>

                <Link
                  to="/lawyer/availability"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition"
                >
                  <Clock className="h-4 w-4" />
                  Open Availability & Slot Manager
                </Link>
              </div>
            </section>

            {/* ================= SECTION 7: VERIFICATION AND BAR CREDENTIALS ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Section 7: Verification & Bar Credentials
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Bar Council enrollment data and verified credentials.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Bar Council Registration Number
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {lawyerData?.barCouncilId || "D/XXXX/2018"}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Official Verification Status
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          lawyerData?.verificationStatus === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : lawyerData?.verificationStatus === "rejected"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {lawyerData?.verificationStatus === "approved"
                          ? "✓ Verified by Platform Admin"
                          : lawyerData?.verificationStatus || "Pending Review"}
                      </span>
                    </div>
                  </div>
                </div>

                {lawyerData?.decisionReason && (
                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800">
                    <span className="font-bold">Administrative Review Note: </span>
                    {lawyerData.decisionReason}
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Statutory Compliance Note:</strong> In compliance with the Advocates Act, 1961 and Bar Council regulations, advocate verification status cannot be self-modified by the lawyer. Official verification is granted only following administrative inspection of your Bar Council enrollment certificate and law degree.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= SECTION 8: PUBLIC PROFILE PREVIEW AND SAVE ================= */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Section 8: Public Profile Preview & Save
                  </h2>
                  <p className="text-xs text-slate-500">
                    Save your updates as a draft or publish changes directly to your live public directory profile.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {lawyerData?._id && (
                    <a
                      href={`/lawyers/${lawyerData._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye className="h-4 w-4 text-blue-700" />
                      Preview Public Profile
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    Save Draft
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 disabled:opacity-50 transition"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save & Publish Profile"}
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>
    </div>
  );
}
