import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link to="/" className="text-xs font-bold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Contact LegalConnect Support</h1>
          <p className="mt-2 text-xs text-slate-600">
            For technical queries, platform assistance, advocate onboarding questions, or billing help.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Email Support</h4>
                  <p className="mt-1 text-xs text-slate-600">support@legalconnect.example.com</p>
                  <p className="text-[11px] text-slate-400">Response within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Phone Assistance</h4>
                  <p className="mt-1 text-xs text-slate-600">+91 (011) 4567-8900</p>
                  <p className="text-[11px] text-slate-400">Mon–Fri: 9:30 AM to 6:30 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Headquarters</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Connaught Place, Barakhamba Road, New Delhi 110001, India
                  </p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div>
              {sent ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-bold text-green-900 text-sm">Message Sent</h4>
                  <p className="mt-1 text-xs text-green-800">
                    Thank you for contacting us. A support representative will follow up with you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 uppercase">Your Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 uppercase">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
