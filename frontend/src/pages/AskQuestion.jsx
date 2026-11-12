import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HelpCircle,
  Scale,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function AskQuestion() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/register?redirect=/ask-question", { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    category: "Property Law",
    city: "New Delhi",
    question: "",
    contactEmail: user?.email || "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.title.trim().length < 5) {
      setError("Please provide a descriptive question title (at least 5 characters).");
      return;
    }

    if (formData.question.trim().length < 20) {
      setError("Please describe your legal issue with sufficient context (at least 20 characters).");
      return;
    }

    // Generate reference ticket
    const generatedTicket = "LQ-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedTicket);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Community Legal Guidance
              </span>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                Ask a Free Legal Question
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Submit your legal query to receive guidance on applicable statutory provisions, court jurisdiction, and next steps. For complex ongoing litigation or urgent bail, consult a verified advocate directly.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center animate-in fade-in">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
              <h3 className="text-xl font-bold text-emerald-900">Your Question Has Been Recorded</h3>
              <p className="mt-1 text-xs font-mono font-semibold text-emerald-800">
                Reference ID: {ticketId}
              </p>
              <p className="mt-3 text-sm text-emerald-800 max-w-md mx-auto">
                Thank you for submitting your query. Our panel advocates review community questions regularly. You will receive notifications or updates once an answer is posted.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) navigate("/register?redirect=/lawyers");
                    else if (user.role === "client") navigate("/lawyers");
                    else navigate("/lawyer-dashboard?restricted=booking");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Consult a Lawyer Online
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      title: "",
                      category: "Property Law",
                      city: "New Delhi",
                      question: "",
                      contactEmail: "",
                    });
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ask Another Question
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="q-title" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Question Summary / Subject *
                </label>
                <input
                  id="q-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Landlord refusing to return security deposit in Delhi"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-cat" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Category *
                  </label>
                  <select
                    id="q-cat"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Property Law">Property & Real Estate</option>
                    <option value="Family Law">Family & Divorce Law</option>
                    <option value="Criminal Law">Criminal Defense & Police Matters</option>
                    <option value="Corporate Law">Corporate & Contract Disputes</option>
                    <option value="Civil Litigation">Civil Law & Recovery</option>
                    <option value="Consumer Law">Consumer Forum & Product Defect</option>
                    <option value="Labour Law">Employment & Service Disputes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="q-city" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Your City *
                  </label>
                  <input
                    id="q-city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="q-desc" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Describe Your Legal Concern *
                </label>
                <textarea
                  id="q-desc"
                  rows={5}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Explain the background of your issue, timeline, agreements signed, and specific questions you have..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Please do not include confidential personal identity numbers like Aadhaar or bank account credentials.
                </p>
              </div>

              <div>
                <label htmlFor="q-email" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Email Address for Updates (Optional)
                </label>
                <input
                  id="q-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition"
              >
                Submit Legal Question
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
