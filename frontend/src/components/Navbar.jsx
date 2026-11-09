import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../services/notificationService";
import {
  Scale,
  Bell,
  User as UserIcon,
  LogOut,
  Calendar,
  Briefcase,
  ShieldAlert,
  Menu,
  X,
  CheckCircle,
  FileText,
  Info,
  ChevronDown,
} from "lucide-react";

export default function Navbar({ onOpenProfileSettings }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications for logged-in user
  const authIdentifier = user?._id || user?.id || user?.email;
  useEffect(() => {
    if (!authIdentifier) return;

    let mounted = true;
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications();
        if (mounted) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Silently fail if server is unreachable
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s refresh
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [authIdentifier]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link
          to={
            user?.role === "client"
              ? "/"
              : user?.role === "lawyer"
              ? "/lawyer-dashboard"
              : user?.role === "admin"
              ? "/admin"
              : "/"
          }
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B132B] via-[#101C3A] to-[#2457D6] text-white shadow-sm ring-1 ring-slate-900/10">
            <Scale className="h-5 w-5 text-[#D9A441]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
              Legal<span className="text-[#2457D6]">Connect</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Consultation Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {user?.role === "client" ? (
            <>
              <Link
                to="/"
                className={`rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/client/lawyers"
                className={`rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/client/lawyers")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Find Lawyer
              </Link>
              <Link
                to="/dashboard"
                className={`rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-appointments"
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/my-appointments")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>My Appointments</span>
              </Link>
              <Link
                to="/client/profile"
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/client/profile") || isActive("/my-profile")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>My Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                  isActive("/")
                    ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Home
              </Link>
              {user?.role !== "lawyer" && (
                <Link
                  to={!user ? "/register?redirect=/lawyers" : "/lawyers"}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                    isActive("/lawyers") || isActive("/client/lawyers")
                      ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Find Lawyer
                </Link>
              )}

              {user?.role === "lawyer" && (
                <>
                  <Link
                    to="/lawyer-dashboard"
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                      isActive("/lawyer-dashboard")
                        ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/lawyer/edit-profile"
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                      isActive("/lawyer/edit-profile")
                        ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/lawyer/availability"
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                      isActive("/lawyer/availability")
                        ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Availability</span>
                  </Link>
                  <Link
                    to="/lawyer/about-us"
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                      isActive("/lawyer/about-us") || isActive("/lawyer/about")
                        ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>About Us</span>
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition ${
                    isActive("/admin")
                      ? "bg-blue-50 text-[#2457D6] border border-blue-100 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Section: Auth Actions & Notifications */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-sm font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#2457D6] border border-blue-200">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-[#2457D6] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-slate-100 text-sm">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`cursor-pointer p-2.5 rounded-xl transition ${
                              n.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs ${n.isRead ? "font-medium text-slate-800" : "font-bold text-[#0B132B]"}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Section */}
              <div className="relative flex items-center gap-2" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 transition hover:bg-slate-100/80 cursor-pointer focus:outline-none"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || "User"}
                      className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B132B] text-xs font-bold text-white uppercase shadow-2xs">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <span className="hidden text-xs font-bold text-slate-800 sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="hidden rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 capitalize sm:inline">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="truncate text-xs font-bold text-slate-900">{user.email}</p>
                    </div>

                    <div className="mt-1 space-y-0.5 text-xs">
                      {user.role === "client" && (
                        <>
                          <Link
                            to="/client/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/my-appointments"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>My Appointments</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                              navigate("/");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 font-semibold transition border-t border-slate-100 mt-1"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </>
                      )}

                      {user.role === "lawyer" && (
                        <>
                          <Link
                            to="/lawyer-dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/lawyer/edit-profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/lawyer/availability"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                          >
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>Availability</span>
                          </Link>
                        </>
                      )}

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                        >
                          <ShieldAlert className="h-4 w-4 text-slate-400" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      {user.role !== "client" && onOpenProfileSettings && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenProfileSettings();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-semibold transition"
                        >
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>Profile & Password</span>
                        </button>
                      )}

                      {user.role !== "client" && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 font-semibold transition border-t border-slate-100 mt-1"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#0B132B] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-1">
          <div className="flex flex-col gap-1.5">
            {user?.role === "client" ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase transition ${
                    isActive("/")
                      ? "bg-blue-50 text-[#2457D6] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/client/lawyers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase transition ${
                    isActive("/client/lawyers")
                      ? "bg-blue-50 text-[#2457D6] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Find Lawyer
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase transition ${
                    isActive("/dashboard")
                      ? "bg-blue-50 text-[#2457D6] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase transition ${
                    isActive("/my-appointments")
                      ? "bg-blue-50 text-[#2457D6] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  My Appointments
                </Link>
                <Link
                  to="/client/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase transition ${
                    isActive("/client/profile") || isActive("/my-profile")
                      ? "bg-blue-50 text-[#2457D6] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate("/");
                  }}
                  className="rounded-xl px-3.5 py-2.5 text-left text-xs font-bold uppercase text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1 border-t border-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                >
                  Home
                </Link>
                {user?.role !== "lawyer" && (
                  <Link
                    to={!user ? "/register?redirect=/lawyers" : "/lawyers"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                  >
                    Find Lawyer
                  </Link>
                )}

                {user?.role === "lawyer" && (
                  <>
                    <Link
                      to="/lawyer-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/lawyer/edit-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/lawyer/availability"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                    >
                      Availability
                    </Link>
                    <Link
                      to="/lawyer/about-us"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                    >
                      About Us
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                  >
                    Admin Portal
                  </Link>
                )}

                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-100"
                  >
                    Account Overview
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
