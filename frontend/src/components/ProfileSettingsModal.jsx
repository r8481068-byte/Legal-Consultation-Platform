import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../services/authService";
import { User, Lock, CheckCircle, AlertCircle, X, Save } from "lucide-react";

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      // Update Auth context storage
      const token = sessionStorage.getItem("accessToken");
      const refreshToken = sessionStorage.getItem("refreshToken");
      login({ accessToken: token, refreshToken, user: res.user });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Account Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setError("");
              setSuccess("");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "profile"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" />
            Profile Details
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setError("");
              setSuccess("");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "password"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="h-4 w-4" />
            Security & Password
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Role
                </label>
                <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 capitalize">
                  {user?.role || "client"}
                </span>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
