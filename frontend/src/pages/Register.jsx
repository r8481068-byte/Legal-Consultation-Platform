
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.name.trim().length < 2 ||
        formData.name.trim().length > 50) {
      setError("Name must be between 2 and 50 characters.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.phone.trim()
          ? { phone: formData.phone.trim() }
          : {}),
      };

      const result = await registerUser(payload);
      setMessage(result.message || "Registration successful!");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-blue-800 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join LegalConnect to get started.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              autoComplete="name"
              required
              placeholder="Enter your name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone number (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-800 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
