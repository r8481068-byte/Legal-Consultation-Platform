import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Shield,
  Briefcase,
  UserPlus,
  LogIn,
  LogOut,
  Calendar,
  Settings,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export default function AccountMenu({ onOpenProfileSettings, isMobile = false, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "lawyer") return "/lawyer-dashboard";
    if (user.role === "admin") return "/admin";
    return "/dashboard";
  };

  const getAppointmentsPath = () => {
    if (!user) return "/login";
    if (user.role === "lawyer") return "/lawyer-dashboard";
    if (user.role === "admin") return "/admin";
    return "/my-appointments";
  };

  // Mobile layout
  if (isMobile) {
    if (user) {
      return (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role} Account</p>
            </div>
          </div>
          <Link
            to={getDashboardPath()}
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4 text-blue-700" /> Dashboard
          </Link>
          {user.role === "lawyer" && (
            <>
              <Link
                to="/lawyer/edit-profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4 text-blue-700" /> My Profile
              </Link>
              <Link
                to="/lawyer/availability"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Calendar className="h-4 w-4 text-blue-700" /> Availability
              </Link>
            </>
          )}
          {user.role !== "lawyer" && (
            <Link
              to={getAppointmentsPath()}
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Calendar className="h-4 w-4 text-blue-700" /> My Consultations
            </Link>
          )}
          {user.role === "client" && (
            <Link
              to="/client/profile-completion"
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Booking Eligibility & Profile
            </Link>
          )}
          {onOpenProfileSettings && (
            <button
              type="button"
              onClick={() => {
                onOpenProfileSettings();
                handleLinkClick();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <User className="h-4 w-4 text-blue-700" /> Profile Settings
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 border-t border-slate-200 pt-3">
        <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">My Account</p>
        <Link
          to="/login?role=client"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogIn className="h-4 w-4 text-blue-800" /> Client Login
        </Link>
        <Link
          to="/login?role=lawyer"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Briefcase className="h-4 w-4 text-amber-600" /> Lawyer Login
        </Link>
        <Link
          to="/login?role=admin"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Shield className="h-4 w-4 text-emerald-600" /> Admin Login
        </Link>
        <Link
          to="/register"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <UserPlus className="h-4 w-4 text-blue-700" /> Client Register
        </Link>
        <Link
          to="/lawyer/signup"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
        >
          <Briefcase className="h-4 w-4 text-blue-800" /> Lawyer Signup
        </Link>
      </div>
    );
  }

  // Desktop dropdown
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition hover:text-blue-700 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>MY ACCOUNT</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          {user ? (
            <>
              {/* Authenticated user header */}
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  {user.role}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to={getDashboardPath()}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  Dashboard
                </Link>

                {user.role === "lawyer" && (
                  <>
                    <Link
                      to="/lawyer/edit-profile"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      My Profile
                    </Link>
                    <Link
                      to="/lawyer/availability"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                    >
                      <Calendar className="h-4 w-4 text-slate-500" />
                      Availability
                    </Link>
                  </>
                )}

                {user.role !== "lawyer" && (
                  <Link
                    to={getAppointmentsPath()}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                  >
                    <Calendar className="h-4 w-4 text-slate-500" />
                    My Consultations
                  </Link>
                )}

                {onOpenProfileSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProfileSettings();
                      handleLinkClick();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Profile Settings
                  </button>
                )}

                {user.role === "client" && (
                  <Link
                    to="/client/profile-completion"
                    onClick={handleLinkClick}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-800"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Booking Eligibility & Profile
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated options */}
              <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Access Portals
              </div>

              <Link
                to="/login?role=client"
                onClick={handleLinkClick}
                className="group flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-900"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Client Login</p>
                    <p className="text-[10px] text-slate-500">Book consultations & chat</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/login?role=lawyer"
                onClick={handleLinkClick}
                className="group flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-amber-50/70 hover:text-amber-900"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Lawyer Login</p>
                    <p className="text-[10px] text-slate-500">Manage slots & clients</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/login?role=admin"
                onClick={handleLinkClick}
                className="group flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-900"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Admin Login</p>
                    <p className="text-[10px] text-slate-500">Platform moderation</p>
                  </div>
                </div>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <Link
                to="/register"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-800"
              >
                <UserPlus className="h-4 w-4 text-slate-400" />
                Client Register
              </Link>

              <Link
                to="/lawyer/signup"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              >
                <Briefcase className="h-4 w-4 text-blue-700" />
                Lawyer Signup (Apply)
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
