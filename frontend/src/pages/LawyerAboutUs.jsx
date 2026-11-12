import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyLawyerProfile, updateLawyerProfile } from "../services/lawyerService";
import { getLawyerReviews } from "../services/reviewService";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Edit,
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Globe,
  Phone,
  Mail,
  Lock,
  Clock,
  Video,
  Users,
  CheckCircle,
  Building,
  Scale,
  ExternalLink,
  Calendar,
  AlertCircle,
  FileText,
  Save,
  X,
  Loader2,
} from "lucide-react";

export default function LawyerAboutUs() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Describe Us states
  const [isEditingDescribeUs, setIsEditingDescribeUs] = useState(false);
  const [describeUsText, setDescribeUsText] = useState("");
  const [savingDescribeUs, setSavingDescribeUs] = useState(false);
  const [describeUsError, setDescribeUsError] = useState("");
  const [describeUsSuccess, setDescribeUsSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const lawyer = await getMyLawyerProfile();
        setProfile(lawyer);
        setDescribeUsText(lawyer?.describeUs || lawyer?.bio || "");

        if (lawyer?._id) {
          try {
            const revRes = await getLawyerReviews(lawyer._id);
            setReviews(revRes.reviews || []);
          } catch (rErr) {
            console.error("Reviews load error:", rErr);
          }
        }
      } catch (err) {
        setError(err.message || "Unable to load professional profile.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStartEditDescribeUs = () => {
    setDescribeUsText(profile?.describeUs || profile?.bio || "");
    setIsEditingDescribeUs(true);
    setDescribeUsError("");
    setDescribeUsSuccess("");
  };

  const handleCancelEditDescribeUs = () => {
    setDescribeUsText(profile?.describeUs || profile?.bio || "");
    setIsEditingDescribeUs(false);
    setDescribeUsError("");
  };

  const handleSaveDescribeUs = async () => {
    try {
      setSavingDescribeUs(true);
      setDescribeUsError("");
      const updated = await updateLawyerProfile({
        describeUs: describeUsText,
        bio: describeUsText,
      });
      setProfile((prev) => ({
        ...prev,
        describeUs: updated.describeUs !== undefined ? updated.describeUs : describeUsText,
        bio: updated.bio !== undefined ? updated.bio : describeUsText,
      }));
      setIsEditingDescribeUs(false);
      setDescribeUsSuccess("Description updated and saved successfully.");
      setTimeout(() => setDescribeUsSuccess(""), 4000);
    } catch (err) {
      setDescribeUsError(err.message || "Failed to save description.");
    } finally {
      setSavingDescribeUs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-royal" />
            <p className="text-sm font-semibold text-slate-600">
              Loading professional information...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h2 className="text-lg font-heading font-bold text-rose-900">
              Failed to Load Profile
            </h2>
            <p className="text-sm text-rose-700 mt-1">
              {error || "Lawyer profile not found. Please log in or complete your profile."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/lawyer-dashboard")}
                className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-light"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const lawyerName = profile.user?.name || "Advocate";
  const initials = lawyerName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVerified =
    profile.verificationStatus === "approved" ||
    profile.verificationStatus === "verified";

  const ratingValue =
    profile.averageRating > 0
      ? profile.averageRating.toFixed(1)
      : reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  const reviewCount = profile.totalReviews || reviews.length;

  const primarySpecialization = Array.isArray(profile.specialization)
    ? profile.specialization.join(", ")
    : profile.specialization || "Legal Counsel";

  const secondarySpecs = Array.isArray(profile.secondarySpecializations)
    ? profile.secondarySpecializations
    : [];

  const achievementsList = profile.achievements
    ? String(profile.achievements)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const membershipsList = profile.memberships
    ? String(profile.memberships)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const publicationsList = profile.publications
    ? String(profile.publications)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const jurisdictions = [
    ...(Array.isArray(profile.jurisdictions) ? profile.jurisdictions : []),
    ...(Array.isArray(profile.practiceCourts) ? profile.practiceCourts : []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <Link
              to="/lawyer-dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-navy transition"
            >
              <ArrowLeft className="h-4 w-4 text-royal" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Professional Profile Overview
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION A: PROFILE HEADER HERO CARD                                       */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Image with fallback */}
              <div className="relative shrink-0">
                {profile.user?.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={lawyerName}
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
                  className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-navy via-navy-light to-royal text-white flex items-center justify-center font-heading font-black text-3xl border-2 border-slate-200 shadow-xs ${
                    profile.user?.profileImage ? "hidden" : "flex"
                  }`}
                >
                  {initials}
                </div>
                {isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1.5 text-white ring-2 ring-white shadow-xs"
                    title="Verified Advocate"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Title & Core Credentials */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
                    {lawyerName}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      BCI Verified Advocate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Verification Pending
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-royal">
                  {profile.headline || `${profile.designation || "Advocate"} | ${primarySpecialization}`}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Role: <span className="font-bold text-slate-700">{profile.designation || "Advocate"}</span>
                  {profile.barCouncilId && (
                    <>
                      {" • "}
                      Bar Registration: <span className="font-bold text-slate-700">{profile.barCouncilId}</span>
                    </>
                  )}
                </p>

                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                    <Scale className="h-3.5 w-3.5 text-royal" />
                    {primarySpecialization}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                    <Briefcase className="h-3.5 w-3.5 text-royal" />
                    {profile.experienceYears || 0} Years Experience
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-navy border border-blue-200">
                    ₹{profile.consultationFee || 0} / Consultation
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ★ {ratingValue} / 5 ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: DESCRIBE US                                                      */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-royal" />
                <h2 className="text-base sm:text-lg font-heading font-bold text-navy">
                  Describe Us
                </h2>
              </div>

              {!isEditingDescribeUs && (
                <button
                  type="button"
                  onClick={handleStartEditDescribeUs}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-blue-100 transition shadow-2xs"
                >
                  <Edit className="h-3.5 w-3.5 text-royal" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {describeUsSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{describeUsSuccess}</span>
              </div>
            )}

            {describeUsError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{describeUsError}</span>
              </div>
            )}

            {isEditingDescribeUs ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Write a personal and professional introduction about yourself in your own words.
                </p>
                <textarea
                  value={describeUsText}
                  onChange={(e) => setDescribeUsText(e.target.value)}
                  rows={6}
                  placeholder="Introduce yourself, your legal background, practice philosophy, and experience..."
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:border-royal focus:ring-1 focus:ring-royal outline-none leading-relaxed transition"
                />
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancelEditDescribeUs}
                    disabled={savingDescribeUs}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDescribeUs}
                    disabled={savingDescribeUs}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition disabled:opacity-50"
                  >
                    {savingDescribeUs ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 text-gold" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {(profile.describeUs || profile.bio) ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    {profile.describeUs || profile.bio}
                  </p>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                      No personal or professional introduction added yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartEditDescribeUs}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition"
                    >
                      <Edit className="h-3.5 w-3.5 text-gold" />
                      <span>Add Description</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION B: PERSONAL AND PROFESSIONAL INFORMATION                          */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <FileText className="h-5 w-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">
                Professional Biography & Personal Information
              </h2>
            </div>

            {/* Professional Biography */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                About the Lawyer
              </h3>
              {(profile.describeUs || profile.bio) ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  {profile.describeUs || profile.bio}
                </p>
              ) : (
                <p className="text-xs italic text-slate-400">
                  No professional biography provided yet. You can add one via the Edit Profile page or the Describe Us section above.
                </p>
              )}
            </div>

            {/* Key Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-700" />
                  Languages Spoken
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {Array.isArray(profile.languages) && profile.languages.length > 0
                    ? profile.languages.join(", ")
                    : typeof profile.languages === "string" && profile.languages
                    ? profile.languages
                    : "English, Hindi"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-700" />
                  City & State
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {[profile.city, profile.state].filter(Boolean).join(", ") || "India"}
                </p>
              </div>

              {profile.officeAddress && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-blue-700" />
                    Office / Chamber Address
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profile.officeAddress}
                  </p>
                </div>
              )}

              {jurisdictions.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-blue-700" />
                    Court Jurisdictions & Practice Courts
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {jurisdictions.map((court, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        {court}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information & Privacy */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-700" />
                  Contact Information & Privacy
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {profile.user?.email || "Email protected"}
                  </span>

                  {profile.hidePhone ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      Phone Number: Hidden (Protected by Contact Privacy Setting)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {profile.phone || profile.user?.phone || "Not specified"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION C: EDUCATION AND ACADEMIC QUALIFICATIONS                          */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <GraduationCap className="h-5 w-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">
                Education & Academic Qualifications
              </h2>
            </div>

            {Array.isArray(profile.education) && profile.education.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-blue-950">
                        {edu.degree || "Degree"}
                      </h4>
                      {edu.year && (
                        <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          {edu.year}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {edu.institution || edu.university || "Institution"}
                    </p>
                    {edu.cityState && (
                      <p className="text-xs text-slate-500">{edu.cityState}</p>
                    )}
                    {edu.certifications && (
                      <p className="text-xs text-slate-600 pt-1 font-medium">
                        Certifications: <span className="text-slate-800">{edu.certifications}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">
                No education records added yet.
              </p>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION D: INTERNSHIPS AND JUDICIAL TRAINING                              */}
          {/* ========================================================================= */}
          {Array.isArray(profile.internships) && profile.internships.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Briefcase className="h-5 w-5 text-blue-900" />
                <h2 className="text-base font-bold text-slate-900">
                  Internships & Judicial Training
                </h2>
              </div>

              <div className="space-y-3">
                {profile.internships.map((intern, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {intern.role || "Intern"} — {intern.organization || "Legal Institution"}
                      </h4>
                      {intern.duration && (
                        <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          {intern.duration}
                        </span>
                      )}
                    </div>
                    {intern.practiceArea && (
                      <p className="text-xs font-semibold text-blue-900">
                        Practice Area: {intern.practiceArea}
                      </p>
                    )}
                    {intern.responsibilities && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {intern.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION E: PROFESSIONAL LEGAL EXPERIENCE                                  */}
          {/* ========================================================================= */}
          {Array.isArray(profile.experiences) && profile.experiences.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Building className="h-5 w-5 text-blue-900" />
                <h2 className="text-base font-bold text-slate-900">
                  Professional Legal Experience
                </h2>
              </div>

              <div className="space-y-3">
                {profile.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {exp.designation || "Advocate"} — {exp.organization || "Chambers / Firm"}
                      </h4>
                      <span className="rounded-md bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                        {[exp.startDate, exp.endDate || "Present"].filter(Boolean).join(" – ")}
                        {exp.employmentType ? ` (${exp.employmentType})` : ""}
                      </span>
                    </div>
                    {exp.practiceAreas && (
                      <p className="text-xs font-semibold text-blue-900">
                        Practice Areas: {exp.practiceAreas}
                      </p>
                    )}
                    {exp.caseworkSummary && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {exp.caseworkSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION F: SPECIALIZATION, FEES AND CONSULTATION DETAILS                  */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Award className="h-5 w-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">
                Specialization, Fees & Consultation Details
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Practice Areas
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-lg bg-blue-900 text-white px-2.5 py-1 text-xs font-bold shadow-2xs">
                    {primarySpecialization} (Primary)
                  </span>
                  {secondarySpecs.map((spec, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-white border border-slate-200 text-slate-800 px-2.5 py-1 text-xs font-semibold shadow-2xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Consultation Parameters
                </span>
                <div className="space-y-1 text-xs text-slate-700 pt-1">
                  <p>
                    <strong>Consultation Fee:</strong> ₹{profile.consultationFee || 0} INR
                  </p>
                  <p>
                    <strong>Session Duration:</strong> {profile.consultationDuration || 30} Minutes
                  </p>
                  <p>
                    <strong>Supported Modes:</strong>{" "}
                    {Array.isArray(profile.consultationModes) && profile.consultationModes.length > 0
                      ? profile.consultationModes
                          .map((m) => (m === "video" ? "Video Call" : m === "in_person" ? "In-Person" : m))
                          .join(", ")
                      : "Online Video & In-Person"}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements & Awards */}
            {achievementsList.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  Notable Achievements & Awards
                </h3>
                <ul className="space-y-1.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  {achievementsList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memberships, Publications & Links */}
            {(membershipsList.length > 0 || publicationsList.length > 0 || profile.website) && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {membershipsList.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-700" />
                      Professional Memberships
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {membershipsList.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-800 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {publicationsList.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-700" />
                      Articles & Publications
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {publicationsList.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-800 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile.website && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Professional Website / Portfolio
                      </span>
                      <p className="text-xs font-semibold text-blue-900">{profile.website}</p>
                    </div>
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline"
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION G: BAR CREDENTIALS AND VERIFICATION                               */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-5 w-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">
                Bar Credentials & Platform Verification
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Bar Council Registration Number
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {profile.barCouncilId || "Not Registered"}
                </p>
                {profile.stateOfEnrolment && (
                  <p className="text-xs text-slate-500">
                    State Bar: {profile.stateOfEnrolment}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Official Verification Status
                </span>
                <div>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-extrabold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Approved & Verified Advocate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-extrabold">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Pending Administrative Verification
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Enrolment credentials verified pursuant to the Advocates Act, 1961. Confidential identity and verification documents are securely encrypted.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION H: BOTTOM NAVIGATION                                              */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <Link
              to="/lawyer-dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-navy transition"
            >
              <ArrowLeft className="h-4 w-4 text-royal" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
