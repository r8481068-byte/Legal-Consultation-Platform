import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyAsLawyer, getMyLawyerApplication } from "../services/lawyerService";
import { registerUser, loginUser } from "../services/authService";
import {
  Scale,
  Briefcase,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LogIn,
  UploadCloud,
  Clock,
  HelpCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  Lock,
  ChevronDown,
  Phone,
  Mail,
  Video,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const AVAILABLE_SPECIALIZATIONS = [
  "Property Law",
  "Criminal Law",
  "Civil Litigation",
  "Family Law",
  "Corporate Law",
  "Contract Law",
  "Labour Law",
  "Consumer Law",
  "Cyber Law",
];

const CITIES = [
  "New Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Jaipur",
  "Chandigarh",
  "Pune",
  "Hyderabad",
  "Kolkata",
  "Other",
];

const STATE_BAR_COUNCILS = [
  "Bar Council of Delhi",
  "Bar Council of Maharashtra & Goa",
  "Bar Council of Karnataka",
  "Bar Council of Tamil Nadu & Puducherry",
  "Bar Council of Uttar Pradesh",
  "Bar Council of Punjab & Haryana",
  "Bar Council of Rajasthan",
  "Bar Council of West Bengal",
  "Bar Council of Gujarat",
  "Bar Council of Madhya Pradesh",
  "Bar Council of Kerala",
  "Bar Council of Andhra Pradesh & Telangana",
  "Other State Bar Council",
];

export default function LawyerSignup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Wizard Step: 1 = Personal, 2 = Professional, 3 = Consultation, 4 = Documents
  const [currentStep, setCurrentStep] = useState(1);
  const [existingApplication, setExistingApplication] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    confirmPassword: "",
    city: "New Delhi",
    profileImage: user?.profileImage || "",

    // Step 2: Professional
    barCouncilId: "",
    stateOfEnrolment: "Bar Council of Delhi",
    degree: "LL.B.",
    institution: "Faculty of Law, University of Delhi",
    year: "2018",
    experienceYears: "5",
    specializations: ["Property Law", "Civil Litigation"],
    languages: "English, Hindi",
    bio: "",

    // Step 3: Consultation
    consultationFee: "1500",
    consultationModes: ["video", "in_person"],
    scheduleNotes: "Available on weekday evenings and Saturday mornings for video consultations.",

    // Step 4: Documents
    barCertificateUrl: "https://example.com/demo/bar-council-certificate.pdf",
    idProofUrl: "https://example.com/demo/advocate-id-proof.pdf",
    degreeCertUrl: "https://example.com/demo/llb-degree-certificate.pdf",
    supportingDocUrl: "",
    agreeToEthics: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load existing application if user is logged in
  const checkApplicationStatus = useCallback(async () => {
    if (!user || user.role === "admin") return;

    setCheckingStatus(true);
    try {
      const app = await getMyLawyerApplication();
      if (app) {
        setExistingApplication(app);
        // Pre-fill form if correction requested or rejected
        setFormData((prev) => ({
          ...prev,
          barCouncilId: app.barCouncilId || prev.barCouncilId,
          city: app.city || prev.city,
          stateOfEnrolment: app.stateOfEnrolment || prev.stateOfEnrolment,
          experienceYears: String(app.experienceYears || prev.experienceYears),
          consultationFee: String(app.consultationFee || prev.consultationFee),
          specializations: app.specialization && app.specialization.length > 0 ? app.specialization : prev.specializations,
          languages: app.languages ? app.languages.join(", ") : prev.languages,
          bio: app.bio || prev.bio,
          degree: app.education?.[0]?.degree || prev.degree,
          institution: app.education?.[0]?.institution || prev.institution,
          year: String(app.education?.[0]?.year || prev.year),
          consultationModes: app.consultationModes && app.consultationModes.length > 0 ? app.consultationModes : prev.consultationModes,
        }));
      }
    } catch (err) {
      // Ignore not found
    } finally {
      setCheckingStatus(false);
    }
  }, [user]);

  useEffect(() => {
    checkApplicationStatus();
  }, [checkApplicationStatus]);

  // Update name/email when user context becomes available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const handleSpecializationToggle = (spec) => {
    setFormData((prev) => {
      const exists = prev.specializations.includes(spec);
      const updated = exists
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec];
      return { ...prev, specializations: updated };
    });
  };

  const handleModeToggle = (mode) => {
    setFormData((prev) => {
      const exists = prev.consultationModes.includes(mode);
      const updated = exists
        ? prev.consultationModes.filter((m) => m !== mode)
        : [...prev.consultationModes, mode];
      return { ...prev, consultationModes: updated.length ? updated : [mode] };
    });
  };

  const validateStep = (step) => {
    setError("");
    if (step === 1) {
      if (!formData.name.trim()) return "Full name is required.";
      if (!formData.email.trim()) return "Email address is required.";
      if (!formData.phone.trim()) return "Mobile number is required.";
      const phoneRegex = /^(?:\+91|91|0)?([6-9]\d{9})$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-()]/g, ""))) {
        return "Please enter a valid 10-digit Indian mobile number.";
      }
      if (!user) {
        if (!formData.password || formData.password.length < 6) {
          return "Password must be at least 6 characters.";
        }
        if (formData.password !== formData.confirmPassword) {
          return "Confirm password must match password.";
        }
      }
      if (!formData.city) return "City is required.";
      return null;
    }
    if (step === 2) {
      if (!formData.barCouncilId.trim()) return "Bar Council enrolment number is required.";
      if (!formData.degree.trim()) return "Law degree title is required.";
      if (!formData.institution.trim()) return "Law college/university is required.";
      if (!formData.year || Number(formData.year) < 1960) return "Valid graduation year is required.";
      if (formData.specializations.length === 0) return "Please select at least one practice area.";
      if (!formData.bio.trim() || formData.bio.trim().length < 20)
        return "Professional biography must be at least 20 characters.";
      return null;
    }
    if (step === 3) {
      const fee = Number(formData.consultationFee);
      if (!Number.isFinite(fee) || fee < 100) return "Minimum consultation fee is ₹100.";
      if (formData.consultationModes.length === 0) return "Select at least one consultation option.";
      return null;
    }
    if (step === 4) {
      if (!formData.barCertificateUrl.trim()) return "Bar Council Certificate URL or file proof is required.";
      if (!formData.agreeToEthics) return "You must accept the platform compliance declaration.";
      return null;
    }
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all 4 registration steps to guarantee data completeness
    for (let s = 1; s <= 4; s++) {
      const stepErr = validateStep(s);
      if (stepErr) {
        setError(stepErr);
        setCurrentStep(s);
        return;
      }
    }

    setLoading(true);

    try {
      // If user is not logged in, register account first and authenticate
      let activeUser = user;
      if (!activeUser) {
        // 1. Create account using existing registration API
        await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: "client",
        });

        // 2. Log in using the newly created credentials to obtain JWT session tokens
        const loginRes = await loginUser({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        if (loginRes && loginRes.accessToken) {
          login(loginRes);
          activeUser = loginRes.user;
        } else {
          throw new Error("Advocate account created, but automatic sign-in failed. Please log in to complete your application.");
        }
      }

      const docs = [
        {
          title: "Bar Council Enrolment Certificate",
          url: formData.barCertificateUrl.trim(),
          documentType: "bar_certificate",
        },
      ];

      if (formData.idProofUrl && formData.idProofUrl.trim()) {
        docs.push({
          title: "Identity Proof (Bar ID / Govt ID)",
          url: formData.idProofUrl.trim(),
          documentType: "identity_proof",
        });
      }

      if (formData.degreeCertUrl && formData.degreeCertUrl.trim()) {
        docs.push({
          title: "Law Degree Certificate",
          url: formData.degreeCertUrl.trim(),
          documentType: "degree_certificate",
        });
      }

      if (formData.supportingDocUrl && formData.supportingDocUrl.trim()) {
        docs.push({
          title: "Additional Supporting Document",
          url: formData.supportingDocUrl.trim(),
          documentType: "supporting_doc",
        });
      }

      const payload = {
        phone: formData.phone.trim(),
        profileImage: formData.profileImage.trim() || undefined,
        barCouncilId: formData.barCouncilId.trim(),
        stateOfEnrolment: formData.stateOfEnrolment,
        city: formData.city,
        experienceYears: Number(formData.experienceYears) || 1,
        consultationFee: Number(formData.consultationFee) || 500,
        specialization: formData.specializations,
        languages: formData.languages.split(",").map((l) => l.trim()).filter(Boolean),
        bio: formData.bio.trim(),
        lawCollege: formData.institution.trim(),
        graduationYear: Number(formData.year) || 2020,
        consultationModes: formData.consultationModes,
        education: [
          {
            degree: formData.degree.trim(),
            institution: formData.institution.trim(),
            year: Number(formData.year) || 2020,
          },
        ],
        verificationDocuments: docs,
      };

      await applyAsLawyer(payload);
      setSuccess(true);
      await checkApplicationStatus();
    } catch (err) {
      setError(err.message || "Failed to submit lawyer application. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  const lawyerFaqs = [
    {
      q: "How long does Bar Council verification take?",
      a: "Our administrative review team typically processes advocate applications within 24 to 48 business hours. You will see real-time status updates right here on this page.",
    },
    {
      q: "Can I set my own consultation fee?",
      a: "Yes. Advocates retain full autonomy to set their own consultation rates (in INR). You can also adjust your consultation fee at any time from your Lawyer Dashboard.",
    },
    {
      q: "How are consultation fees paid to lawyers?",
      a: "Clients complete payments through Razorpay before attending consultations. Once the consultation concludes, your gross earnings and itemized breakdown are recorded in your dashboard for scheduled payouts.",
    },
    {
      q: "What documents do I need to prepare?",
      a: "You will need a legible scan of your State Bar Council enrolment certificate, advocate identity proof or Certificate of Practice (COP), and your law degree certificate.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
            ← Back to Home
          </Link>

          <Link
            to="/lawyer/documentation"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <HelpCircle className="h-3.5 w-3.5" /> View Eligibility & Required Documents
          </Link>
        </div>

        {/* 1. HERO BANNER SECTION */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl sm:p-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                <Briefcase className="h-4 w-4" /> Advocate Onboarding
              </span>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Join LegalConnect as a Lawyer
              </h1>

              <p className="text-sm text-blue-100 leading-relaxed sm:text-base">
                Build your professional profile, manage consultation requests, and connect with clients through the platform. Receive guaranteed online payments and conduct secure video consultations.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="#application-wizard"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-300 transition"
                >
                  Apply Now <ArrowRight className="h-3.5 w-3.5" />
                </a>

                <Link
                  to="/lawyer/documentation"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  Eligibility Details
                </Link>
              </div>
            </div>

            {/* Banner Illustration */}
            <div className="shrink-0 w-full md:w-72 overflow-hidden rounded-2xl border border-amber-400/20 shadow-lg">
              <img
                src="/images/lawyer_signup_banner.jpg"
                alt="Advocate Onboarding"
                className="w-full h-48 md:h-56 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800 mb-3">
              <Video className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Digital Consultations</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Integrated browser WebRTC video meetings with live waiting rooms and zero third-party software needed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Secure Payments</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Server-calculated consultation fees with Razorpay payment processing and transparent settlement tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-800 mb-3">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Calendar Control</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Create bookable slots matching your court schedule. Accept or decline requests with autonomous ease.
            </p>
          </div>
        </div>

        {/* 2. ALREADY APPROVED LAWYER BANNER */}
        {user?.role === "lawyer" && existingApplication?.verificationStatus === "approved" && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 shadow-sm sm:flex sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold">You are an Approved Advocate!</h3>
              </div>
              <p className="text-xs text-emerald-800">
                Your credentials have already been verified by LegalConnect administration. You can manage slots, consultations, and profile from your dashboard.
              </p>
            </div>
            <Link
              to="/lawyer-dashboard"
              className="mt-4 sm:mt-0 inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
            >
              Go to Lawyer Dashboard →
            </Link>
          </div>
        )}

        {/* 3. APPLICATION STATUS CARD (IF ALREADY SUBMITTED) */}
        {user && existingApplication && existingApplication.verificationStatus !== "approved" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Application Status
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Enrolment ID: {existingApplication.barCouncilId}
                </h3>
              </div>

              <div>
                {existingApplication.verificationStatus === "pending" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Pending Review
                  </span>
                )}
                {existingApplication.verificationStatus === "additional_info_required" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-800">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-600" /> Additional Info Required
                  </span>
                )}
                {existingApplication.verificationStatus === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-800">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" /> Application Rejected
                  </span>
                )}
              </div>
            </div>

            {existingApplication.verificationStatus === "pending" && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Your application is currently being verified by platform administrators.</p>
                <p className="text-blue-800">
                  We cross-reference Bar Council enrollment numbers with State Bar rolls. Standard verification turnaround is 24 to 48 business hours. You will receive an update once reviewed.
                </p>
              </div>
            )}

            {existingApplication.verificationStatus === "additional_info_required" && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-orange-900">
                  <AlertTriangle className="h-4 w-4 text-orange-700" />
                  <span>Reviewer Feedback / Correction Instructions:</span>
                </div>
                <p className="rounded-lg bg-white/70 p-3 font-mono text-[11px] text-orange-900 border border-orange-200">
                  {existingApplication.decisionReason || "Please verify your uploaded documents or bar council ID."}
                </p>
                <p className="text-orange-900 text-[11px]">
                  You may update the relevant details in the application form below and click <strong>"Resubmit Application"</strong>.
                </p>
              </div>
            )}

            {existingApplication.verificationStatus === "rejected" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle className="h-4 w-4 text-red-700" />
                  <span>Rejection Reason:</span>
                </div>
                <p className="rounded-lg bg-white/70 p-3 font-mono text-[11px] text-red-900 border border-red-200">
                  {existingApplication.decisionReason || "Application did not meet platform verification guidelines."}
                </p>
                <p className="text-red-900 text-[11px]">
                  You can update your professional credentials and re-apply below if you believe this was an error.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. MULTI-STEP APPLICATION FORM WIZARD */}
        {(!user || !existingApplication || existingApplication.verificationStatus === "additional_info_required" || existingApplication.verificationStatus === "rejected") && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" id="application-wizard">
            {/* Wizard Header */}
            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                {existingApplication && existingApplication.verificationStatus === "additional_info_required"
                  ? "Update & Resubmit Application"
                  : "New Advocate Application"}
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Advocate Verification Form
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Complete all 4 steps with accurate Bar Council and academic credentials.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="my-6 grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { step: 1, label: "Personal" },
                { step: 2, label: "Professional" },
                { step: 3, label: "Consultation" },
                { step: 4, label: "Documents" },
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => {
                    if (s.step < currentStep) setCurrentStep(s.step);
                  }}
                  className={`cursor-pointer rounded-xl p-2.5 transition border ${
                    currentStep === s.step
                      ? "border-blue-700 bg-blue-900 text-white font-bold shadow-xs"
                      : currentStep > s.step
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider">Step {s.step}</p>
                  <p className="truncate text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Account Info Banner */}
            {!user && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950">
                    <p className="font-bold">New Advocate Account Creation</p>
                    <p className="mt-0.5 text-blue-900">
                      You will register your advocate account and submit your Bar Council credentials in this application. Already registered?{" "}
                      <Link to="/login?role=lawyer" className="font-bold underline text-blue-900">
                        Log in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-950 text-center animate-in fade-in">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-2" />
                <h3 className="text-lg font-bold">Application Submitted Successfully!</h3>
                <p className="mt-1 text-xs text-emerald-800 max-w-md mx-auto">
                  Your credentials have been securely recorded. Our administrative team will verify your Bar Council registration within 24-48 hours.
                </p>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-700" /> Step 1: Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Adv. Rajesh Verma"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh.verma@example.com"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number (WhatsApp for appointment alerts) *
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98111 22334"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Practicing City *
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 bg-white"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!user && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Account Password *
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            minLength={6}
                            placeholder="At least 6 characters"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            minLength={6}
                            placeholder="Repeat password"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Profile Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.profileImage}
                        onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                        placeholder="https://example.com/photos/profile.jpg"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        A professional formal advocate portrait in black coat enhances profile trust.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFESSIONAL INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-700" /> Step 2: Professional Credentials & Practice
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bar Council Enrolment Number *
                      </label>
                      <input
                        type="text"
                        value={formData.barCouncilId}
                        onChange={(e) => setFormData({ ...formData, barCouncilId: e.target.value })}
                        placeholder="e.g. D/1482/2018 or MAH/5678/2015"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State Bar Council of Enrolment *
                      </label>
                      <select
                        value={formData.stateOfEnrolment}
                        onChange={(e) => setFormData({ ...formData, stateOfEnrolment: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 bg-white"
                      >
                        {STATE_BAR_COUNCILS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Highest Law Degree *
                      </label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g. LL.B., LL.M. in Commercial Law"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Law College / University *
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="e.g. Faculty of Law, University of Delhi"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Graduation Year *
                      </label>
                      <input
                        type="number"
                        min="1960"
                        max="2026"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2018"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Years of Active Court Practice *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="65"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        placeholder="5"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Languages Spoken (comma separated) *
                      </label>
                      <input
                        type="text"
                        value={formData.languages}
                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                        placeholder="English, Hindi, Punjabi"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* Specializations Multi-select */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Practice Areas & Specializations (Select all that apply) *
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                          const isSelected = formData.specializations.includes(spec);
                          return (
                            <button
                              type="button"
                              key={spec}
                              onClick={() => handleSpecializationToggle(spec)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                isSelected
                                  ? "bg-blue-900 text-white shadow-xs"
                                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {spec} {isSelected ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Professional Biography & Court Experience *
                      </label>
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Practicing advocate before High Court and District Courts specializing in property disputes, commercial litigation, and contractual drafting..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CONSULTATION & SCHEDULE INFORMATION */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-700" /> Step 3: Consultation Rates & Preferences
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Consultation Fee (in INR) *
                      </label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          value={formData.consultationFee}
                          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          required
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Clients pay this exact rate via Razorpay before the appointment is confirmed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Supported Consultation Modes *
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consultationModes.includes("video")}
                            onChange={() => handleModeToggle("video")}
                            className="h-4 w-4 rounded text-blue-900 focus:ring-blue-500"
                          />
                          <span>WebRTC Online Video Consultation</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consultationModes.includes("in_person")}
                            onChange={() => handleModeToggle("in_person")}
                            className="h-4 w-4 rounded text-blue-900 focus:ring-blue-500"
                          />
                          <span>In-Person Chamber / Office Consultation</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Availability Notes & Chamber Location
                      </label>
                      <textarea
                        rows={2}
                        value={formData.scheduleNotes}
                        onChange={(e) => setFormData({ ...formData, scheduleNotes: e.target.value })}
                        placeholder="Chamber address or general consultation hours..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: VERIFICATION DOCUMENTS */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-700" /> Step 4: Verification Documents
                    </h3>

                    <Link
                      to="/lawyer/documentation"
                      target="_blank"
                      className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Accepted Formats & Criteria <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <p className="text-xs text-slate-500">
                    Provide verifiable URLs or demo document links for administrative review. In production, upload files directly (PDF, JPG, PNG up to 15MB).
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State Bar Council Certificate Proof URL *
                      </label>
                      <input
                        type="url"
                        value={formData.barCertificateUrl}
                        onChange={(e) => setFormData({ ...formData, barCertificateUrl: e.target.value })}
                        placeholder="https://example.com/demo/bar-certificate.pdf"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Identity Proof (Bar ID / Govt ID) Proof URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.idProofUrl}
                        onChange={(e) => setFormData({ ...formData, idProofUrl: e.target.value })}
                        placeholder="https://example.com/demo/id-proof.pdf"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Law Degree Certificate Proof URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.degreeCertUrl}
                        onChange={(e) => setFormData({ ...formData, degreeCertUrl: e.target.value })}
                        placeholder="https://example.com/demo/law-degree.pdf"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* Ethics declaration */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeToEthics}
                          onChange={(e) => setFormData({ ...formData, agreeToEthics: e.target.checked })}
                          className="h-4 w-4 rounded text-blue-900 focus:ring-blue-500 mt-0.5"
                          required
                        />
                        <span>
                          I solemnly declare that the Bar Council registration and educational credentials provided are authentic and currently valid. I understand that false declarations result in permanent platform revocation.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
                  >
                    Next: {currentStep === 1 ? "Professional" : currentStep === 2 ? "Consultation" : "Documents"} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-3 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-300 disabled:opacity-50"
                  >
                    {loading
                      ? "Submitting Application..."
                      : existingApplication && existingApplication.verificationStatus === "additional_info_required"
                      ? "Resubmit Corrected Application"
                      : "Submit for Bar Verification"}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 5. ADVOCATE FREQUENTLY ASKED QUESTIONS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Frequently Asked Questions for Advocates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything you need to know about joining and practicing through LegalConnect
            </p>
          </div>

          <div className="space-y-3">
            {lawyerFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 hover:text-blue-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-blue-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. SUPPORT & CONTACT INFORMATION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Need Onboarding Assistance?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Our advocate support team is here to help with registration, Bar Council ID matching, or portal setup.
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-3 shrink-0 text-xs">
            <a
              href="mailto:support@legalconnect.example.com"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-slate-700 font-semibold hover:bg-slate-50"
            >
              <Mail className="h-3.5 w-3.5 text-blue-700" /> Email Support
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-white font-semibold hover:bg-blue-800"
            >
              <Phone className="h-3.5 w-3.5" /> Contact Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
