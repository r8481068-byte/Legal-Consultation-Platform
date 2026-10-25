import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Scale,
  ShieldCheck,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function LegalAid() {
  const eligibleCategories = [
    "Women and children",
    "Members of Scheduled Castes (SC) or Scheduled Tribes (ST)",
    "Industrial workmen & labour dispute workers",
    "Victims of human trafficking or beggars under Article 23",
    "Persons with disabilities (as defined in Rights of Persons with Disabilities Act)",
    "Persons under circumstances of undeserved want (victims of mass disasters, ethnic violence, floods, earthquakes)",
    "Persons in custody, including protective homes or psychiatric hospitals",
    "Citizens whose annual income is less than statutory ceiling (typically ₹1,00,000 to ₹3,00,000 depending on the state).",
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white shadow-md sm:p-10">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
              <HeartHandshake className="h-4 w-4 text-amber-400" />
              Article 39A of the Constitution of India
            </span>
            <h1 className="text-3xl font-black sm:text-4xl">
              Free Legal Aid in India
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Under the Legal Services Authorities Act, 1987, free and competent legal services are guaranteed to eligible citizens to ensure that opportunities for securing justice are not denied by reason of economic or other disabilities.
            </p>
          </div>
        </div>

        {/* Eligibility Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-700" />
            Statutory Eligibility Criteria (Section 12 of the Act)
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            A person is eligible for free legal services provided by government legal services authorities if they fall under any of the following classifications:
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {eligibleCategories.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What Free Legal Services Include */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            What Free Legal Services Include
          </h2>
          <ul className="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed list-disc pl-5">
            <li>Payment of court fee, process fees and all other charges payable in legal proceedings.</li>
            <li>Providing free advocates and counsel in legal proceedings before trial courts, High Courts, and the Supreme Court of India.</li>
            <li>Obtaining and supplying certified copies of judgments, orders, and case documents.</li>
            <li>Preparation of appeal, paper book including translation and printing of documents.</li>
          </ul>
        </div>

        {/* Government Authorities & Helpline */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-8">
          <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-800" />
            Official Legal Services Contact
          </h2>
          <p className="mt-2 text-xs text-blue-900 leading-relaxed">
            Legal aid is administered in India through:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-blue-950">
            <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm">
              <strong className="block text-sm">National Level</strong>
              <p className="mt-1 text-slate-600">National Legal Services Authority (NALSA)</p>
            </div>
            <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm">
              <strong className="block text-sm">State Level</strong>
              <p className="mt-1 text-slate-600">State Legal Services Authorities (SLSA in each High Court)</p>
            </div>
            <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm">
              <strong className="block text-sm">District Level</strong>
              <p className="mt-1 text-slate-600">District Legal Services Authorities (DLSA in District Courts)</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-900 p-4 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-sm">National Legal Aid Toll-Free Helpline: 15100</p>
              <p className="text-xs text-blue-200 mt-0.5">Operated by National Legal Services Authority for public assistance</p>
            </div>
            <a
              href="https://nalsa.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-950 hover:bg-blue-50"
            >
              Visit NALSA Portal <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Informational Public Notice</p>
          <p className="mt-1 max-w-2xl mx-auto">
            LegalConnect is an independent consultation technology platform and is not officially affiliated with NALSA or any statutory legal aid authority. This guide is provided for public awareness of constitutional rights under Indian Law.
          </p>
        </div>
      </div>
    </div>
  );
}
