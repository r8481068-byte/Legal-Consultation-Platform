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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
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
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-indigo-700 text-white shadow-md shadow-blue-900/20">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Legal<span className="text-blue-700">Connect</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Consultation Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {user?.role === "client" ? (
            <>
              <Link
                to="/"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/client/lawyers"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/client/lawyers")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Find Lawyer
              </Link>
              <Link
                to="/dashboard"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-appointments"
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/my-appointments")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-4 w-4" />
                My Appointment
              </Link>
              <Link
                to="/client/profile"
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/client/profile") || isActive("/my-profile")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/lawyers"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive("/lawyers") || isActive("/client/lawyers")
                    ? "bg-blue-50 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Find Lawyer
              </Link>

              {user?.role === "lawyer" && (
                <>
                  <Link
                    to="/lawyer-dashboard"
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      isActive("/lawyer-dashboard")
                        ? "bg-blue-50 text-blue-800 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/lawyer/edit-profile"
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      isActive("/lawyer/edit-profile")
                        ? "bg-blue-50 text-blue-800 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <UserIcon className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/lawyer/availability"
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      isActive("/lawyer/availability")
                        ? "bg-blue-50 text-blue-800 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Availability
                  </Link>
                  <Link
                    to="/lawyer/about-us"
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      isActive("/lawyer/about-us") || isActive("/lawyer/about")
                        ? "bg-blue-50 text-blue-800 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    About Us
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    isActive("/admin")
                      ? "bg-blue-50 text-blue-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Admin
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
                  className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs font-medium text-blue-700 hover:underline"
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
                              <p className={`text-xs ${n.isRead ? "font-medium text-slate-800" : "font-bold text-blue-950"}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">
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
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 transition hover:bg-slate-100 cursor-pointer focus:outline-none"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || "User"}
                      className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900 text-xs font-bold text-white uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <span className="hidden text-sm font-semibold text-slate-800 sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="hidden rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 capitalize sm:inline">
                    {user.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                      <p className="truncate text-sm font-bold text-slate-900">{user.email}</p>
                    </div>

                    <div className="mt-1 space-y-0.5 text-sm">
                      {user.role === "client" && (
                        <>
                          <Link
                            to="/client/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/my-appointments"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Calendar className="h-4 w-4 text-slate-400" />
                            My Appointments
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                              navigate("/");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 font-medium transition border-t border-slate-100 mt-1"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </>
                      )}

                      {user.role === "lawyer" && (
                        <>
                          <Link
                            to="/lawyer-dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/lawyer/edit-profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/lawyer/availability"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Calendar className="h-4 w-4 text-slate-400" />
                            Availability
                          </Link>
                        </>
                      )}

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldAlert className="h-4 w-4 text-slate-400" />
                          Admin Portal
                        </Link>
                      )}

                      {user.role !== "client" && onOpenProfileSettings && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenProfileSettings();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4 text-slate-400" />
                          Profile & Password
                        </button>
                      )}

                      {user.role !== "client" && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {user?.role === "client" ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/")
                      ? "bg-blue-50 text-blue-800 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/client/lawyers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/client/lawyers")
                      ? "bg-blue-50 text-blue-800 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Find Lawyer
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/dashboard")
                      ? "bg-blue-50 text-blue-800 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/my-appointments")
                      ? "bg-blue-50 text-blue-800 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  My Appointment
                </Link>
                <Link
                  to="/client/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive("/client/profile") || isActive("/my-profile")
                      ? "bg-blue-50 text-blue-800 font-bold"
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
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Home
                </Link>
                <Link
                  to="/lawyers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Find Lawyer
                </Link>

                {user?.role === "lawyer" && (
                  <>
                    <Link
                      to="/lawyer-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/lawyer/edit-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/lawyer/availability"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Availability
                    </Link>
                    <Link
                      to="/lawyer/about-us"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      About Us
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Admin Portal
                  </Link>
                )}

                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
