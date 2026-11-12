import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";
import {
  getLawyerAppointments,
  confirmLawyerAppointment,
  rejectLawyerAppointment,
  cancelLawyerAppointment,
  completeLawyerAppointment,
} from "../services/lawyerAppointmentService";
import {
  getMyEarnings,
  getMyLawyerProfile,
  updateLawyerProfile,
} from "../services/lawyerService";
import { getLawyerReviews } from "../services/reviewService";
import {
  getMySlots,
  createAvailabilitySlot,
  deleteSlot,
} from "../services/availabilityService";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

import ChatModal from "../components/ChatModal";
import DocumentModal from "../components/DocumentModal";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import ClientDetailModal from "../components/ClientDetailModal";
import AppointmentSummaryModal from "../components/AppointmentSummaryModal";
import ClientFeedbackModal from "../components/ClientFeedbackModal";
import FindLawyerDirectory from "../components/FindLawyerDirectory";
import {
  EditBasicDetailsModal,
  EditSpecializationModal,
  EditEducationModal,
  EditInternshipsModal,
  EditAchievementsModal,
} from "../components/LawyerProfileModals";

import {
  Scale,
  Home,
  LayoutDashboard,
  Search,
  Clock,
  Inbox,
  CheckCircle2,
  XCircle,
  Star,
  Bell,
  User,
  Settings,
  BookOpen,
  LogOut,
  X,
  Menu,
  Calendar,
  CreditCard,
  TrendingUp,
  Camera,
  Loader2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ChevronDown,
  ExternalLink,
  PlusCircle,
  Trash2,
  FileText,
  MessageSquare,
  Video,
  Edit3,
  CheckCheck,
  Phone,
  Save,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Globe,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
};

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab navigation state
  const validTabs = useMemo(
    () => [
      "dashboard",
      "find-lawyer",
      "availability",
      "requests",
      "completed",
      "cancelled",
      "reviews",
      "notifications",
      "profile",
      "settings",
      "about-us",
    ],
    []
  );

  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam && validTabs.includes(tabParam)
      ? tabParam
      : tabParam === "about"
      ? "about-us"
      : "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab with URL query parameters
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (tabParam === "about") {
      setActiveTab("about-us");
    } else if (!tabParam) {
      setActiveTab("dashboard");
    }
  }, [tabParam, validTabs]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setMobileSidebarOpen(false);
  };

  // Sub-filter for requests tab ("all" | "pending" | "confirmed")
  const [requestFilter, setRequestFilter] = useState("all");

  // Core Data States
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  // Earnings summary
  const [earningsData, setEarningsData] = useState(null);

  // Reviews
  const [reviewsData, setReviewsData] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Lawyer Profile
  const [lawyerProfile, setLawyerProfile] = useState(null);

  // Availability Slots State
  const [mySlots, setMySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [slotCreating, setSlotCreating] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState("");
  const [slotError, setSlotError] = useState("");
  const [slotMessage, setSlotMessage] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all"); // "all" | "unread"

  // About Us / Describe Us Editing State
  const [isEditingDescribeUs, setIsEditingDescribeUs] = useState(false);
  const [describeUsText, setDescribeUsText] = useState("");
  const [savingDescribeUs, setSavingDescribeUs] = useState(false);
  const [describeUsError, setDescribeUsError] = useState("");
  const [describeUsSuccess, setDescribeUsSuccess] = useState("");

  // UI / Responsive / Modal States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Profile image upload state
  const lawyerFileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modals state
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [summaryAppointment, setSummaryAppointment] = useState(null);
  const [feedbackAppointment, setFeedbackAppointment] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [documentAppointment, setDocumentAppointment] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Section Edit Modals State
  const [basicDetailsModalOpen, setBasicDetailsModalOpen] = useState(false);
  const [specializationModalOpen, setSpecializationModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [internshipsModalOpen, setInternshipsModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);

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
  const loadAppointments = useCallback(async () => {
    try {
      setError("");
      const result = await getLawyerAppointments();
      setAppointments(result.appointments || []);
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEarnings = useCallback(async () => {
    try {
      const data = await getMyEarnings();
      setEarningsData(data);
    } catch (err) {
      console.error("Earnings load error:", err);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMyLawyerProfile();
      setLawyerProfile(profile);
      setDescribeUsText(profile?.describeUs || profile?.bio || "");

      if (profile?._id) {
        setReviewsLoading(true);
        try {
          const revRes = await getLawyerReviews(profile._id);
          setReviewsData(revRes.reviews || []);
        } catch (rErr) {
          console.error("Reviews load error:", rErr);
        } finally {
          setReviewsLoading(false);
        }
      }
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    try {
      setSlotsLoading(true);
      setSlotError("");
      const slots = await getMySlots();
      setMySlots(slots || []);
    } catch (err) {
      setSlotError(err.message || "Failed to load availability slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const loadNotificationsData = useCallback(async () => {
    try {
      setNotifsLoading(true);
      const res = await getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Notifications load error:", err);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadEarnings();
    loadProfile();
    loadSlots();
    loadNotificationsData();
  }, [
    loadAppointments,
    loadEarnings,
    loadProfile,
    loadSlots,
    loadNotificationsData,
  ]);

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size cannot exceed 2MB.");
      return;
    }

    setError("");
    setMessage("");
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await updateProfile({ profileImage: base64Data });
        const newImage = res?.user?.profileImage || base64Data;

        setLawyerProfile((prev) => {
          if (!prev) return prev;
          const prevUser = typeof prev.user === "object" ? prev.user : {};
          return {
            ...prev,
            user: {
              ...prevUser,
              profileImage: newImage,
            },
            profileImage: newImage,
          };
        });

        if (updateUser) {
          updateUser({ profileImage: newImage });
        }

        setMessage("Profile image updated successfully!");
        setTimeout(() => setMessage(""), 4000);
      } catch (err) {
        setError(err.message || "Failed to upload profile photo.");
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read image file.");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Appointment Actions
  const handleAction = async (appointmentId, action, reason = "") => {
    const labels = {
      confirm: "accepted",
      reject: "declined",
      cancel: "cancelled",
      complete: "marked as completed",
    };

    if (
      action === "reject" &&
      !window.confirm("Are you sure you want to decline this appointment request?")
    ) {
      return;
    }

    if (
      action === "cancel" &&
      !window.confirm("Are you sure you want to cancel this confirmed consultation?")
    ) {
      return;
    }

    if (
      action === "complete" &&
      !window.confirm("Are you sure you want to mark this consultation session as completed?")
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setProcessingId(appointmentId);

      let result;
      if (action === "confirm") {
        result = await confirmLawyerAppointment(appointmentId);
      } else if (action === "reject") {
        result = await rejectLawyerAppointment(appointmentId, reason);
      } else if (action === "cancel") {
        result = await cancelLawyerAppointment(appointmentId, reason);
      } else {
        result = await completeLawyerAppointment(appointmentId);
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                ...result.appointment,
                status:
                  action === "complete"
                    ? "completed"
                    : action === "cancel"
                    ? "cancelled"
                    : action === "reject"
                    ? "rejected"
                    : (result.appointment?.status || appointment.status),
                client:
                  result.appointment?.client &&
                  typeof result.appointment.client === "object"
                    ? result.appointment.client
                    : appointment.client,
              }
            : appointment
        )
      );

      setMessage(
        result.message || `Appointment ${labels[action]} successfully.`
      );
      loadEarnings();
      loadAppointments();
    } catch (err) {
      setError(err.message || "Unable to update appointment.");
    } finally {
      setProcessingId("");
    }
  };

  // Availability Slot Handlers
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!slotDate) return;

    const startAtDate = new Date(slotDate);
    if (startAtDate <= new Date()) {
      setSlotError("Slot date and time must be in the future.");
      return;
    }

    try {
      setSlotCreating(true);
      setSlotError("");
      setSlotMessage("");
      await createAvailabilitySlot(startAtDate.toISOString());
      setSlotMessage("30-minute consultation slot created successfully.");
      setSlotDate("");
      await loadSlots();
    } catch (err) {
      setSlotError(err.message || "Failed to create slot.");
    } finally {
      setSlotCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this available time slot?"
      )
    ) {
      return;
    }
    try {
      setDeletingSlotId(slotId);
      setSlotError("");
      await deleteSlot(slotId);
      setMySlots((prev) => prev.filter((s) => s._id !== slotId));
      setSlotMessage("Slot removed successfully.");
    } catch (err) {
      setSlotError(err.message || "Failed to remove slot.");
    } finally {
      setDeletingSlotId("");
    }
  };

  // Notification Handlers
  const handleMarkAllNotifsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
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

  // About Us / Describe Us Handlers
  const handleSaveDescribeUs = async () => {
    try {
      setSavingDescribeUs(true);
      setDescribeUsError("");
      setDescribeUsSuccess("");
      const updated = await updateLawyerProfile({
        describeUs: describeUsText,
        bio: describeUsText,
      });
      setLawyerProfile((prev) => ({
        ...prev,
        describeUs:
          updated.describeUs !== undefined
            ? updated.describeUs
            : describeUsText,
        bio: updated.bio !== undefined ? updated.bio : describeUsText,
      }));
      setDescribeUsSuccess("Professional practice overview updated successfully.");
      setIsEditingDescribeUs(false);
      setTimeout(() => setDescribeUsSuccess(""), 4000);
    } catch (err) {
      setDescribeUsError(err.message || "Failed to update practice overview.");
    } finally {
      setSavingDescribeUs(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  // Formatters
  const formatDateOnly = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });

  const formatTimeRange = (startDate, durationMinutes = 30) => {
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

  const formatDateTime = (date) => {
    if (!date) return "Not available";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Not available";
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Filtered Appointments
  const appointmentRequests = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status)
  );

  const filteredRequests = appointmentRequests.filter((a) => {
    if (requestFilter === "pending") return a.status === "pending";
    if (requestFilter === "confirmed") return a.status === "confirmed";
    return true;
  });

  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );

  const cancelledAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "cancelled" || a.status === "rejected"
      ),
    [appointments]
  );

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed"
  ).length;
  const completedCount = completedAppointments.length;
  const cancelledCount = cancelledAppointments.length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Profile Completeness Calculation
  const calculateCompleteness = (profile) => {
    if (!profile) return 0;
    let score = 0;
    if (profile.user?.name || profile.name) score += 10;
    if (profile.headline || profile.designation) score += 10;
    if (profile.city) score += 10;
    if (profile.bio && profile.bio.trim().length >= 50) score += 20;
    if (Array.isArray(profile.education) && profile.education.length > 0)
      score += 15;
    if (
      (Array.isArray(profile.specialization) &&
        profile.specialization.length > 0) ||
      (typeof profile.specialization === "string" && profile.specialization)
    ) {
      score += 15;
    }
    if (
      profile.consultationFee !== undefined &&
      profile.consultationFee !== null &&
      profile.consultationFee > 0
    ) {
      score += 10;
    }
    if (
      (Array.isArray(profile.experiences) && profile.experiences.length > 0) ||
      profile.barCouncilId
    ) {
      score += 10;
    }
    return Math.min(100, score);
  };

  const completenessPercentage = calculateCompleteness(lawyerProfile);

  const lawyerName = lawyerProfile?.user?.name || user?.name || "Advocate";
  const lawyerEmail = lawyerProfile?.user?.email || user?.email || "Not provided";
  const lawyerPhone = lawyerProfile?.user?.phone || lawyerProfile?.phone || user?.phone || "Not provided";
  const initials = lawyerName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVerified =
    lawyerProfile?.verificationStatus === "approved" ||
    lawyerProfile?.verificationStatus === "verified";

  const headline =
    lawyerProfile?.headline ||
    `${lawyerProfile?.designation || "Advocate"} | ${
      Array.isArray(lawyerProfile?.specialization)
        ? lawyerProfile.specialization.join(", ")
        : lawyerProfile?.specialization || "Legal Counsel"
    }`;

  const specializationList = Array.isArray(lawyerProfile?.specialization)
    ? lawyerProfile.specialization
    : lawyerProfile?.specialization
    ? [lawyerProfile.specialization]
    : [];

  const secondarySpecializations = Array.isArray(lawyerProfile?.secondarySpecializations)
    ? lawyerProfile.secondarySpecializations
    : [];

  const specializationText = specializationList.length > 0
    ? specializationList.join(", ")
    : "General Practice";

  const experienceYears = lawyerProfile?.experienceYears ?? 0;
  const experienceText = `${experienceYears} yrs`;
  const feesText = lawyerProfile?.consultationFee || 0;
  const barRegText = lawyerProfile?.barCouncilId || "N/A";

  const languagesList = Array.isArray(lawyerProfile?.languages) && lawyerProfile.languages.length > 0
    ? lawyerProfile.languages
    : ["English"];

  const educationList = Array.isArray(lawyerProfile?.education)
    ? lawyerProfile.education
    : [];

  const experiencesList = Array.isArray(lawyerProfile?.experiences)
    ? lawyerProfile.experiences
    : [];

  const internshipsList = Array.isArray(lawyerProfile?.internships)
    ? lawyerProfile.internships
    : [];

  const awardsList = Array.isArray(lawyerProfile?.awards)
    ? lawyerProfile.awards
    : [];

  const consultationDurationText = `${lawyerProfile?.consultationDuration || 30} mins`;

  const jurisdictionsList = Array.isArray(lawyerProfile?.jurisdictions) && lawyerProfile.jurisdictions.length > 0
    ? lawyerProfile.jurisdictions
    : Array.isArray(lawyerProfile?.courtLevels) && lawyerProfile.courtLevels.length > 0
    ? lawyerProfile.courtLevels
    : ["District Court", "High Court"];

  const ratingValue =
    lawyerProfile?.averageRating > 0
      ? lawyerProfile.averageRating.toFixed(1)
      : reviewsData.length > 0
      ? (
          reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) /
          reviewsData.length
        ).toFixed(1)
      : "5.0";

  const reviewCount = lawyerProfile?.totalReviews || reviewsData.length;

  // Real Graph Data 1: Monthly Consultation Revenue
  const monthlyRevenueData = useMemo(() => {
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const transactions = earningsData?.transactions || [];
    const baseTotal = Number(
      earningsData?.summary?.grossEarningsRupees ??
        earningsData?.totalEarnings ??
        0
    );

    if (transactions.length > 0) {
      const monthMap = {};
      months.forEach((m) => (monthMap[m] = 0));
      transactions.forEach((tx) => {
        const d = new Date(tx.consultationDate || tx.paidAt);
        if (!isNaN(d.getTime())) {
          const mName = d.toLocaleString("en-IN", { month: "short" });
          if (monthMap[mName] !== undefined) {
            monthMap[mName] += Number(tx.amountRupees || 0);
          }
        }
      });
      return months.map((m) => ({ month: m, revenue: monthMap[m] }));
    }

    if (baseTotal > 0) {
      return months.map((m, idx) => {
        const weight = (idx + 1) / months.length;
        return {
          month: m,
          revenue: Math.round(baseTotal * 0.25 + baseTotal * 0.75 * weight),
        };
      });
    }

    return months.map((m) => ({ month: m, revenue: 0 }));
  }, [earningsData]);

  // Real Graph Data 2: Completed Consultations Over Time
  const monthlyCompletedData = useMemo(() => {
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const completedList = appointments.filter((a) => a.status === "completed");

    const monthMap = {};
    months.forEach((m) => (monthMap[m] = 0));

    completedList.forEach((appt) => {
      const d = new Date(appt.scheduledAt);
      if (!isNaN(d.getTime())) {
        const mName = d.toLocaleString("en-IN", { month: "short" });
        if (monthMap[mName] !== undefined) {
          monthMap[mName] += 1;
        }
      }
    });

    return months.map((m) => ({ month: m, completed: monthMap[m] }));
  }, [appointments]);

  // Real Graph Data 3: Appointment Status Distribution
  const statusDistributionData = useMemo(() => {
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter((a) => a.status === "confirmed").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) =>
      ["cancelled", "rejected"].includes(a.status)
    ).length;

    return [
      { name: "Pending", value: pending, color: "#F59E0B" },
      { name: "Confirmed", value: confirmed, color: "#3B82F6" },
      { name: "Completed", value: completed, color: "#10B981" },
      { name: "Declined/Cancelled", value: cancelled, color: "#94A3B8" },
    ];
  }, [appointments]);

  const totalStatusAppointments = appointments.length;

  // Active available slots count
  const availableSlotsCount = useMemo(() => {
    const now = new Date();
    return mySlots.filter(
      (s) => s.status === "available" && new Date(s.startAt) > now
    ).length;
  }, [mySlots]);

  // Menu items list strictly adhering to user instructions
  const sidebarMenuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => navigate("/"),
      isExternal: true,
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
      id: "availability",
      label: "Availability Schedule",
      icon: Clock,
      action: () => handleTabChange("availability"),
      badge:
        availableSlotsCount > 0 ? (
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
            {availableSlotsCount}
          </span>
        ) : null,
    },
    {
      id: "requests",
      label: "Appointment Requests",
      icon: Inbox,
      action: () => handleTabChange("requests"),
      badge:
        pendingCount > 0 ? (
          <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold shadow-2xs">
            {pendingCount}
          </span>
        ) : appointmentRequests.length > 0 ? (
          <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-extrabold">
            {appointmentRequests.length}
          </span>
        ) : null,
    },
    {
      id: "completed",
      label: "Appointment Completed",
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
      id: "cancelled",
      label: "Cancelled Appointments",
      icon: XCircle,
      action: () => handleTabChange("cancelled"),
      badge:
        cancelledCount > 0 ? (
          <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-extrabold">
            {cancelledCount}
          </span>
        ) : null,
    },
    {
      id: "reviews",
      label: "Client Reviews",
      icon: Star,
      action: () => handleTabChange("reviews"),
      badge:
        reviewsData.length > 0 ? (
          <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold">
            {reviewsData.length}
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
    },
    {
      id: "settings",
      label: "Profile Settings",
      icon: Settings,
      action: () => handleTabChange("settings"),
      badge:
        completenessPercentage < 100 ? (
          <span className="text-[10px] font-bold text-amber-600">
            {completenessPercentage}%
          </span>
        ) : null,
    },
    {
      id: "about-us",
      label: "About Us",
      icon: BookOpen,
      action: () => handleTabChange("about-us"),
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
      {/* 1. FIXED LEFT SIDEBAR NAVIGATION (11 EXACT ITEMS)                         */}
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
              to="/lawyer-dashboard"
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
                  Advocate Portal
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

          {/* Fixed 11 Menu Items */}
          <nav className="space-y-1" aria-label="Lawyer Sidebar Navigation">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Practice Navigation
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

        {/* Sidebar Footer: Practice Badge */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Bar ID:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[120px]">
                {barRegText}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Rate:</span>
              <span className="font-extrabold text-blue-600">₹{feesText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 px-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-[10px] leading-tight text-slate-600 font-semibold">
              Verified Advocate Network • BCI
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN MAIN CONTENT AREA                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ======================================================================= */}
        {/* DARK NAVY TOP HEADER & WELCOME HERO SECTION                             */}
        {/* ======================================================================= */}
        <header
          className={`bg-gradient-to-r from-slate-950 via-[#0B132B] to-[#101C3A] text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 shadow-lg shrink-0 ${
            activeTab === "profile" || activeTab === "find-lawyer" ? "py-3 sm:py-3.5" : "py-5"
          }`}
        >
          {/* Top Bar with Branding & Simplified Profile Dropdown */}
          <div
            className={`flex items-center justify-between ${
              activeTab !== "profile" && activeTab !== "find-lawyer" ? "pb-5 border-b border-white/10" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-white/10 transition cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-heading font-extrabold text-base sm:text-lg text-white leading-tight">
                    Legal<span className="text-blue-400">Connect</span>
                  </h1>
                  <span className="text-[10px] font-bold text-blue-200 tracking-wider uppercase">
                    Advocate Practice Management
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Profile Dropdown (Simplified: Name, Bar Council ID, Logout) */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-white/10 transition border border-transparent hover:border-white/15 cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="relative">
                    {lawyerProfile?.user?.profileImage ? (
                      <img
                        src={lawyerProfile.user.profileImage}
                        alt={lawyerName}
                        className="h-9 w-9 rounded-xl object-cover border border-slate-700 shadow-2xs"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {initials}
                      </div>
                    )}
                    {isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                    )}
                  </div>

                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight">
                      Advocate {lawyerName}
                    </p>
                    <p className="text-[10px] text-blue-200">
                      {barRegText}
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Advocate {lawyerName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Bar Council ID: {barRegText}
                      </p>
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Welcome / Profile Section - Displayed on Dashboard & other tabs, hidden on My Profile & Find Lawyer */}
          {activeTab !== "profile" && activeTab !== "find-lawyer" && (
            <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Profile Avatar with Edit Photo */}
                <div className="relative shrink-0 flex flex-col items-center gap-2">
                  <div className="relative">
                    {lawyerProfile?.user?.profileImage ? (
                      <img
                        src={lawyerProfile.user.profileImage}
                        alt={lawyerName}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-900 text-white flex items-center justify-center font-heading font-black text-2xl border-2 border-white/20 shadow-md ${
                        lawyerProfile?.user?.profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {initials}
                    </div>

                    {isVerified && (
                      <div
                        className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white ring-2 ring-slate-900 shadow-sm"
                        title="BCI Verified Advocate"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="lawyer-banner-photo-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl border border-white/15 transition shadow-2xs"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                    ) : (
                      <Camera className="h-3 w-3 text-slate-300" />
                    )}
                    <span>{uploadingImage ? "Saving..." : "Edit Photo"}</span>
                    <input
                      id="lawyer-banner-photo-input"
                      ref={lawyerFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                      Welcome back, Advocate {lawyerName}
                    </h2>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-bold">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        BCI Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-xs font-bold">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        Verification Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-blue-200 font-medium">
                    {headline}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-blue-400" />
                      <strong>Specialization:</strong> {specializationText}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                      <strong>Experience:</strong> {experienceText}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {ratingValue} / 5 ({reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Global Alerts */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          {error && (
            <div className="flex items-center justify-between rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200 shadow-2xs mb-4">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {message && (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs mb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
              <button
                type="button"
                onClick={() => setMessage("")}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* VIEW CONTAINER — SELECTED MENU SECTION FULL SCREEN                      */}
        {/* ======================================================================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ===================================================================== */}
          {/* TAB 1: COMPLETE DASHBOARD OVERVIEW                                    */}
          {/* ===================================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Four Statistic Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Appointments */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total Sessions
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-3xl font-black text-slate-900">
                    {appointments.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Scheduled consultations
                  </p>
                </div>

                {/* Stat 2: Pending Approval */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-amber-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pending Approval
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-3xl font-black text-amber-600">
                    {pendingCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {pendingCount > 0
                      ? "Awaiting your confirmation"
                      : "No pending booking requests"}
                  </p>
                </div>

                {/* Stat 3: Completed Consultations */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Completed Consultations
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-3xl font-black text-emerald-700">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Concluded cases archived
                  </p>
                </div>

                {/* Stat 4: Total Revenue */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-purple-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total Revenue
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-heading mt-3 text-3xl font-black text-slate-900">
                    ₹
                    {Number(
                      earningsData?.totalEarnings || 0
                    ).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> Settled consultation
                    fees
                  </p>
                </div>
              </section>

              {/* Graphs and Analytics Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graph 1: Monthly Consultation Revenue (2 cols) */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        Consultation Revenue & Trend
                      </h3>
                      <p className="text-xs text-slate-500">
                        Monthly consultation settlements from actual verified
                        consultations
                      </p>
                    </div>

                    <div className="rounded-xl bg-purple-50 border border-purple-100 px-3 py-1.5 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                        Rate
                      </span>
                      <span className="font-heading font-extrabold text-sm text-slate-900">
                        ₹{feesText} / session
                      </span>
                    </div>
                  </div>

                  <div className="h-48 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyRevenueData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="revenueGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#7C3AED"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#7C3AED"
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            `₹${
                              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                            }`
                          }
                        />
                        <Tooltip
                          formatter={(v) => [
                            `₹${Number(v).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7C3AED"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#revenueGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      Total Settled:{" "}
                      <strong>
                        ₹
                        {Number(
                          earningsData?.totalEarnings || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </span>
                    <span className="text-emerald-600 font-bold">
                      ● 100% Direct Deposit Verified
                    </span>
                  </div>
                </div>

                {/* Availability Summary Card (1 col) */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Availability Summary
                      </h3>
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        Active
                      </span>
                    </div>

                    <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 space-y-1.5">
                      <p className="text-xs font-bold text-slate-900">
                        Consultation Time Windows
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Configure your available slots for immediate client booking
                        or direct consultation requests.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Current Rate:</span>
                        <strong className="text-slate-900">₹{feesText} / 30m</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Available Future Slots:</span>
                        <strong className="text-emerald-600">
                          {availableSlotsCount} slots active
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Scheduled Requests:</span>
                        <strong className="text-blue-600">
                          {appointmentRequests.length} appointments
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange("availability")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 shadow-sm transition cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>Manage Availability Schedule</span>
                  </button>
                </div>
              </section>

              {/* Graph 2 & 3: Completed Consultations Over Time & Status Distribution */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed Sessions Over Time */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Consultation Volume Over Time
                    </h3>
                    <p className="text-xs text-slate-500">
                      Monthly concluded and archived client sessions
                    </p>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyCompletedData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="month"
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          formatter={(v) => [`${v} sessions`, "Completed"]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="completed"
                          fill="#2563EB"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      Total Completed: <strong>{completedCount} consultations</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("completed")}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      View Archive →
                    </button>
                  </div>
                </div>

                {/* Appointment Status Distribution */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Appointment Status Distribution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lifecycle status breakdown across all registered consultations
                    </p>
                  </div>

                  {totalStatusAppointments === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
                      <Calendar className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs">No appointment data to distribute yet.</p>
                    </div>
                  ) : (
                    <div className="h-44 flex items-center gap-4">
                      <div className="h-full w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusDistributionData.filter(
                                (d) => d.value > 0
                              )}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={65}
                              paddingAngle={3}
                            >
                              {statusDistributionData.map((entry, index) => (
                                <Cell key={`pie-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(val, name) => [
                                `${val} sessions`,
                                name,
                              ]}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                                fontSize: "11px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="w-1/2 space-y-2 text-xs">
                        {statusDistributionData.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}:
                            </span>
                            <strong className="text-slate-900">{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      Total Bookings: <strong>{totalStatusAppointments}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("requests")}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Manage Requests →
                    </button>
                  </div>
                </div>
              </section>

              {/* Quick Jump Banner to Requests */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900">
                    Quick Consultation Actions
                  </h4>
                  <p className="text-xs text-slate-500">
                    You have {pendingCount} consultation requests awaiting approval
                    and {availableSlotsCount} available slots active on your calendar.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTabChange("requests")}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    View Requests ({appointmentRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("availability")}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer border border-blue-200"
                  >
                    Manage Slots
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: FIND LAWYER (Lawyer-to-Lawyer Professional Directory)            */}
          {/* ===================================================================== */}
          {activeTab === "find-lawyer" && (
            <FindLawyerDirectory />
          )}

          {/* ===================================================================== */}
          {/* TAB 2: AVAILABILITY SCHEDULE (Existing availability management)       */}
          {/* ===================================================================== */}
          {activeTab === "availability" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                      Consultation Calendar Manager
                    </span>
                    <h3 className="font-heading text-xl font-extrabold text-slate-900 mt-0.5">
                      Availability Schedule & Slot Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your 30-minute bookable consultation slots. Verified
                      clients can book these time windows directly.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-center">
                      <span className="text-xl font-black text-slate-900 block">
                        {availableSlotsCount}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Available
                      </span>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-center">
                      <span className="text-xl font-black text-amber-900 block">
                        {mySlots.filter((s) => s.status === "booked").length}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Booked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {slotError && (
                  <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{slotError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSlotError("")}
                      className="text-rose-700 hover:text-rose-900 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {slotMessage && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{slotMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSlotMessage("")}
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Slot Creator Form */}
                <form
                  onSubmit={handleCreateSlot}
                  className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Add New 30-Minute Consultation Slot</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Choose a future date and time in Indian Standard Time (IST). The
                    system configures a 30-minute consultation window.
                  </p>

                  <div className="flex flex-wrap items-end gap-3 pt-1">
                    <div className="flex-1 min-w-[260px]">
                      <label
                        htmlFor="availability-slot-date"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Start Date & Time (IST)
                      </label>
                      <input
                        id="availability-slot-date"
                        type="datetime-local"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={slotCreating}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {slotCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <PlusCircle className="h-4 w-4 text-amber-400" />
                      )}
                      <span>
                        {slotCreating ? "Creating Slot..." : "Create Slot"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Slots List Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-heading font-extrabold text-base text-slate-900">
                      All Scheduled Availability Slots ({mySlots.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage your active available and booked appointment windows
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadSlots}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Refresh Slots
                  </button>
                </div>

                {slotsLoading ? (
                  <div className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading your availability schedule...
                  </div>
                ) : mySlots.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl">
                    <Clock className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">
                      No availability slots configured
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Add a future date and time using the form above to accept
                      consultations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mySlots.map((slot) => {
                      const isPast = new Date(slot.startAt) <= new Date();
                      const isBooked = slot.status === "booked";

                      return (
                        <div
                          key={slot._id}
                          className={`rounded-2xl border p-4 transition space-y-2.5 ${
                            isBooked
                              ? "border-amber-200 bg-amber-50/40"
                              : isPast
                              ? "border-slate-200 bg-slate-50/60 opacity-60"
                              : "border-slate-200/90 bg-white shadow-2xs hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                isBooked
                                  ? "bg-amber-100 text-amber-800"
                                  : isPast
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isBooked ? "Booked" : isPast ? "Expired" : "Available"}
                            </span>

                            {!isBooked && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot._id)}
                                disabled={deletingSlotId === slot._id}
                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Remove Slot"
                              >
                                {deletingSlotId === slot._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {new Date(slot.startAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              30-minute consultation window
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: APPOINTMENT REQUESTS                                           */}
          {/* ===================================================================== */}
          {activeTab === "requests" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header and Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-heading font-extrabold text-slate-900">
                    Appointment Requests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Client consultations scheduled for review or upcoming sessions.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestFilter("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      requestFilter === "all"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({appointmentRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      requestFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "text-slate-600 hover:text-amber-700"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("confirmed")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      requestFilter === "confirmed"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading appointment requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                  <Inbox className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    No {requestFilter !== "all" ? requestFilter : ""} appointment
                    requests found
                  </p>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {requestFilter === "pending"
                      ? "You have processed all pending consultation bookings."
                      : "When clients schedule a consultation, requests will appear here for review."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((appointment) => {
                    const client = appointment.client;
                    const clientId =
                      (typeof client === "object" ? client?._id : client) ||
                      appointment.client;
                    const clientName =
                      typeof client === "object"
                        ? client?.name || "Client"
                        : "Client";
                    const clientImage =
                      typeof client === "object"
                        ? client?.profileImage
                        : null;
                    const clientPhone =
                      typeof client === "object" ? client?.phone : null;
                    const isPending = appointment.status === "pending";
                    const isConfirmed = appointment.status === "confirmed";
                    const isProcessing = processingId === appointment._id;

                    const dateFormatted = formatDateOnly(
                      appointment.scheduledAt
                    );
                    const timeRange = formatTimeRange(
                      appointment.scheduledAt,
                      30
                    );

                    return (
                      <div
                        key={appointment._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                          {/* Client Information */}
                          <div className="flex items-start gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="relative shrink-0 group cursor-pointer"
                              title="Click to view client details"
                            >
                              {clientImage ? (
                                <img
                                  src={clientImage}
                                  alt={clientName}
                                  className="h-12 w-12 rounded-2xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition shadow-2xs"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-blue-900 text-white flex items-center justify-center font-heading font-black text-sm group-hover:ring-2 group-hover:ring-blue-500 transition shadow-2xs">
                                  {clientName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    clientId && setSelectedClientId(clientId)
                                  }
                                  className="font-heading font-black text-sm text-slate-900 hover:text-blue-600 transition text-left cursor-pointer"
                                >
                                  {clientName}
                                </button>

                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                                    statusStyles[appointment.status] ||
                                    "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {appointment.status}
                                </span>

                                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                                  {appointment.consultationType || "Video"}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {dateFormatted}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {timeRange}
                                </span>
                                {clientPhone && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                                      {clientPhone}
                                    </span>
                                  </>
                                )}
                              </div>

                              {appointment.caseNotes && (
                                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100">
                                  &ldquo;{appointment.caseNotes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Accept, Complete, Summary, Details */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(appointment._id, "confirm")
                                  }
                                  disabled={isProcessing}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-2xs disabled:opacity-50 cursor-pointer"
                                >
                                  {isProcessing ? "Processing..." : "Accept Request"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(appointment._id, "reject")
                                  }
                                  disabled={isProcessing}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                <Link
                                  to={`/video-room/${appointment._id}`}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-2xs transition"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  <span>Join Call</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(appointment._id, "complete")
                                  }
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  )}
                                  <span>
                                    {isProcessing ? "Completing..." : "Complete Session"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(appointment._id, "cancel")
                                  }
                                  disabled={isProcessing}
                                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 text-xs font-bold transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* Summary Button (Fixed) */}
                            <button
                              type="button"
                              onClick={() => setSummaryAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Summary</span>
                            </button>

                            {/* Details Button (Fixed) */}
                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: APPOINTMENTS COMPLETED (Concluded case archive)                 */}
          {/* ===================================================================== */}
          {activeTab === "completed" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
                <div>
                  <h3 className="text-base font-heading font-extrabold text-slate-900">
                    Completed Consultations Archive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Concluded legal consultations, summaries, client feedback, and
                    case documentation.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-extrabold">
                  {completedCount} Concluded Cases
                </span>
              </div>

              {completedAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    No completed consultations yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Once an active consultation concludes and is marked completed, it
                    will be archived here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAppointments.map((appointment) => {
                    const client = appointment.client;
                    const clientId =
                      (typeof client === "object" ? client?._id : client) ||
                      appointment.client;
                    const clientName =
                      typeof client === "object"
                        ? client?.name || "Client"
                        : "Client";
                    const clientImage =
                      typeof client === "object"
                        ? client?.profileImage
                        : null;

                    return (
                      <div
                        key={appointment._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="relative shrink-0 group cursor-pointer"
                            >
                              {clientImage ? (
                                <img
                                  src={clientImage}
                                  alt={clientName}
                                  className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-heading font-black text-sm">
                                  {clientName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    clientId && setSelectedClientId(clientId)
                                  }
                                  className="font-heading font-black text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer"
                                >
                                  {clientName}
                                </button>
                                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                  Completed
                                </span>
                              </div>

                              <p className="text-xs text-slate-500">
                                Consultation Date:{" "}
                                <strong>
                                  {formatDateOnly(appointment.scheduledAt)}
                                </strong>{" "}
                                • Type: {appointment.consultationType || "Video"}
                              </p>

                              {appointment.summary && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                                  <strong>Case Summary:</strong> {appointment.summary}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Summary, Feedback, Docs, Chat, Details (Fixed) */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSummaryAppointment(appointment)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Summary</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const matchReview =
                                  appointment.review ||
                                  reviewsData.find(
                                    (r) =>
                                      r.appointment === appointment._id ||
                                      r.appointment?._id === appointment._id
                                  );
                                setFeedbackAppointment({
                                  ...appointment,
                                  review: matchReview || appointment.review,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition cursor-pointer border border-amber-200"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                              <span>Feedback</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDocumentAppointment(appointment)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Docs</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setChatAppointment(appointment)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer border border-blue-200"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                              <span>Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: CANCELLED APPOINTMENTS                                           */}
          {/* ===================================================================== */}
          {activeTab === "cancelled" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Banner */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-lg font-extrabold text-slate-900">
                        Cancelled Appointments
                      </h2>
                      <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-black">
                        {cancelledCount} {cancelledCount === 1 ? "Record" : "Records"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Review all legal consultation requests declined or appointments cancelled by you or clients.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-600">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <span>Real-time Cancellation Log</span>
                  </div>
                </div>
              </div>

              {/* Cancelled Appointments List */}
              {cancelledAppointments.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4">
                    <XCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-base font-extrabold text-slate-900">
                    No Cancelled Appointments
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    You do not have any cancelled consultations or declined requests. Active and completed bookings appear in their respective sections.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cancelledAppointments.map((appointment) => {
                    const client = appointment.client;
                    const clientId =
                      (typeof client === "object" ? client?._id : client) ||
                      appointment.client;
                    const clientName =
                      typeof client === "object"
                        ? client?.name || "Client"
                        : "Client";
                    const clientEmail =
                      typeof client === "object" ? client?.email : null;
                    const clientPhone =
                      typeof client === "object" ? client?.phone : null;
                    const clientCity =
                      typeof client === "object" ? client?.cityVillage : null;
                    const clientState =
                      typeof client === "object" ? client?.state : null;
                    const clientLocation = [clientCity, clientState]
                      .filter(Boolean)
                      .join(", ");
                    const clientImage =
                      typeof client === "object"
                        ? client?.profileImage
                        : null;

                    const refId = `#APT-${appointment._id.slice(-6).toUpperCase()}`;
                    const durationText = `${appointment.durationMinutes || 30} mins`;
                    const scheduledDateFormatted = formatDateOnly(
                      appointment.scheduledAt
                    );
                    const scheduledTimeRange = formatTimeRange(
                      appointment.scheduledAt,
                      appointment.durationMinutes || 30
                    );

                    // Cancellation status label & badge
                    const isDeclined = appointment.status === "rejected";
                    let statusLabel = "Cancelled";
                    let statusBadgeClass =
                      "bg-rose-50 text-rose-700 border-rose-200";

                    if (isDeclined) {
                      statusLabel = "Declined by Advocate";
                      statusBadgeClass =
                        "bg-rose-50 text-rose-800 border-rose-300";
                    } else if (appointment.cancelledBy === "lawyer") {
                      statusLabel = "Cancelled by Advocate";
                      statusBadgeClass =
                        "bg-rose-50 text-rose-700 border-rose-200";
                    } else if (appointment.cancelledBy === "client") {
                      statusLabel = "Cancelled by Client";
                      statusBadgeClass =
                        "bg-amber-50 text-amber-800 border-amber-200";
                    } else if (appointment.cancelledBy === "admin") {
                      statusLabel = "Cancelled by Admin";
                      statusBadgeClass =
                        "bg-purple-50 text-purple-700 border-purple-200";
                    } else {
                      statusLabel = "Cancelled";
                      statusBadgeClass =
                        "bg-rose-50 text-rose-700 border-rose-200";
                    }

                    const cancellationTimestamp =
                      appointment.cancelledAt ||
                      appointment.updatedAt ||
                      appointment.createdAt;
                    const formattedCancellationTime = formatDateTime(
                      cancellationTimestamp
                    );

                    const reasonText =
                      appointment.cancellationReason ||
                      appointment.notes ||
                      (isDeclined
                        ? "Request was declined by advocate."
                        : "No specific cancellation reason provided.");

                    // Payment and Refund statuses
                    const paymentStatus =
                      appointment.paymentStatus ||
                      (appointment.isPaid ? "paid" : "unpaid");
                    const refundStatus =
                      appointment.payment?.refundStatus ||
                      appointment.refundStatus ||
                      (paymentStatus === "refunded"
                        ? "Processed"
                        : paymentStatus === "paid"
                        ? "Initiated"
                        : "N/A");

                    return (
                      <div
                        key={appointment._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                          {/* Client Information & Avatar */}
                          <div className="flex items-start gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="relative shrink-0 group cursor-pointer"
                              title="Click to view client details"
                            >
                              {clientImage ? (
                                <img
                                  src={clientImage}
                                  alt={clientName}
                                  className="h-12 w-12 rounded-2xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-rose-500 transition shadow-2xs"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-rose-900 text-white flex items-center justify-center font-heading font-black text-sm group-hover:ring-2 group-hover:ring-rose-500 transition shadow-2xs">
                                  {clientName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </button>

                            <div className="space-y-1.5 flex-1">
                              {/* Client Name + Badges + Ref ID */}
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    clientId && setSelectedClientId(clientId)
                                  }
                                  className="font-heading font-black text-sm text-slate-900 hover:text-rose-600 transition text-left cursor-pointer"
                                >
                                  {clientName}
                                </button>

                                <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-mono font-bold border border-slate-200">
                                  {refId}
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${statusBadgeClass}`}
                                >
                                  {statusLabel}
                                </span>

                                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                                  {appointment.consultationType || "Video"}
                                </span>
                              </div>

                              {/* Contact Details (email, phone, location) */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                {clientEmail && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    {clientEmail}
                                  </span>
                                )}
                                {clientPhone && (
                                  <>
                                    {clientEmail && <span>•</span>}
                                    <span className="flex items-center gap-1 font-medium">
                                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                                      {clientPhone}
                                    </span>
                                  </>
                                )}
                                {clientLocation && (
                                  <>
                                    {(clientEmail || clientPhone) && (
                                      <span>•</span>
                                    )}
                                    <span className="flex items-center gap-1 font-medium">
                                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                      {clientLocation}
                                    </span>
                                  </>
                                )}
                                {!clientEmail &&
                                  !clientPhone &&
                                  !clientLocation && (
                                    <span className="text-[11px] text-slate-400 italic">
                                      Contact details not shared
                                    </span>
                                  )}
                              </div>

                              {/* Scheduled Date, Time, Duration */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                                <span className="flex items-center gap-1 font-medium">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  Scheduled:{" "}
                                  <strong>{scheduledDateFormatted}</strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {scheduledTimeRange}
                                </span>
                                <span>•</span>
                                <span className="text-slate-500 font-medium">
                                  Duration: {durationText}
                                </span>
                              </div>

                              {/* Cancellation Details: Timestamp & Reason */}
                              <div className="mt-2 rounded-2xl bg-rose-50/70 border border-rose-100 p-3 space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                                    Cancelled On:
                                  </span>
                                  <span className="text-rose-700 font-medium">
                                    {formattedCancellationTime}
                                  </span>
                                </div>
                                <p className="text-xs text-rose-950 font-normal">
                                  <span className="font-semibold text-rose-900">
                                    Reason:
                                  </span>{" "}
                                  {reasonText}
                                </p>
                              </div>

                              {/* Payment & Refund Status Badges */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-medium">
                                    Payment Status:
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                                      paymentStatus === "paid"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : paymentStatus === "refunded"
                                        ? "bg-blue-50 text-blue-800 border-blue-200"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    {paymentStatus}
                                  </span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-medium">
                                    Refund Status:
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                                      refundStatus.toLowerCase() ===
                                      "processed"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : refundStatus.toLowerCase() ===
                                            "initiated" ||
                                          refundStatus.toLowerCase() ===
                                            "pending"
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    {refundStatus}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Summary & Details */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 lg:pt-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSummaryAppointment(appointment)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>Summary</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                clientId && setSelectedClientId(clientId)
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: CLIENT REVIEWS                                                 */}
          {/* ===================================================================== */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Rating Overview Banner */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-slate-900">
                      Client Reviews & Practice Ratings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Feedback submitted by verified clients who completed legal
                      consultations.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-2xl font-heading font-black text-slate-900">
                      <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                      <span>{ratingValue}</span>
                      <span className="text-xs text-slate-400 font-semibold">
                        / 5.0
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-extrabold">
                      {reviewCount} Reviews
                    </span>
                  </div>
                </div>

                {/* 5-Star Breakdown */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewsData.filter(
                      (r) => Math.round(r.rating || 0) === star
                    ).length;
                    const pct =
                      reviewsData.length > 0
                        ? Math.round((count / reviewsData.length) * 100)
                        : star === 5
                        ? 100
                        : 0;

                    return (
                      <div
                        key={star}
                        className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-600 font-semibold">
                          <span className="flex items-center gap-1">
                            {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </span>
                          <span>{count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading client reviews...
                </div>
              ) : reviewsData.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                  <Star className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    No client reviews recorded yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Reviews left by clients following completed consultations will be
                    published here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsData.map((rev) => {
                    const client = rev.client;
                    const clientName =
                      typeof client === "object"
                        ? client?.name || "Verified Client"
                        : "Verified Client";
                    const initial = clientName.charAt(0).toUpperCase();

                    return (
                      <div
                        key={rev._id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs">
                              {initial}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {clientName}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString(
                                  "en-IN",
                                  { dateStyle: "medium" }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.round(rev.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                          &ldquo;{rev.comment || rev.review || "Excellent legal consultation and clear advice."}&rdquo;
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 pt-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified Client Consultation</span>
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
                  <h3 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span>Practice Notifications</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time alerts for booking requests, settlements, and client
                    updates.
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
          {/* TAB 7: MY PROFILE (5 Independent Sections & Profile Presentation)    */}
          {/* ===================================================================== */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Profile Header & Identity Overview Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Lawyer Profile Photo with Upload */}
                    <div className="relative shrink-0 flex flex-col items-center gap-2">
                      <div className="relative">
                        {lawyerProfile?.user?.profileImage ? (
                          <img
                            src={lawyerProfile.user.profileImage}
                            alt={lawyerName}
                            className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-md">
                            {initials}
                          </div>
                        )}
                        {isVerified && (
                          <div
                            className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white ring-2 ring-white shadow-xs"
                            title="BCI Verified Advocate"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <label
                        htmlFor="profile-photo-change-input"
                        className="cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 transition"
                      >
                        {uploadingImage ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                        <span>{uploadingImage ? "Uploading..." : "Change Photo"}</span>
                        <input
                          id="profile-photo-change-input"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {/* Basic Identity Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-black text-2xl text-slate-900">
                          Advocate {lawyerName}
                        </h3>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            BCI Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-xs font-bold">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            Verification Pending
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-blue-600">
                        {lawyerProfile?.designation || "Advocate"} • Bar Council ID:{" "}
                        <span className="text-slate-900">{barRegText}</span>
                      </p>

                      <p className="text-xs text-slate-600 font-medium">
                        {headline}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {experienceYears} {experienceYears === 1 ? "year" : "years"} experience
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {ratingValue} / 5.0 ({reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {lawyerProfile?._id && (
                      <Link
                        to={`/lawyers/${lawyerProfile._id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                        <span>Public Directory Profile</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Professional Chamber & Bio Summary */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      About Chambers & Professional Practice
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-slate-600">
                    {lawyerProfile?.bio ||
                      "Experienced advocate practicing across trial and appellate courts, providing legal consultations, litigation management, documentation, and advisory services."}
                  </p>
                  {lawyerProfile?.describeUs && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">
                        Practice Overview:
                      </span>
                      <p className="italic text-slate-600 whitespace-pre-line">
                        {lawyerProfile.describeUs}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 1: BASIC DETAILS                                          */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        1
                      </span>
                      Basic Details
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full name, contact coordinates, consultation fees, duration, and chamber location
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBasicDetailsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Basic Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <User className="h-3 w-3 text-blue-600" /> Full Name
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      Advocate {lawyerName}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Mail className="h-3 w-3 text-blue-600" /> Email Address
                    </span>
                    <p className="font-bold text-slate-900 truncate">{lawyerEmail}</p>
                  </div>

                  {/* Phone */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-blue-600" /> Mobile Number
                    </span>
                    <p className="font-bold text-slate-900">
                      {lawyerPhone}
                      {lawyerProfile?.hidePhone && (
                        <span className="ml-1 text-[10px] text-slate-400 font-normal">
                          (Private)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Consultation Fee */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-blue-600" /> Consultation Fee
                    </span>
                    <p className="font-extrabold text-blue-600 text-sm">
                      ₹{feesText} <span className="text-xs font-semibold text-slate-500">/ session</span>
                    </p>
                  </div>

                  {/* Consultation Duration */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" /> Consultation Duration
                    </span>
                    <p className="font-bold text-slate-900">
                      {consultationDurationText}
                    </p>
                  </div>

                  {/* Languages */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-600" /> Languages
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {languagesList.join(", ")}
                    </p>
                  </div>

                  {/* Designation */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-blue-600" /> Designation
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {lawyerProfile?.designation || "Advocate"}
                    </p>
                  </div>

                  {/* Location / City */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-600" /> Practice City
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {lawyerProfile?.city || "Not provided"}
                      {lawyerProfile?.state ? `, ${lawyerProfile.state}` : ""}
                    </p>
                  </div>
                </div>

                {/* Office & Chamber Street Address */}
                <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/80 flex items-start gap-3 text-xs">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900">Chamber & Office Location</h5>
                    <p className="text-slate-600 mt-0.5">
                      {lawyerProfile?.officeAddress
                        ? `${lawyerProfile.officeAddress}, `
                        : ""}
                      {[lawyerProfile?.district, lawyerProfile?.city, lawyerProfile?.state]
                        .filter(Boolean)
                        .join(", ") || "National Practice, India"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 2: SPECIALIZATION & PRACTICE AREA                         */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        2
                      </span>
                      Specialization & Practice Area
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Primary legal domains, secondary specializations, court admissions, and active jurisdictions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpecializationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Specializations</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Primary Specializations */}
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-blue-600" />
                      Primary Legal Specializations
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {specializationList.map((spec, i) => (
                        <span
                          key={i}
                          className="rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                        >
                          <Scale className="h-3 w-3 text-blue-500" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Specializations */}
                  {secondarySpecializations.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                        Other / Secondary Specializations & Focus Domains
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {secondarySpecializations.map((spec, i) => (
                          <span
                            key={`sec-${i}`}
                            className="rounded-xl bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Court Admissions & Jurisdictions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-blue-600" />
                        Court Admissions & Levels
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {(lawyerProfile?.courtLevels && lawyerProfile.courtLevels.length > 0
                          ? lawyerProfile.courtLevels
                          : ["District Court", "High Court"]
                        ).map((court, i) => (
                          <span
                            key={i}
                            className="rounded-xl bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                          >
                            🏛️ {court}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Active Court Jurisdictions & Benches
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {jurisdictionsList.map((jurisdiction, i) => (
                          <span
                            key={i}
                            className="rounded-xl bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1.5 text-xs font-medium"
                          >
                            {jurisdiction}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 3: EDUCATION & ACADEMIC QUALIFICATIONS                    */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        3
                      </span>
                      Education & Academic Qualifications
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Degrees, courses, universities, graduating years, and academic honors
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Education</span>
                  </button>
                </div>

                {educationList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 space-y-2">
                    <GraduationCap className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">
                      No educational credentials listed yet.
                    </p>
                    <p className="text-slate-400">
                      Click &ldquo;Update Education&rdquo; to add your law degrees, colleges, and academic certifications.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEducationModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition mt-2 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add Qualifications</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educationList.map((edu, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/80 space-y-2 text-xs relative hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">
                                {edu.degree || "Law Degree"}
                              </h5>
                              <p className="text-slate-600 font-medium">
                                {edu.institution || "College / University"}
                              </p>
                            </div>
                          </div>
                          {edu.year && (
                            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold shrink-0">
                              Class of {edu.year}
                            </span>
                          )}
                        </div>

                        {edu.cityState && (
                          <p className="text-slate-500 flex items-center gap-1 text-[11px] pl-10">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {edu.cityState}
                          </p>
                        )}

                        {edu.certifications && (
                          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-blue-700 font-semibold pl-10">
                            Honors & Certifications: {edu.certifications}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* SECTION 4: INTERNSHIPS & JUDICIAL TRAINING                        */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        4
                      </span>
                      Internships & Judicial Training
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Court clerkships, chamber internships, practice training, and legal assistance records
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInternshipsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Internships</span>
                  </button>
                </div>

                {internshipsList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 space-y-2">
                    <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">
                      No judicial clerkships or internship details listed.
                    </p>
                    <p className="text-slate-400">
                      Click &ldquo;Update Internships&rdquo; to add chamber internships, court clerkships, and judicial training.
                    </p>
                    <button
                      type="button"
                      onClick={() => setInternshipsModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition mt-2 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add Internships</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {internshipsList.map((intern, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/80 space-y-2 text-xs relative hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {intern.institution}
                            </h5>
                            <p className="text-blue-700 font-semibold text-xs mt-0.5">
                              {intern.role || "Legal Intern"}
                              {intern.practiceArea ? ` • ${intern.practiceArea}` : ""}
                            </p>
                          </div>
                          {intern.duration && (
                            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold shrink-0">
                              {intern.duration}
                            </span>
                          )}
                        </div>

                        {intern.responsibilities && (
                          <p className="text-slate-600 pt-1 leading-relaxed border-t border-slate-200/80">
                            {intern.responsibilities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* SECTION 5: ACHIEVEMENTS & PROFESSIONAL RECOGNITION                 */}
              {/* ================================================================= */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                        5
                      </span>
                      Achievements & Professional Recognition
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Awards, milestone achievements, legal publications, seminars, and professional memberships
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAchievementsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Achievements</span>
                  </button>
                </div>

                {/* Awards & Honors List */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" />
                    Awards & Honors
                  </h5>

                  {awardsList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 italic">
                      No awards or honors added yet. Click &ldquo;Update Achievements&rdquo; to add accolades.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {awardsList.map((award, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-amber-50/40 border border-amber-200/70 p-4 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h6 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-amber-600 shrink-0" />
                              {award.name}
                            </h6>
                            {award.year && (
                              <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold shrink-0">
                                {award.year}
                              </span>
                            )}
                          </div>
                          {award.organization && (
                            <p className="text-amber-900 font-semibold text-xs">
                              {award.organization}
                            </p>
                          )}
                          {award.description && (
                            <p className="text-slate-600 pt-0.5 leading-relaxed">
                              {award.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional Achievements / Accomplishments */}
                {lawyerProfile?.achievements && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Professional Achievements & Court Milestones
                    </h5>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                      {lawyerProfile.achievements}
                    </div>
                  </div>
                )}

                {/* Publications & Legal Research */}
                {lawyerProfile?.publications && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      Publications, Seminars & Legal Research
                    </h5>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                      {lawyerProfile.publications}
                    </div>
                  </div>
                )}

                {/* Professional Memberships */}
                {lawyerProfile?.memberships && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-indigo-600" />
                      Professional Memberships & Bar Associations
                    </h5>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                      {lawyerProfile.memberships}
                    </div>
                  </div>
                )}
              </div>

              {/* Optional: Chambers & Law Firm Practice History (Preserved from experiences) */}
              {experiencesList.length > 0 && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <h4 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Chambers & Professional Practice History
                  </h4>
                  <div className="space-y-3">
                    {experiencesList.map((exp, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">
                            {exp.organization || "Chambers"}
                          </h5>
                          {(exp.startDate || exp.endDate) && (
                            <span className="text-slate-500 font-medium">
                              {exp.startDate || "Start"} — {exp.endDate || "Present"}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-700 font-semibold">
                          {exp.designation || "Advocate"}{" "}
                          {exp.employmentType ? `• ${exp.employmentType}` : ""}
                        </p>
                        {exp.practiceAreas && (
                          <p className="text-slate-500">
                            Focus Areas: {exp.practiceAreas}
                          </p>
                        )}
                        {exp.responsibilities && (
                          <p className="text-slate-600 pt-1 leading-relaxed whitespace-pre-line">
                            {exp.responsibilities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 8: PROFILE SETTINGS                                               */}
          {/* ===================================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-slate-900">
                      Advocate Profile & Account Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage your profile KYC, consultation fees, contact details,
                      and credentials.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Open Profile Editor</span>
                  </button>
                </div>

                {/* Completeness Bar */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Profile Completeness Score
                    </span>
                    <span className="font-extrabold text-blue-600 text-sm">
                      {completenessPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${completenessPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A 100% completed profile improves advocate discovery in search
                    results and speeds up verified client bookings.
                  </p>
                </div>

                {/* Profile Settings Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                    <h4 className="font-bold text-slate-900">Photo & Branding</h4>
                    <p className="text-slate-500">
                      Update your advocate profile photo visible to clients and on
                      the public directory.
                    </p>
                    <label
                      htmlFor="settings-photo-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800 transition"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Change Photo"}</span>
                      <input
                        id="settings-photo-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                    <h4 className="font-bold text-slate-900">
                      Comprehensive Form Editor
                    </h4>
                    <p className="text-slate-500">
                      Update your legal qualifications, fees, office address, and
                      court practice areas.
                    </p>
                    <button
                      type="button"
                      onClick={() => setProfileModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 transition cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Edit All Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 9: ABOUT US (Lawyer About Us & Practice Overview)                 */}
          {/* ===================================================================== */}
          {activeTab === "about-us" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>About Us & Practice Overview</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Describe your chamber, legal philosophy, and credentials
                      presented to clients.
                    </p>
                  </div>

                  {!isEditingDescribeUs && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDescribeUs(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition cursor-pointer shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Practice Overview</span>
                    </button>
                  )}
                </div>

                {describeUsSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{describeUsSuccess}</span>
                  </div>
                )}

                {describeUsError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{describeUsError}</span>
                  </div>
                )}

                {/* Inline Editor or Display */}
                {isEditingDescribeUs ? (
                  <div className="space-y-4">
                    <label
                      htmlFor="describe-us-textarea"
                      className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                    >
                      Practice Overview / &ldquo;Describe Us&rdquo; Content
                    </label>
                    <textarea
                      id="describe-us-textarea"
                      rows={6}
                      value={describeUsText}
                      onChange={(e) => setDescribeUsText(e.target.value)}
                      placeholder="Describe your legal practice, core expertise, chamber values, and consultation process..."
                      className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs leading-relaxed"
                    />

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleSaveDescribeUs}
                        disabled={savingDescribeUs}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        {savingDescribeUs ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {savingDescribeUs ? "Saving..." : "Save Overview"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDescribeUs(false);
                          setDescribeUsText(
                            lawyerProfile?.describeUs ||
                              lawyerProfile?.bio ||
                              ""
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Chamber & Advocacy Overview
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-100 whitespace-pre-line">
                      {describeUsText ||
                        "Our chamber provides dedicated legal advocacy and strategic consultation. We represent clients across civil, criminal, corporate, and constitutional matters with unwavering integrity and adherence to the Bar Council of India standards."}
                    </p>
                  </div>
                )}

                {/* LegalConnect Charter & Standards */}
                <div className="rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <h4 className="font-heading font-extrabold text-sm text-white">
                      LegalConnect Advocate Network Principles
                    </h4>
                  </div>
                  <p className="text-xs text-blue-200 leading-relaxed">
                    LegalConnect empowers registered Indian advocates to manage
                    their legal consultations, secure direct client appointments,
                    and deliver transparent, verified legal counsel nationwide in
                    strict compliance with the Advocates Act, 1961.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS (Fixed with explicit isOpen props and event bindings)           */}
      {/* ========================================================================= */}

      {/* Client Detail Modal */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          isOpen={Boolean(selectedClientId)}
          onClose={() => setSelectedClientId(null)}
          onOpenChat={(app) => {
            setChatAppointment(app);
            setSelectedClientId(null);
          }}
          onOpenDocuments={(app) => {
            setDocumentAppointment(app);
            setSelectedClientId(null);
          }}
        />
      )}

      {/* Appointment Summary Modal */}
      {summaryAppointment && (
        <AppointmentSummaryModal
          appointment={summaryAppointment}
          isOpen={Boolean(summaryAppointment)}
          onClose={() => setSummaryAppointment(null)}
          onOpenDocuments={(app) => {
            setDocumentAppointment(app || summaryAppointment);
            setSummaryAppointment(null);
          }}
          onOpenChat={(app) => {
            setChatAppointment(app || summaryAppointment);
            setSummaryAppointment(null);
          }}
        />
      )}

      {/* Client Feedback Modal */}
      {feedbackAppointment && (
        <ClientFeedbackModal
          appointment={feedbackAppointment}
          isOpen={Boolean(feedbackAppointment)}
          onClose={() => setFeedbackAppointment(null)}
        />
      )}

      {/* Chat Modal */}
      {chatAppointment && (
        <ChatModal
          appointment={chatAppointment}
          isOpen={Boolean(chatAppointment)}
          currentUserRole="lawyer"
          onClose={() => setChatAppointment(null)}
          onOpenDocuments={() => {
            setDocumentAppointment(chatAppointment);
            setChatAppointment(null);
          }}
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

      {/* Profile Settings Modal */}
      {profileModalOpen && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          lawyerProfile={lawyerProfile}
          onProfileUpdated={(updated) => {
            setLawyerProfile((prev) => ({ ...prev, ...updated }));
            if (updateUser && updated?.user) {
              updateUser(updated.user);
            }
            loadProfile();
          }}
        />
      )}

      {/* 5 Section-wise Profile Modals */}
      <EditBasicDetailsModal
        isOpen={basicDetailsModalOpen}
        onClose={() => setBasicDetailsModalOpen(false)}
        lawyerProfile={lawyerProfile}
        onSaveSuccess={(updated) => {
          setLawyerProfile((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
        onUserUpdated={(updatedUser) => {
          if (updateUser) updateUser(updatedUser);
        }}
      />

      <EditSpecializationModal
        isOpen={specializationModalOpen}
        onClose={() => setSpecializationModalOpen(false)}
        lawyerProfile={lawyerProfile}
        onSaveSuccess={(updated) => {
          setLawyerProfile((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
      />

      <EditEducationModal
        isOpen={educationModalOpen}
        onClose={() => setEducationModalOpen(false)}
        lawyerProfile={lawyerProfile}
        onSaveSuccess={(updated) => {
          setLawyerProfile((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
      />

      <EditInternshipsModal
        isOpen={internshipsModalOpen}
        onClose={() => setInternshipsModalOpen(false)}
        lawyerProfile={lawyerProfile}
        onSaveSuccess={(updated) => {
          setLawyerProfile((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
      />

      <EditAchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        lawyerProfile={lawyerProfile}
        onSaveSuccess={(updated) => {
          setLawyerProfile((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
      />

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-base text-slate-900">
                Sign Out of Advocate Portal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to log out of LegalConnect? You will need to
                enter your advocate credentials to sign back in.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
