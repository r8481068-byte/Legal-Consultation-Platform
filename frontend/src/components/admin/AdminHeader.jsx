import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Calendar,
  User,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function AdminHeader({
  onToggleSidebar,
  currentTitle = "Dashboard",
  adminUser = null,
  onLogout,
  dateRange = "30d",
  onDateRangeChange,
  unreadNotificationsCount = 0
}) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminName = adminUser?.name || "System Administrator";
  const adminEmail = adminUser?.email || "admin@legalconnect.in";
  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SA";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-2xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
            {currentTitle}
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium hidden sm:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LegalConnect Admin Suite</span>
          </div>
        </div>
      </div>

      {/* Right Actions: Date Filter, Notification Bell, Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Global Date Filter Dropdown */}
        {onDateRangeChange && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-600" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
              aria-label="Select date range"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">This Year</option>
            </select>
          </div>
        )}

        {/* Notifications Icon Button */}
        <Link
          to="/admin/notifications"
          className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          title="Notifications & Broadcasts"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white ring-2 ring-white">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-1 sm:px-2.5 sm:py-1.5 text-left hover:border-slate-300 transition shadow-2xs"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-900 to-slate-900 text-white font-extrabold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                {adminName}
              </p>
              <span className="text-[10px] font-semibold text-blue-900">
                Super Admin
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-900">{adminName}</p>
                <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-500" />
                  <span>Admin Settings</span>
                </Link>
                <Link
                  to="/admin/activity-logs"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Shield className="h-3.5 w-3.5 text-slate-500" />
                  <span>Audit Logs</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
