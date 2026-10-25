import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Clock,
  HelpCircle,
  Phone,
  Mail,
  Scale,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function LawyerDocumentation() {
  const eligibleCriteria = [
    "Advocate must be enrolled with a recognized State Bar Council in India under the Advocates Act, 1961.",
    "Holds a recognized LL.B. (3-year or 5-year integrated) degree from a Bar Council of India (BCI) approved university.",
    "Passed the All India Bar Examination (AIBE), where applicable as mandated by BCI rules.",
    "Must have an active legal practice before the Supreme Court, High Courts, District Courts, or specialized Tribunals (NCLT, NGT, DRT, etc.).",
    "Must not be currently suspended or barred from practice by any disciplinary committee of the Bar Council.",
  ];

  const requiredDocuments = [
    {
      title: "State Bar Council Enrolment Certificate",
      category: "Mandatory",
      desc: "Official Certificate of Enrolment issued by your State Bar Council indicating your permanent or provisional enrolment number (e.g., D/1234/2018 or MAH/5678/2015).",
      formats: "PDF, JPG, PNG",
    },
    {
      title: "Bar Council ID Card / Certificate of Practice (COP)",
      category: "Mandatory",
      desc: "Clear front-and-back scan of your advocate identification card or valid Certificate of Practice proving active practicing status.",
      formats: "PDF, JPG, PNG",
    },
    {
      title: "Law Degree Certificate (LL.B. / LL.M.)",
      category: "Mandatory",
      desc: "Degree certificate or provisional degree certificate issued by an approved university or faculty of law.",
      formats: "PDF, JPG, PNG",
    },
    {
      title: "Government-Issued Identity Proof",
      category: "Mandatory",
      desc: "Aadhaar Card, Passport, Voter ID, or Driving License matching the legal name on your Bar Council credentials.",
      formats: "PDF, JPG, PNG",
    },
    {
      title: "Additional Supporting Credentials (Optional)",
      category: "Optional",
      desc: "High Court bar association membership card, specialized certifications, or judicial clerkship certificates.",
      formats: "PDF, JPG, PNG",
    },
  ];

  const commonCorrectionReasons = [
    {
      reason: "Blurry or Low-Resolution Document Scan",
      fix: "Ensure all certificate numbers, seals, and signatures are legible. Avoid photographing documents at sharp angles or in dim light.",
    },
    {
      reason: "Mismatched Name or Typographical Errors",
      fix: "The name in your LegalConnect profile must exactly match the name registered on your Bar Council enrollment certificate.",
    },
    {
      reason: "Expired Provisional Enrollment Without COP",
      fix: "If your provisional 2-year enrolment has lapsed, upload your permanent Certificate of Practice (COP) or proof of AIBE clearance.",
    },
    {
      reason: "Cropped or Partial Certificate",
      fix: "Upload complete, uncropped documents displaying all four borders and official State Bar Council seals.",
    },
    {
      reason: "Unsupported File Format or Excessive Size",
      fix: "Files must be in PDF, JPG, or PNG format and remain under the maximum limit of 15 MB per document.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/lawyer/signup"
            className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1"
          >
            ← Back to Lawyer Signup
          </Link>

          <span className="text-xs text-slate-500 font-medium">
            Platform Verification Policy • Version 2.4
          </span>
        </div>

        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl sm:p-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
              <Scale className="h-4 w-4" /> Professional Onboarding Policy
            </span>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Lawyer Application Documentation & Eligibility Guide
            </h1>

            <p className="text-sm text-blue-100 leading-relaxed sm:text-base">
              To preserve client trust and maintain strict adherence to ethical legal standards, LegalConnect verifies the credentials of every advocate before their profile is published for client discovery. Review our required documents and eligibility criteria below.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/lawyer/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-300 transition"
              >
                Apply for Verification <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#required-documents"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                View Required Documents
              </a>
            </div>
          </div>
        </div>

        {/* 1. Who Can Apply & Professional Eligibility */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                1. Professional Eligibility Criteria
              </h2>
              <p className="text-xs text-slate-500">
                Who is eligible to offer online legal consultations on LegalConnect
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            LegalConnect welcomes advocates across India who hold active licenses to practice law. Applicants must meet the statutory definitions set forth under the Advocates Act, 1961:
          </p>

          <div className="space-y-3">
            {eligibleCriteria.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
            <strong>Important Regulatory Notice:</strong> LegalConnect operates as a technology consultation infrastructure provider in compliance with the Bar Council of India guidelines. The platform does not solicit legal business or guarantee case outcomes. Registered advocates act independently and provide legal counsel under their own professional responsibility.
          </div>
        </section>

        {/* 2. Documents Required */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6" id="required-documents">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                2. Mandatory & Supporting Verification Documents
              </h2>
              <p className="text-xs text-slate-500">
                Clear documentation required during Step 4 of the onboarding wizard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-[11px] font-bold text-amber-400">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {doc.title}
                    </h3>
                  </div>

                  <span
                    className={`inline-block self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      doc.category === "Mandatory"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {doc.category}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-8">
                  {doc.desc}
                </p>

                <div className="mt-3 flex items-center gap-2 pl-8 text-[11px] font-mono text-slate-500">
                  <UploadCloud className="h-3.5 w-3.5 text-blue-700" />
                  <span>Accepted Formats: {doc.formats} • Max Size: 15 MB</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Review Process & Timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                3. Application Review Steps & Timelines
              </h2>
              <p className="text-xs text-slate-500">
                What happens after you submit your application
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-xs mb-3">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-900">Submission</h4>
              <p className="mt-1 text-[11px] text-slate-500">
                Application details & document scans are received securely.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-xs mb-3">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-900">Bar ID Check</h4>
              <p className="mt-1 text-[11px] text-slate-500">
                Enrolment number cross-checked against State Bar Council rolls.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-xs mb-3">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-900">Admin Decision</h4>
              <p className="mt-1 text-[11px] text-slate-500">
                Approved, correction requested, or rejected within 24-48 hours.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-xs mb-3">
                4
              </span>
              <h4 className="text-xs font-bold text-slate-900">Go Live</h4>
              <p className="mt-1 text-[11px] text-slate-500">
                Configure your bookable consultation slots & start consulting.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Common Correction Reasons */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                4. Common Reasons an Application May Need Correction
              </h2>
              <p className="text-xs text-slate-500">
                Avoid delays by reviewing these frequent verification bottlenecks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {commonCorrectionReasons.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/50"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.reason}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                  <strong>How to fix:</strong> {item.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Post-Approval Next Steps */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                5. What Happens After Approval?
              </h2>
              <p className="text-xs text-slate-500">
                Getting started with your verified Lawyer Portal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-700">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <p className="font-bold text-slate-900">1. Instant Role Transition</p>
              <p className="text-[11px] text-slate-500">
                Your account automatically upgrades to Lawyer status with access to the full Lawyer Dashboard.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <p className="font-bold text-slate-900">2. Calendar Slot Creation</p>
              <p className="text-[11px] text-slate-500">
                Set custom bookable consultation slots matching your court calendar and availability preferences.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <p className="font-bold text-slate-900">3. Direct Client Bookings</p>
              <p className="text-[11px] text-slate-500">
                Receive appointment notifications, review legal notes, chat with clients, and conduct WebRTC meetings.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Onboarding Assistance & Contact */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white sm:flex sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-lg font-bold">Have Questions About Your Documentation?</h3>
            <p className="text-xs text-slate-300">
              Our advocate onboarding team is available Monday to Friday (9:30 AM – 6:30 PM IST) to assist with certificate verification questions.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-400" /> advocates@legalconnect.example.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-400" /> +91 (011) 4567-8920
              </span>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 shrink-0">
            <Link
              to="/lawyer/signup"
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-300 transition"
            >
              Start Application →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
