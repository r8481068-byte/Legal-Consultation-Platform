import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  updatePlatformSettings,
} from "../../services/adminService";

export default function AdminSettings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'security', 'platform'
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Platform Settings Form
  const [platformForm, setPlatformForm] = useState({
    platformFeePercent: 10,
    maintenanceMode: false,
    maintenanceMessage: "LegalConnect is currently undergoing scheduled maintenance. Please check back shortly.",
    emailNotificationsEnabled: true,
    autoApproveReviews: false,
    supportEmail: "support@legalconnect.com",
    supportPhone: "+91-9876543210",
  });
  const [platformSaving, setPlatformSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getAdminSettings();
      if (res.success) {
        if (res.admin) {
          setProfileForm({
            name: res.admin.name || "",
            email: res.admin.email || "",
            phone: res.admin.phone || "",
            role: res.admin.role || "admin",
          });
        }
        if (res.settings) {
          setPlatformForm({
            platformFeePercent: res.settings.platformFeePercent ?? 10,
            maintenanceMode: Boolean(res.settings.maintenanceMode),
            maintenanceMessage: res.settings.maintenanceMessage || "LegalConnect is currently undergoing scheduled maintenance.",
            emailNotificationsEnabled: res.settings.emailNotificationsEnabled ?? true,
            autoApproveReviews: Boolean(res.settings.autoApproveReviews),
            supportEmail: res.settings.supportEmail || "support@legalconnect.com",
            supportPhone: res.settings.supportPhone || "+91-9876543210",
          });
        }
      } else {
        setErrorMsg(res.message || "Failed to load admin settings");
      }
    } catch (err) {
      setErrorMsg(err.message || "Network error loading settings");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setErrorMsg("");
      const res = await updateAdminProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      });
      if (res.success) {
        showSuccess("Admin profile updated successfully");
        if (updateUser && res.admin) {
          updateUser(res.admin);
        }
      } else {
        setErrorMsg(res.message || "Failed to update profile");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("New password and confirm password do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long");
      return;
    }

    try {
      setPasswordSaving(true);
      setErrorMsg("");
      const res = await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        showSuccess("Password changed successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setErrorMsg(res.message || "Failed to update password");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePlatformSubmit = async (e) => {
    e.preventDefault();
    try {
      setPlatformSaving(true);
      setErrorMsg("");
      const res = await updatePlatformSettings(platformForm);
      if (res.success) {
        showSuccess("Platform configuration saved successfully");
      } else {
        setErrorMsg(res.message || "Failed to save platform configuration");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update platform settings");
    } finally {
      setPlatformSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of the Admin Panel?")) {
      await logout();
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Settings & Configuration</h1>
        <p className="text-sm text-slate-500">
          Manage your administrator profile, security credentials, and global platform operational policies.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800 text-sm">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-600 hover:text-rose-800 text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Administrator Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Security & Password
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "platform"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Platform Policies
        </button>
      </div>

      {/* Tab 1: Administrator Profile */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update your primary administrative contact details.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={profileForm.email}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Administrative email address is locked for system integrity.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                System Role
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                {profileForm.role}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {profileSaving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Change Admin Password</h2>
            <p className="text-xs text-slate-500">
              Ensure your account is protected with a strong, complex passphrase containing at least 8 characters.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {passwordSaving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Session Logout Action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Administrative Session</h3>
              <p className="text-xs text-slate-500">
                End your authenticated administrative session on this workstation.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition self-start sm:self-center"
            >
              Sign Out of Admin Console
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Policies */}
      {activeTab === "platform" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Operational Policies</h2>
            <p className="text-xs text-slate-500">
              Configure system fees, public maintenance banners, and automated moderation settings.
            </p>
          </div>

          <form onSubmit={handlePlatformSubmit} className="space-y-5 max-w-xl">
            {/* Platform Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Consultation Platform Fee (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={platformForm.platformFeePercent}
                  onChange={(e) =>
                    setPlatformForm({ ...platformForm, platformFeePercent: Number(e.target.value) })
                  }
                  className="w-32 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">
                  Percentage retained by LegalConnect per appointment booking.
                </span>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-800">Platform Maintenance Mode</span>
                  <p className="text-xs text-slate-500">
                    When enabled, clients and advocates will see a maintenance notice upon visiting.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platformForm.maintenanceMode}
                    onChange={(e) =>
                      setPlatformForm({ ...platformForm, maintenanceMode: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {platformForm.maintenanceMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Public Maintenance Notice
                  </label>
                  <textarea
                    rows={2}
                    value={platformForm.maintenanceMessage}
                    onChange={(e) =>
                      setPlatformForm({ ...platformForm, maintenanceMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-800">Transactional Email Notifications</span>
                <p className="text-xs text-slate-500">
                  Dispatch email notifications on appointment bookings, status updates, and reminders.
                </p>
              </div>
              <input
                type="checkbox"
                checked={platformForm.emailNotificationsEnabled}
                onChange={(e) =>
                  setPlatformForm({ ...platformForm, emailNotificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {/* Review Auto-Approve */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-800">Auto-Approve Client Reviews</span>
                <p className="text-xs text-slate-500">
                  Automatically publish newly submitted reviews without requiring manual admin approval.
                </p>
              </div>
              <input
                type="checkbox"
                checked={platformForm.autoApproveReviews}
                onChange={(e) =>
                  setPlatformForm({ ...platformForm, autoApproveReviews: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {/* Support Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Public Support Email
                </label>
                <input
                  type="email"
                  value={platformForm.supportEmail}
                  onChange={(e) =>
                    setPlatformForm({ ...platformForm, supportEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Public Support Phone
                </label>
                <input
                  type="text"
                  value={platformForm.supportPhone}
                  onChange={(e) =>
                    setPlatformForm({ ...platformForm, supportPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={platformSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {platformSaving ? "Saving Configuration..." : "Save Platform Policies"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
