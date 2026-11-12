import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser, updateProfile, updateClientIdentity } from "../services/authService";
import {
  getMyAppointments,
  cancelAppointment,
} from "../services/appointmentService";
import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
} from "../services/paymentService";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

// Modals
import ChatModal from "../components/ChatModal";
import DocumentModal from "../components/DocumentModal";
import ReceiptModal from "../components/ReceiptModal";
import ReviewModal from "../components/ReviewModal";
import AppointmentSummaryModal from "../components/AppointmentSummaryModal";
import ClientLawyerDirectory from "../components/ClientLawyerDirectory";
import {
  EditClientPersonalModal,
  EditClientAboutModal,
  ChangePasswordModal,
  CancelAppointmentModal,
  LogoutModal,
} from "../components/ClientProfileModals";

// Icons
import {
  Scale,
  Home,
  LayoutDashboard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Bell,
  User,
  LogOut,
  X,
  Menu,
  Calendar,
  CreditCard,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileText,
  MessageSquare,
  Video,
  Camera,
  Loader2,
  AlertCircle,
  Sparkles,
  Gavel,
  Shield,
  Lock,
  RefreshCw,
  Ban,
  ArrowRight,
  Star,
  CheckCheck,
  Phone,
  Mail,
  MapPin,
  UploadCloud,
  Check,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pending consultation context from booking attempt
  const [pendingBooking, setPendingBooking] = useState(() => {
    try {
      const raw = sessionStorage.getItem("pendingConsultation");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location.state?.fromBooking) {
      const raw = sessionStorage.getItem("pendingConsultation");
      if (raw) {
        try {
          setPendingBooking(JSON.parse(raw));
        } catch {
          setPendingBooking({
            lawyerId: location.state.lawyerId,
            lawyerName: location.state.lawyerName,
          });
        }
      } else if (location.state.lawyerId) {
        setPendingBooking({
          lawyerId: location.state.lawyerId,
          lawyerName: location.state.lawyerName,
        });
      }
    }
  }, [location.state]);

  // Valid Tabs
  const validTabs = useMemo(
    () => [
      "dashboard",
      "find-lawyer",
      "completed",
      "pending",
      "cancelled",
      "notifications",
      "profile",
    ],
    []
  );

  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL query parameters
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("dashboard");
    }
  }, [tabParam, validTabs]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setMobileSidebarOpen(false);
  };

  // Core Data States
  const [profileData, setProfileData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [payingId, setPayingId] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all"); // "all" | "unread"

  // UI / Responsive / Modal States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Appointment Modals State
  const [summaryAppointment, setSummaryAppointment] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [receiptAppointment, setReceiptAppointment] = useState(null);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);

  // Profile Edit Modals State
  const [editPersonalModalOpen, setEditPersonalModalOpen] = useState(false);
  const [editAboutModalOpen, setEditAboutModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Identity Form State
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [identityAadhaar, setIdentityAadhaar] = useState("");
  const [identityPan, setIdentityPan] = useState("");
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identityError, setIdentityError] = useState("");
  const [identitySuccess, setIdentitySuccess] = useState("");

  // Profile Photo Upload Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const updateUserRef = useRef(updateUser);
  useEffect(() => {
    updateUserRef.current = updateUser;
  }, [updateUser]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Data Loading Callbacks
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userRes, apptRes] = await Promise.allSettled([
        getCurrentUser(),
        getMyAppointments(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.user) {
        setProfileData(userRes.value.user);
        updateUserRef.current?.(userRes.value.user);
      }

      if (apptRes.status === "fulfilled" && Array.isArray(apptRes.value)) {
        setAppointments(apptRes.value);
      }
    } catch (err) {
      setError(err.message || "Failed to load client portal data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotificationsData = useCallback(async () => {
    try {
      setNotifsLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    loadNotificationsData();
  }, [loadDashboardData, loadNotificationsData]);

  // Derived Client Profile Information
  const clientName = profileData?.name || user?.name || "Client";
  const clientEmail = profileData?.email || user?.email || "Not provided";
  const clientPhone =
    profileData?.phone || user?.phone || "Not provided";
  const clientImage = profileData?.profileImage || user?.profileImage || null;
  const clientLocation =
    [profileData?.cityVillage, profileData?.district, profileData?.state]
      .filter(Boolean)
      .join(", ") ||
    profileData?.city ||
    user?.city ||
    user?.location ||
    "Location not provided";

  const initials =
    clientName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  // Profile Completeness Calculation
  const calculateCompleteness = (u) => {
    if (!u) return 0;
    let score = 0;
    if (u.name) score += 20;
    if (u.email) score += 20;
    if (u.phone) score += 15;
    if (u.profileImage) score += 10;
    if (u.cityVillage || u.district || u.state) score += 15;
    if (u.pincode) score += 10;
    if (u.about && u.about.trim().length > 10) score += 10;
    return Math.min(100, score);
  };

  const completenessPercentage =
    profileData?.completeness?.percentage ?? calculateCompleteness(profileData);

  // Filtered Appointments
  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === "completed"),
    [appointments]
  );

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "pending"),
    [appointments]
  );

  const cancelledAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "cancelled" || a.status === "rejected"
      ),
    [appointments]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "confirmed" && new Date(a.scheduledAt) > new Date()
      ),
    [appointments]
  );

  const nextAppointment = useMemo(
    () =>
      upcomingAppointments.length > 0
        ? [...upcomingAppointments].sort(
            (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
          )[0]
        : null,
    [upcomingAppointments]
  );

  // Counts for Badges
  const completedCount = completedAppointments.length;
  const pendingCount = pendingAppointments.length;
  const cancelledCount = cancelledAppointments.length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Masked Identity Display (Guaranteed Security)
  const maskedAadhaar = profileData?.aadhaarMasked
    ? profileData.aadhaarMasked
    : "•••• •••• XXXX";

  const maskedPan = profileData?.panMasked
    ? profileData.panMasked
    : "•••••XXXX•";

  // Handle Client Identity (Aadhaar & PAN) Secure Update
  const handleUpdateIdentity = async (e) => {
    e.preventDefault();
    setIdentityError("");
    setIdentitySuccess("");

    const cleanAadhaar = identityAadhaar.replace(/[\s\-]/g, "");
    const cleanPan = identityPan.trim().toUpperCase();

    // Validation: 12-digit Indian Aadhaar starting with 2-9
    if (!/^[2-9]\d{11}$/.test(cleanAadhaar)) {
      setIdentityError(
        "Invalid Aadhaar number format. Must be a 12-digit number starting with 2-9."
      );
      return;
    }

    // Validation: 10-character alphanumeric Indian PAN (5 letters, 4 digits, 1 letter)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setIdentityError(
        "Invalid PAN format. Must be 10 characters (5 uppercase letters, 4 digits, 1 letter, e.g. ABCDE1234F)."
      );
      return;
    }

    setIdentitySaving(true);
    try {
      const res = await updateClientIdentity({
        aadhaar: cleanAadhaar,
        pan: cleanPan,
      });

      // Clear raw values from input state immediately for security
      setIdentityAadhaar("");
      setIdentityPan("");

      if (res?.identityStatus || res?.user) {
        setProfileData((prev) => ({
          ...prev,
          aadhaarMasked:
            res.identityStatus?.aadhaarMasked ||
            res.user?.aadhaarMasked ||
            prev?.aadhaarMasked,
          panMasked:
            res.identityStatus?.panMasked ||
            res.user?.panMasked ||
            prev?.panMasked,
          aadhaarVerified:
            res.identityStatus?.aadhaarVerified ??
            res.user?.aadhaarVerified ??
            prev?.aadhaarVerified,
          panVerified:
            res.identityStatus?.panVerified ??
            res.user?.panVerified ??
            prev?.panVerified,
        }));
      } else {
        await loadDashboardData();
      }

      setIdentitySuccess(
        "Identity details updated and encrypted with AES-256-GCM successfully."
      );
      setIsEditingIdentity(false);
    } catch (err) {
      setIdentityError(err.message || "Failed to update identity details.");
    } finally {
      setIdentitySaving(false);
    }
  };

  // Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Formatters
  const formatDateOnly = (date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });
  };

  const formatTimeRange = (startDate, durationMinutes = 30) => {
    if (!startDate) return "Time not set";
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const startStr = start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endStr = end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startStr} – ${endStr}`;
  };

  // Payment Status Badge Helper
  const getPaymentBadge = (appt) => {
    const isPaid = Boolean(
      appt?.isPaid ||
        appt?.paymentStatus === "paid" ||
        appt?.payment?.status === "captured"
    );
    const rawStatus = appt?.paymentStatus || appt?.payment?.status;

    if (isPaid || rawStatus === "paid" || rawStatus === "captured") {
      return {
        label: "Paid",
        classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }
    if (rawStatus === "refund_pending") {
      return {
        label: "Refund Pending",
        classes: "bg-indigo-50 text-indigo-800 border-indigo-200",
      };
    }
    if (rawStatus === "refunded") {
      return {
        label: "Refunded",
        classes: "bg-purple-50 text-purple-800 border-purple-200",
      };
    }
    if (rawStatus === "failed") {
      return {
        label: "Payment Failed",
        classes: "bg-rose-50 text-rose-800 border-rose-200",
      };
    }
    return {
      label: "Unpaid",
      classes: "bg-amber-50 text-amber-800 border-amber-200",
    };
  };

  // Action Handlers
  const handleConfirmCancel = async (appointmentId, reason) => {
    setCancellingId(appointmentId);
    setError("");
    setSuccessMessage("");

    try {
      await cancelAppointment(appointmentId, reason);
      setSuccessMessage("Appointment request cancelled successfully.");
      setCancelModalAppointment(null);
      await loadDashboardData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId("");
    }
  };

  const handlePay = async (appointment) => {
    setError("");
    setSuccessMessage("");
    setPayingId(appointment._id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay payment gateway. Please check your network."
        );
      }

      const orderData = await createPaymentOrder(appointment._id);
      if (!orderData?.data?.orderId) {
        throw new Error("Failed to initialize payment order.");
      }

      const { keyId, orderId, amount, currency } = orderData.data;
      const lawyerName =
        appointment.lawyer?.user?.name || "Verified Advocate";

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "LegalConnect",
        description: `Consultation Fee with Advocate ${lawyerName}`,
        order_id: orderId,
        handler: async function (response) {
          setPayingId(appointment._id);
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessMessage(
              "Payment verified successfully! Your consultation is confirmed."
            );
            await loadDashboardData();
            setTimeout(() => setSuccessMessage(""), 4000);
          } catch (verifyErr) {
            setError(
              verifyErr.message ||
                "Payment was captured but signature verification failed. Please contact support."
            );
          } finally {
            setPayingId("");
          }
        },
        prefill: {
          name: clientName,
          email: clientEmail,
          contact: clientPhone !== "Not provided" ? clientPhone : "",
        },
        theme: {
          color: "#1e3a8a",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || "Unable to proceed with payment.");
    } finally {
      setPayingId("");
    }
  };

  // Notification Handlers
  const handleMarkAllNotifsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all notifications read error:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Mark notif read error:", err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Profile Photo Upload Handlers
  const handleFileSelect = (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setImageModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveProfileImage = async () => {
    if (!previewImage) return;

    setUploadingImage(true);
    setUploadError("");

    try {
      const response = await updateProfile({ profileImage: previewImage });

      if (response?.user) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: response.user.profileImage,
        }));

        if (updateUser) {
          updateUser({ profileImage: response.user.profileImage });
        }

        setSuccessMessage("Profile photo updated successfully!");
        setImageModalOpen(false);
        setPreviewImage(null);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error(response?.message || "Failed to update profile photo.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload profile photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  // Sidebar Menu Items Definition (EXACTLY 9 Items in order)
  const sidebarMenuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => navigate("/"),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => handleTabChange("dashboard"),
    },
    {
      id: "find-lawyer",
      label: "Find Lawyer",
      icon: Search,
      action: () => handleTabChange("find-lawyer"),
    },
    {
      id: "completed",
      label: "Completed Appointments",
      icon: CheckCircle2,
      action: () => handleTabChange("completed"),
      badge:
        completedCount > 0 ? (
          <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-extrabold">
            {completedCount}
          </span>
        ) : null,
    },
    {
      id: "pending",
      label: "Pending Requests",
      icon: Clock,
      action: () => handleTabChange("pending"),
      badge:
        pendingCount > 0 ? (
          <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold">
            {pendingCount}
          </span>
        ) : null,
    },
    {
      id: "cancelled",
      label: "Cancelled Appointments",
      icon: XCircle,
      action: () => handleTabChange("cancelled"),
      badge:
        cancelledCount > 0 ? (
          <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-extrabold">
            {cancelledCount}
          </span>
        ) : null,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      action: () => handleTabChange("notifications"),
      badge:
        unreadNotifsCount > 0 ? (
          <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-extrabold animate-pulse">
            {unreadNotifsCount}
          </span>
        ) : null,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      action: () => handleTabChange("profile"),
      badge:
        completenessPercentage < 100 ? (
          <span className="text-[10px] font-bold text-amber-600">
            {completenessPercentage}%
          </span>
        ) : null,
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      action: () => setLogoutModalOpen(true),
      isDanger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. FIXED LEFT SIDEBAR NAVIGATION (EXACTLY 9 ITEMS)                        */}
      {/* ========================================================================= */}

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-20 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          mobileSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-4">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <Link
              to="/dashboard"
              onClick={() => handleTabChange("dashboard")}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-700 text-white shadow-sm">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  Legal<span className="text-blue-600">Connect</span>
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Client Portal
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Exact 9 Sidebar Menu Items */}
          <nav className="space-y-1" aria-label="Client Sidebar Navigation">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Citizen Navigation
            </p>

            {sidebarMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : item.isDanger
                      ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComponent
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? "text-white"
                          : item.isDanger
                          ? "text-rose-500"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && <div className="shrink-0">{item.badge}</div>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Trust Badge & KYC Progress */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Profile KYC:</span>
              <span className="font-extrabold text-blue-600">
                {completenessPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Identity: <span className="font-semibold text-slate-800">{maskedAadhaar}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-500 px-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-[10px] leading-tight text-slate-600 font-semibold">
              Verified Citizen Portal • BCI Standards
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN MAIN CONTENT AREA                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar with User Profile & Dropdown (NO Notification Bell in Header) */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Client Portal
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Welcome back, {clientName.split(" ")[0]} • LegalConnect Citizen Dashboard
              </p>
            </div>
          </div>

          {/* User Profile on Top Right with Photo, Name & Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200 cursor-pointer"
                aria-expanded={profileDropdownOpen}
              >
                {/* Profile Photo */}
                <div className="relative">
                  {clientImage ? (
                    <img
                      src={clientImage}
                      alt={clientName}
                      className="h-9 w-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Name & Dropdown Chevron */}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {clientName}
                  </p>
                  <p className="text-[10px] text-slate-500">Client Account</p>
                </div>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {clientName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {clientEmail}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleTabChange("profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <label
                      htmlFor="client-header-photo-input"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-slate-400" />
                      <span>Update Photo</span>
                      <input
                        id="client-header-photo-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {loading && (
          <div className="h-0.5 w-full bg-blue-100 overflow-hidden shrink-0">
            <div className="h-full bg-blue-600 animate-pulse w-1/3" />
          </div>
        )}

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-xs font-semibold text-rose-800 flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {successMessage}
              </span>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 1: DASHBOARD (Client Overview, 4 Stats, Upcoming, Recent History) */}
          {/* ===================================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Client Overview Card - Informative Profile Header (Strictly No Buttons/Actions) */}
              <section className="relative overflow-hidden rounded-3xl bg-[#0B132B] text-white p-6 sm:p-8 lg:p-9 shadow-xl border border-slate-800">
                {/* Ambient background glows */}
                <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                  {/* Left: Client Avatar and Information */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                    {/* Profile Photo / Avatar */}
                    <div className="relative shrink-0">
                      {clientImage ? (
                        <img
                          src={clientImage}
                          alt={clientName}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-2 ring-blue-400/40 shadow-lg"
                        />
                      ) : (
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-heading font-black text-2xl sm:text-3xl ring-2 ring-blue-400/40 shadow-lg tracking-wider">
                          {initials}
                        </div>
                      )}
                      <div
                        className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md ring-2 ring-[#0B132B]"
                        title="Active Client Account"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Identity & Contact Details */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white">
                          {clientName}
                        </h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-bold text-blue-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                          Registered Client
                        </span>
                      </div>

                      {/* Contact Badges & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{clientEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span>{clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{clientLocation}</span>
                        </div>
                        {typeof completenessPercentage === "number" && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>
                              Profile Completion:{" "}
                              <strong className="text-white font-semibold">
                                {completenessPercentage}%
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Profile Completion Bar if available */}
                      {typeof completenessPercentage === "number" && (
                        <div className="pt-1 max-w-xs space-y-1">
                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                              style={{
                                width: `${Math.max(5, Math.min(100, completenessPercentage))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Decorative Legal Visual / Illustration (Strictly Non-Interactive) */}
                  <div className="shrink-0 hidden md:flex items-center justify-center self-center lg:self-auto">
                    <div className="relative flex items-center justify-center h-32 w-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-inner">
                      <Scale className="h-16 w-16 text-blue-200/90 drop-shadow-md" />
                      <div className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/90 text-slate-950 shadow-md">
                        <Gavel className="h-4 w-4" />
                      </div>
                      <div className="absolute -bottom-1.5 -left-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
                        <Shield className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4 Compact Statistic Cards with Icons */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => handleTabChange("completed")}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Bookings
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-2xl sm:text-3xl font-black text-slate-900">
                    {appointments.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">All-time consultations</p>
                </div>

                <div
                  onClick={() => handleTabChange("completed")}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Completed
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-2xl sm:text-3xl font-black text-emerald-700">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Concluded sessions</p>
                </div>

                <div
                  onClick={() => handleTabChange("pending")}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-amber-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Pending
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-2xl sm:text-3xl font-black text-amber-600">
                    {pendingCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Awaiting confirmation</p>
                </div>

                <div
                  onClick={() => handleTabChange("cancelled")}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Cancelled
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <XCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-2xl sm:text-3xl font-black text-slate-700">
                    {cancelledCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Cancelled / declined</p>
                </div>
              </section>

              {/* Upcoming Appointment Card (Spotlight) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-extrabold text-slate-900">
                    Upcoming Appointment
                  </h3>
                  {upcomingAppointments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTabChange("completed")}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all consultations</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {nextAppointment ? (
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-blue-300 transition space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Advocate Details */}
                      <div className="flex items-center gap-4">
                        {nextAppointment.lawyer?.user?.profileImage ? (
                          <img
                            src={nextAppointment.lawyer.user.profileImage}
                            alt="Advocate"
                            className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-2xs shrink-0">
                            {nextAppointment.lawyer?.user?.name?.charAt(0) || "A"}
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wide">
                              Confirmed Session
                            </span>
                            <span className="text-xs font-semibold text-slate-500 capitalize">
                              {nextAppointment.consultationType} Consultation
                            </span>
                          </div>

                          <h4 className="font-heading text-lg font-black text-slate-900">
                            Advocate{" "}
                            {nextAppointment.lawyer?.user?.name || "Verified Counsel"}
                          </h4>

                          <p className="text-xs text-slate-500">
                            {Array.isArray(nextAppointment.lawyer?.specialization)
                              ? nextAppointment.lawyer.specialization.join(", ")
                              : nextAppointment.lawyer?.specialization ||
                                "Legal Counsel"}
                            {nextAppointment.lawyer?.city &&
                              ` • ${nextAppointment.lawyer.city}`}
                          </p>
                        </div>
                      </div>

                      {/* Scheduled Date/Time */}
                      <div className="rounded-2xl bg-blue-50/80 border border-blue-100 p-4 text-left sm:text-right shrink-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">
                          Scheduled Date & Time
                        </p>
                        <p className="font-heading font-extrabold text-sm text-slate-900">
                          {formatDateOnly(nextAppointment.scheduledAt)}
                        </p>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center sm:justify-end gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>
                            {formatTimeRange(
                              nextAppointment.scheduledAt,
                              nextAppointment.durationMinutes
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSummaryAppointment(nextAppointment)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Summary</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancelModalAppointment(nextAppointment)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 px-4 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          <Ban className="h-3.5 w-3.5 text-rose-500" />
                          <span>Cancel Consultation</span>
                        </button>
                      </div>

                      {/* Join Video Room */}
                      {(nextAppointment.consultationType === "video" ||
                        nextAppointment.consultationType === "both") && (
                        <Link
                          to={`/video-room/${nextAppointment._id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 shadow-sm transition"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Video Consultation</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs space-y-2">
                    <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                    <h4 className="font-heading text-sm font-bold text-slate-900">
                      No Upcoming Appointments Scheduled
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Browse certified advocates across India and book your next legal consultation slot.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleTabChange("find-lawyer")}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white text-xs hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Find An Advocate</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Recent Activity / Appointment History */}
              <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-heading text-base font-extrabold text-slate-900">
                      Recent Consultation History
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest consultations recorded under your client account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange("completed")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <span>View All History</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">No appointments scheduled yet.</p>
                    <p className="mt-1">Book your first legal consultation with a verified advocate.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {appointments.slice(0, 3).map((appt) => {
                      const lawyerName =
                        appt.lawyer?.user?.name || "Verified Counsel";
                      const lawyerImage = appt.lawyer?.user?.profileImage;
                      return (
                        <div
                          key={appt._id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {lawyerImage ? (
                              <img
                                src={lawyerImage}
                                alt={lawyerName}
                                className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-2xs">
                                {lawyerName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-heading text-xs sm:text-sm font-bold text-slate-900">
                                Advocate {lawyerName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDateOnly(appt.scheduledAt)} •{" "}
                                <span className="capitalize">{appt.consultationType}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                                appt.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : appt.status === "pending"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : appt.status === "completed"
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {appt.status}
                            </span>

                            <button
                              type="button"
                              onClick={() => setSummaryAppointment(appt)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: FIND LAWYER (Client-Facing Advocate Directory)                  */}
          {/* ===================================================================== */}
          {activeTab === "find-lawyer" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200/90 pb-4">
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Find An Advocate</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search certified advocates by specialization, court jurisdiction, experience, and book consultations.
                </p>
              </div>

              <ClientLawyerDirectory />
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: COMPLETED APPOINTMENTS                                         */}
          {/* ===================================================================== */}
          {activeTab === "completed" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200/90 pb-4">
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Completed Consultations ({completedCount})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Concluded legal consultations with summaries, case documents, payment receipts, and client reviews.
                </p>
              </div>

              {completedAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs space-y-3">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="font-heading text-base font-extrabold text-slate-900">
                    No Completed Consultations
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not concluded any legal consultations yet. Once your scheduled sessions are completed by your advocate, records and receipts will be stored here.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("find-lawyer")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Find An Advocate</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {completedAppointments.map((appt) => {
                    const lawyerName =
                      appt.lawyer?.user?.name || "Verified Legal Advocate";
                    const lawyerImage = appt.lawyer?.user?.profileImage;
                    const paymentBadge = getPaymentBadge(appt);
                    const feeAmount =
                      appt.lawyer?.consultationFee || appt.fee || 0;

                    return (
                      <div
                        key={appt._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-blue-300 transition space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {lawyerImage ? (
                              <img
                                src={lawyerImage}
                                alt={lawyerName}
                                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                                {lawyerName.charAt(0)}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wide">
                                  Completed Session
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${paymentBadge.classes}`}
                                >
                                  {paymentBadge.label}
                                </span>
                              </div>

                              <h4 className="font-heading text-base font-black text-slate-900 mt-1">
                                Advocate {lawyerName}
                              </h4>

                              <p className="text-xs text-slate-500">
                                {Array.isArray(appt.lawyer?.specialization)
                                  ? appt.lawyer.specialization.join(", ")
                                  : appt.lawyer?.specialization || "Legal Counsel"}
                                {appt.lawyer?.city && ` • ${appt.lawyer.city}`}
                              </p>
                            </div>
                          </div>

                          {/* Date and Fee metadata */}
                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Consultation Fee
                            </span>
                            <span className="font-heading font-black text-sm text-slate-900">
                              ₹{feeAmount.toLocaleString("en-IN")}
                            </span>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {formatDateOnly(appt.scheduledAt)}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons: Summary, Docs, Chat, Receipt, Feedback */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSummaryAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Summary</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDocumentAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Documents</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setChatAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer border border-blue-200"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                              <span>Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReceiptAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer border border-emerald-200"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Receipt</span>
                            </button>
                          </div>

                          {/* Feedback / Review Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setReviewAppointment(appt)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                          >
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                            <span>Rate & Feedback</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: PENDING REQUESTS                                               */}
          {/* ===================================================================== */}
          {activeTab === "pending" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200/90 pb-4">
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>Pending Consultation Requests ({pendingCount})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appointment requests awaiting confirmation from the advocate. You may cancel requests or complete payment if required.
                </p>
              </div>

              {pendingAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs space-y-3">
                  <Clock className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="font-heading text-base font-extrabold text-slate-900">
                    No Pending Requests
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have no active appointment requests awaiting confirmation. Book a consultation slot with a verified advocate.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("find-lawyer")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Find An Advocate</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingAppointments.map((appt) => {
                    const lawyerName =
                      appt.lawyer?.user?.name || "Verified Legal Advocate";
                    const lawyerImage = appt.lawyer?.user?.profileImage;
                    const paymentBadge = getPaymentBadge(appt);
                    const feeAmount =
                      appt.lawyer?.consultationFee || appt.fee || 0;
                    const isUnpaid = paymentBadge.label === "Unpaid";

                    return (
                      <div
                        key={appt._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-amber-300 transition space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {lawyerImage ? (
                              <img
                                src={lawyerImage}
                                alt={lawyerName}
                                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                                {lawyerName.charAt(0)}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wide">
                                  Pending Confirmation
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${paymentBadge.classes}`}
                                >
                                  {paymentBadge.label}
                                </span>
                              </div>

                              <h4 className="font-heading text-base font-black text-slate-900 mt-1">
                                Advocate {lawyerName}
                              </h4>

                              <p className="text-xs text-slate-500">
                                {Array.isArray(appt.lawyer?.specialization)
                                  ? appt.lawyer.specialization.join(", ")
                                  : appt.lawyer?.specialization || "Legal Counsel"}
                                {appt.lawyer?.city && ` • ${appt.lawyer.city}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Consultation Rate
                            </span>
                            <span className="font-heading font-black text-sm text-slate-900">
                              ₹{feeAmount.toLocaleString("en-IN")}
                            </span>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              Requested: {formatDateOnly(appt.scheduledAt)}
                            </p>
                          </div>
                        </div>

                        {appt.notes && (
                          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 italic border border-slate-100">
                            &ldquo;{appt.notes}&rdquo;
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSummaryAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCancelModalAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200"
                            >
                              <Ban className="h-3.5 w-3.5 text-rose-500" />
                              <span>Cancel Request</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setChatAppointment(appt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer border border-blue-200"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                              <span>Chat</span>
                            </button>
                          </div>

                          {isUnpaid && (
                            <button
                              type="button"
                              onClick={() => handlePay(appt)}
                              disabled={payingId === appt._id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                            >
                              {payingId === appt._id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-3.5 w-3.5" />
                                  <span>Pay Fee (₹{feeAmount})</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: CANCELLED APPOINTMENTS                                         */}
          {/* ===================================================================== */}
          {activeTab === "cancelled" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200/90 pb-4">
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-slate-600" />
                  <span>Cancelled & Declined Appointments ({cancelledCount})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appointments that were cancelled or declined, along with refund statuses.
                </p>
              </div>

              {cancelledAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs space-y-3">
                  <XCircle className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="font-heading text-base font-extrabold text-slate-900">
                    No Cancelled Appointments
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not cancelled or been declined for any consultation appointments.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {cancelledAppointments.map((appt) => {
                    const lawyerName =
                      appt.lawyer?.user?.name || "Verified Legal Advocate";
                    const lawyerImage = appt.lawyer?.user?.profileImage;
                    const paymentBadge = getPaymentBadge(appt);
                    const isRejected = appt.status === "rejected";

                    return (
                      <div
                        key={appt._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {lawyerImage ? (
                              <img
                                src={lawyerImage}
                                alt={lawyerName}
                                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0 grayscale"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                                {lawyerName.charAt(0)}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                                    isRejected
                                      ? "bg-rose-50 text-rose-800 border-rose-200"
                                      : "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {isRejected
                                    ? "Declined by Advocate"
                                    : "Cancelled by Client"}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${paymentBadge.classes}`}
                                >
                                  {paymentBadge.label}
                                </span>
                              </div>

                              <h4 className="font-heading text-base font-black text-slate-900 mt-1">
                                Advocate {lawyerName}
                              </h4>

                              <p className="text-xs text-slate-500">
                                Scheduled for {formatDateOnly(appt.scheduledAt)}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Status
                            </span>
                            <span className="text-xs font-extrabold text-slate-700">
                              {paymentBadge.label === "Refunded"
                                ? "Refund Completed"
                                : paymentBadge.label === "Refund Pending"
                                ? "Refund In Progress"
                                : "No Fee Charged"}
                            </span>
                          </div>
                        </div>

                        {appt.rejectionReason && (
                          <div className="rounded-2xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                            <span className="font-bold">Reason: </span>
                            {appt.rejectionReason}
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setSummaryAppointment(appt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-500" />
                            <span>View Summary</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTabChange("find-lawyer")}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Search className="h-3.5 w-3.5" />
                            <span>Book Another Advocate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: NOTIFICATIONS                                                  */}
          {/* ===================================================================== */}
          {activeTab === "notifications" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span>Client Notifications ({notifications.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Updates on consultation confirmations, payment receipts, and video room notifications.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setNotifFilter("all")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        notifFilter === "all"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("unread")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                        notifFilter === "unread"
                          ? "bg-rose-600 text-white"
                          : "text-slate-600 hover:text-rose-600"
                      }`}
                    >
                      Unread ({unreadNotifsCount})
                    </button>
                  </div>

                  {unreadNotifsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotifsRead}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span>Mark All Read</span>
                    </button>
                  )}
                </div>
              </div>

              {notifsLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                  <Bell className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    You are all caught up!
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    No notifications recorded at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications
                    .filter((n) => (notifFilter === "unread" ? !n.isRead : true))
                    .map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`rounded-2xl border p-4 transition cursor-pointer flex items-start justify-between gap-4 shadow-2xs ${
                          notif.isRead
                            ? "bg-white border-slate-200 hover:border-slate-300"
                            : "bg-blue-50/40 border-blue-200 hover:bg-blue-50/70"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              notif.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            <Bell className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {notif.title || notif.message}
                            </p>
                            {notif.title && notif.message && (
                              <p className="text-xs text-slate-600 mt-0.5">
                                {notif.message}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(
                                notif.createdAt || Date.now()
                              ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: MY PROFILE (Full-Screen Dedicated View, NO Welcome Banner)     */}
          {/* ===================================================================== */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Selected Advocate / Consultation Context Banner (Non-blocking) */}
              {pendingBooking && (
                <div
                  className={`rounded-2xl border p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    completenessPercentage === 100
                      ? "border-emerald-300 bg-emerald-50/90 text-emerald-950"
                      : "border-blue-200 bg-blue-50/80 text-blue-950"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        completenessPercentage === 100
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {completenessPercentage === 100 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Calendar className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold">
                        {completenessPercentage === 100
                          ? `Profile 100% Complete! You can now proceed to book your consultation with ${
                              pendingBooking.lawyerName || "your selected advocate"
                            }.`
                          : `Selected Consultation with ${
                              pendingBooking.lawyerName || "Advocate"
                            }: Complete your profile details below to continue booking.`}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {completenessPercentage === 100
                          ? "All verification credentials meet statutory compliance standards."
                          : `Current profile completion: ${completenessPercentage}%. You can update the sections below independently.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {completenessPercentage === 100 && (
                      <Link
                        to="/book-appointment"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white transition shrink-0 shadow-2xs"
                      >
                        <span>Continue Booking</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPendingBooking(null);
                        sessionStorage.removeItem("pendingConsultation");
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition cursor-pointer"
                      title="Dismiss notice"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Header & Identity Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Client Profile Photo with Upload Trigger */}
                    <div className="relative shrink-0 flex flex-col items-center gap-2">
                      <div className="relative">
                        {clientImage ? (
                          <img
                            src={clientImage}
                            alt={clientName}
                            className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-md">
                            {initials}
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white ring-2 ring-white shadow-xs"
                          title="Verified Client Account"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                      </div>

                      <label
                        htmlFor="client-profile-photo-change-input"
                        className="cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 transition"
                      >
                        {uploadingImage ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                        <span>
                          {uploadingImage ? "Uploading..." : "Change Photo"}
                        </span>
                        <input
                          id="client-profile-photo-change-input"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {/* Basic Identity Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-black text-2xl text-slate-900">
                          {clientName}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 text-xs font-bold">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                          Registered Client
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-600">
                        Citizen Portal Account • Identity Protected
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {clientEmail}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {clientPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile KYC Completeness Indicator */}
                  <div className="w-full sm:w-52 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>KYC Completeness</span>
                      <span className="text-blue-600">
                        {completenessPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${completenessPercentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {completenessPercentage === 100
                        ? "Profile fully completed & court compliant"
                        : "Complete personal & address details"}
                    </p>
                  </div>
                </div>

                {/* About & Consultation Background Note */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Legal Matter Overview
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditAboutModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit Overview
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-slate-600">
                    {profileData?.about ||
                      "No case introduction or legal overview provided yet. You can add a brief summary of your legal matter to assist consulting advocates."}
                  </p>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 1: PERSONAL INFORMATION                                  */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        1
                      </span>
                      Personal Information
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full name, contact coordinates, demographics, and residential address
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPersonalModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>Edit Personal Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </span>
                    <p className="font-bold text-slate-900">{clientName}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {clientEmail}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Mobile Number
                    </span>
                    <p className="font-bold text-slate-900">{clientPhone}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Gender
                    </span>
                    <p className="font-bold text-slate-900 capitalize">
                      {profileData?.gender || "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Date of Birth
                    </span>
                    <p className="font-bold text-slate-900">
                      {profileData?.dob
                        ? new Date(profileData.dob).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      City / Village
                    </span>
                    <p className="font-bold text-slate-900">
                      {profileData?.cityVillage || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      District
                    </span>
                    <p className="font-bold text-slate-900">
                      {profileData?.district || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      State / UT
                    </span>
                    <p className="font-bold text-slate-900">
                      {profileData?.state || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PIN Code
                    </span>
                    <p className="font-bold text-slate-900">
                      {profileData?.pincode || "Not provided"}
                    </p>
                  </div>
                </div>

                {profileData?.addressLine && (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Street Address
                    </span>
                    <p className="font-medium text-slate-800">
                      {profileData.addressLine}
                    </p>
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* SECTION 2: IDENTITY DOCUMENTS & VERIFICATION                      */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black">
                        2
                      </span>
                      Identity Documents & Verification
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Government identification details securely hashed and protected under AES-256-GCM encryption
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>AES-256-GCM Encrypted</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingIdentity(!isEditingIdentity);
                        setIdentityError("");
                        setIdentitySuccess("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                    >
                      {isEditingIdentity
                        ? "Cancel"
                        : profileData?.aadhaarMasked
                        ? "Update Identity Details"
                        : "Add Identity Details"}
                    </button>
                  </div>
                </div>

                {identitySuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{identitySuccess}</span>
                  </div>
                )}

                {/* Display Masked Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Masked Aadhaar */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Aadhaar Number (UIDAI)
                      </span>
                      {profileData?.aadhaarVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <Check className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Recorded Securely
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-base font-extrabold text-slate-900 tracking-widest">
                      {maskedAadhaar}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Only the last 4 digits are accessible for verification. Full UIDAI number is encrypted at rest.
                    </p>
                  </div>

                  {/* Masked PAN */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Permanent Account Number (PAN)
                      </span>
                      {profileData?.panVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <Check className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Recorded Securely
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-base font-extrabold text-slate-900 tracking-widest">
                      {maskedPan}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Standard masked format compliant with Income Tax Department & DPDP Act guidelines.
                    </p>
                  </div>
                </div>

                {/* Edit / Update Identity Details Form */}
                {isEditingIdentity && (
                  <form
                    onSubmit={handleUpdateIdentity}
                    className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800">
                        Submit or Update Government Identity
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Stored with AES-256-GCM encryption at rest
                      </span>
                    </div>

                    {identityError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{identityError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Aadhaar Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={identityAadhaar}
                          onChange={(e) => setIdentityAadhaar(e.target.value)}
                          placeholder="e.g. 234567890123"
                          maxLength={14}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-[11px] text-slate-500">
                          12-digit Indian Aadhaar number (cannot start with 0 or 1).
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          PAN Card Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={identityPan}
                          onChange={(e) =>
                            setIdentityPan(e.target.value.toUpperCase())
                          }
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono uppercase tracking-wider focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-[11px] text-slate-500">
                          10-character alphanumeric PAN (5 letters, 4 digits, 1 letter).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingIdentity(false);
                          setIdentityError("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={identitySaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-extrabold text-white shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {identitySaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        <span>Update Identity Details</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Privacy Compliance Notice */}
                <div className="rounded-2xl bg-blue-50/60 border border-blue-200/80 p-4 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
                    <span>Bar Council of India & DPDP Act Privacy Standards</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed text-[11px]">
                    Your sensitive government identification documents are encrypted using AES-256-GCM cryptography. In compliance with the Advocates Act and Digital Personal Data Protection guidelines, raw credentials are never transmitted in plaintext and are accessible solely for legitimate legal verification.
                  </p>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 3: ABOUT ME / LEGAL CONSULTATION PROFILE                 */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xs font-black">
                        3
                      </span>
                      About Me & Legal Interests
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Case background, primary areas of legal counsel sought, and language preferences
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditAboutModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>Edit Profile Summary</span>
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Case Summary / Introduction
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {profileData?.about ||
                      "No introduction provided. You can update this section to describe the nature of your legal matters."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Preferred Language for Consultation
                    </span>
                    <p className="font-bold text-slate-800">
                      English, Hindi
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Platform Tier
                    </span>
                    <p className="font-bold text-blue-700">
                      LegalConnect Standard Citizen Access
                    </p>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 4: ACCOUNT SECURITY & PASSWORD                            */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-800 text-xs font-black">
                        4
                      </span>
                      Account Security & Password
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Password updates and active session security (never displaying plaintext passwords)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangePasswordModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Account Protection
                    </span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Password Protected (bcrypt Hash)
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Active Session Status
                    </span>
                    <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Secure Session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS (Summary, Documents, Chat, Receipt, Feedback, Settings)          */}
      {/* ========================================================================= */}

      {/* Appointment Summary Modal */}
      {summaryAppointment && (
        <AppointmentSummaryModal
          appointment={summaryAppointment}
          isOpen={Boolean(summaryAppointment)}
          onClose={() => setSummaryAppointment(null)}
          onOpenDocuments={(appt) => setDocumentAppointment(appt)}
          onOpenChat={(appt) => setChatAppointment(appt)}
        />
      )}

      {/* Document Modal */}
      {documentAppointment && (
        <DocumentModal
          appointment={documentAppointment}
          isOpen={Boolean(documentAppointment)}
          onClose={() => setDocumentAppointment(null)}
        />
      )}

      {/* Chat Modal */}
      {chatAppointment && (
        <ChatModal
          appointment={chatAppointment}
          isOpen={Boolean(chatAppointment)}
          onClose={() => setChatAppointment(null)}
          onOpenDocuments={(appt) => setDocumentAppointment(appt)}
        />
      )}

      {/* Receipt Modal */}
      {receiptAppointment && (
        <ReceiptModal
          appointment={receiptAppointment}
          isOpen={Boolean(receiptAppointment)}
          onClose={() => setReceiptAppointment(null)}
        />
      )}

      {/* Review / Feedback Modal */}
      {reviewAppointment && (
        <ReviewModal
          appointment={reviewAppointment}
          isOpen={Boolean(reviewAppointment)}
          onClose={() => setReviewAppointment(null)}
          onReviewSubmitted={() => {
            setSuccessMessage("Review submitted successfully! Thank you for your feedback.");
            loadDashboardData();
            setTimeout(() => setSuccessMessage(""), 4000);
          }}
        />
      )}

      {/* Cancel Appointment Modal */}
      {cancelModalAppointment && (
        <CancelAppointmentModal
          isOpen={Boolean(cancelModalAppointment)}
          onClose={() => setCancelModalAppointment(null)}
          appointment={cancelModalAppointment}
          onConfirm={handleConfirmCancel}
          loading={cancellingId === cancelModalAppointment._id}
        />
      )}

      {/* Edit Personal Information Modal */}
      {editPersonalModalOpen && (
        <EditClientPersonalModal
          isOpen={editPersonalModalOpen}
          onClose={() => setEditPersonalModalOpen(false)}
          userData={profileData}
          onSuccess={(updatedUser, msg) => {
            setProfileData((prev) => ({ ...prev, ...updatedUser }));
            if (updateUser) updateUser(updatedUser);
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(""), 4000);
          }}
        />
      )}

      {/* Edit About Modal */}
      {editAboutModalOpen && (
        <EditClientAboutModal
          isOpen={editAboutModalOpen}
          onClose={() => setEditAboutModalOpen(false)}
          initialAbout={profileData?.about || ""}
          onSuccess={(updatedUser, msg) => {
            setProfileData((prev) => ({ ...prev, ...updatedUser }));
            if (updateUser) updateUser(updatedUser);
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(""), 4000);
          }}
        />
      )}

      {/* Change Password Modal */}
      {changePasswordModalOpen && (
        <ChangePasswordModal
          isOpen={changePasswordModalOpen}
          onClose={() => setChangePasswordModalOpen(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(""), 4000);
          }}
        />
      )}

      {/* Profile Photo Upload & Preview Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Edit Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setPreviewImage(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-36 w-36 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
                    title="Choose different photo"
                  >
                    <UploadCloud className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setPreviewImage(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfileImage}
                disabled={uploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile Photo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <LogoutModal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
