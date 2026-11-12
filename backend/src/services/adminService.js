const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const LawyerAvailability = require("../models/LawyerAvailability");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const AdminLog = require("../models/AdminLog");
const PlatformSetting = require("../models/PlatformSetting");
const razorpay = require("../config/razorpay");
const { logAdminAction } = require("../utils/auditLogger");
const { escapeRegex } = require("../utils/searchUtils");

// =========================================================================
// HELPER: Date Range Calculation
// =========================================================================
function getDateRangeFilter(range = "30d", customStart = null, customEnd = null) {
  const now = new Date();
  let start = new Date();

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(now.getDate() - 7);
      break;
    case "30d":
      start.setDate(now.getDate() - 30);
      break;
    case "3m":
      start.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "custom":
      if (customStart) {
        start = new Date(customStart);
      } else {
        start.setDate(now.getDate() - 30);
      }
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  const end = customEnd ? new Date(customEnd) : now;
  return { start, end };
}

// =========================================================================
// 1. DASHBOARD METRICS (KPI Cards)
// =========================================================================
const getAdminMetricsService = async (query = {}) => {
  const { start, end } = getDateRangeFilter(query.range, query.startDate, query.endDate);

  const [
    totalUsers,
    totalClients,
    totalLawyers,
    activeClients,
    blockedClients,
    activeLawyers,
    blockedLawyers,
    verifiedLawyers,
    pendingLawyers,
    rejectedLawyers,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    capturedPaymentsList,
    refundedPaymentsList,
    totalReviews,
    openComplaints
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "lawyer" }),
    User.countDocuments({ role: "client", isActive: true }),
    User.countDocuments({ role: "client", isActive: false }),
    User.countDocuments({ role: "lawyer", isActive: true }),
    User.countDocuments({ role: "lawyer", isActive: false }),
    Lawyer.countDocuments({ verificationStatus: "approved" }),
    Lawyer.countDocuments({ verificationStatus: { $in: ["pending", "under_review"] } }),
    Lawyer.countDocuments({ verificationStatus: "rejected" }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "confirmed" }),
    Appointment.countDocuments({ status: "completed" }),
    Appointment.countDocuments({ status: "cancelled" }),
    Payment.find({ status: "captured" }).select("amount").lean(),
    Payment.find({ status: "refunded" }).select("amount").lean(),
    Review.countDocuments(),
    Complaint.countDocuments({ status: { $in: ["open", "in_progress"] } })
  ]);

  // Financial calculations
  const totalGrossPaise = capturedPaymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalGrossRupees = Math.round(totalGrossPaise / 100);

  const totalRefundPaise = refundedPaymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRefundRupees = Math.round(totalRefundPaise / 100);

  const netRevenueRupees = Math.max(0, totalGrossRupees - totalRefundRupees);

  // Range filtered counts for change indicators
  const rangeUsers = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
  const rangeAppointments = await Appointment.countDocuments({ createdAt: { $gte: start, $lte: end } });
  const rangePayments = await Payment.countDocuments({ status: "captured", createdAt: { $gte: start, $lte: end } });

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      lawyers: totalLawyers,
      activeClients,
      blockedClients,
      activeLawyers,
      blockedLawyers,
      rangeRegistrations: rangeUsers
    },
    lawyerVerifications: {
      verified: verifiedLawyers,
      pending: pendingLawyers,
      rejected: rejectedLawyers
    },
    appointments: {
      total: totalAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      rangeAppointments
    },
    financials: {
      totalTransactions: capturedPaymentsList.length,
      grossRevenueRupees: totalGrossRupees,
      totalRefundsCount: refundedPaymentsList.length,
      refundAmountRupees: totalRefundRupees,
      netRevenueRupees,
      rangeTransactions: rangePayments
    },
    support: {
      totalReviews,
      openComplaints
    }
  };
};

// =========================================================================
// 2. DASHBOARD ANALYTICS & CHARTS
// =========================================================================
const getAdminAnalyticsService = async (query = {}) => {
  const { start, end } = getDateRangeFilter(query.range, query.startDate, query.endDate);

  // 1. User Registration Growth (Daily aggregation over date boundary)
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          role: "$role"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

  // Reshape userGrowth into clean daily series
  const userGrowthMap = {};
  userGrowth.forEach((item) => {
    const dateStr = item._id.date;
    if (!userGrowthMap[dateStr]) {
      userGrowthMap[dateStr] = { date: dateStr, total: 0, client: 0, lawyer: 0 };
    }
    const c = item.count;
    if (item._id.role === "client") userGrowthMap[dateStr].client += c;
    if (item._id.role === "lawyer") userGrowthMap[dateStr].lawyer += c;
    userGrowthMap[dateStr].total += c;
  });
  const userGrowthSeries = Object.values(userGrowthMap);

  // 2. Appointment Status Breakdown
  const appointmentStatuses = await Appointment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  const appointmentStatusMap = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0
  };
  appointmentStatuses.forEach((s) => {
    if (s._id) appointmentStatusMap[s._id] = s.count;
  });

  // 3. Lawyer Verification Breakdown
  const verificationBreakdown = await Lawyer.aggregate([
    {
      $group: {
        _id: "$verificationStatus",
        count: { $sum: 1 }
      }
    }
  ]);
  const verificationMap = {
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    additional_info_required: 0,
    suspended: 0
  };
  verificationBreakdown.forEach((v) => {
    if (v._id) verificationMap[v._id] = v.count;
  });

  // 4. Revenue Analytics over Time
  const revenueTrend = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["captured", "refunded"] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: "$status"
        },
        totalPaise: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

  const revenueTrendMap = {};
  revenueTrend.forEach((item) => {
    const d = item._id.date;
    if (!revenueTrendMap[d]) {
      revenueTrendMap[d] = { date: d, gross: 0, refund: 0, net: 0 };
    }
    const valRupees = Math.round(item.totalPaise / 100);
    if (item._id.status === "captured") {
      revenueTrendMap[d].gross += valRupees;
    } else if (item._id.status === "refunded") {
      revenueTrendMap[d].refund += valRupees;
    }
    revenueTrendMap[d].net = Math.max(0, revenueTrendMap[d].gross - revenueTrendMap[d].refund);
  });
  const revenueSeries = Object.values(revenueTrendMap);

  // 5. Monthly Client vs Lawyer Growth (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%b %Y", date: "$createdAt" } },
          monthSort: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          role: "$role"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.monthSort": 1 } }
  ]);

  const monthlyGrowthMap = {};
  monthlyGrowth.forEach((item) => {
    const m = item._id.month;
    if (!monthlyGrowthMap[m]) {
      monthlyGrowthMap[m] = { month: m, monthSort: item._id.monthSort, clients: 0, lawyers: 0 };
    }
    if (item._id.role === "client") monthlyGrowthMap[m].clients += item.count;
    if (item._id.role === "lawyer") monthlyGrowthMap[m].lawyers += item.count;
  });
  const monthlyGrowthSeries = Object.values(monthlyGrowthMap).sort((a, b) => a.monthSort.localeCompare(b.monthSort));

  // 6. Lawyer Specialization Analytics
  const specializationBreakdown = await Lawyer.aggregate([
    { $unwind: "$specialization" },
    {
      $group: {
        _id: "$specialization",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  // 7. Appointment Trends (Daily volume)
  const appointmentTrends = await Appointment.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        appointments: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const appointmentTrendSeries = appointmentTrends.map((t) => ({
    date: t._id,
    count: t.appointments
  }));

  // 8. Payment Status Breakdown
  const paymentStatuses = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalPaise: { $sum: "$amount" }
      }
    }
  ]);
  const paymentStatusMap = {
    captured: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    created: { count: 0, amount: 0 }
  };
  paymentStatuses.forEach((p) => {
    if (p._id) {
      paymentStatusMap[p._id] = {
        count: p.count,
        amount: Math.round(p.totalPaise / 100)
      };
    }
  });

  return {
    userGrowth: userGrowthSeries,
    appointmentStatuses: appointmentStatusMap,
    verificationStatuses: verificationMap,
    revenueTrend: revenueSeries,
    monthlyGrowth: monthlyGrowthSeries,
    specializations: specializationBreakdown.map((s) => ({ name: s._id, count: s.count })),
    appointmentTrends: appointmentTrendSeries,
    paymentStatuses: paymentStatusMap
  };
};

// =========================================================================
// 3. RECENT ACTIVITY LISTS
// =========================================================================
const getAdminRecentActivityService = async () => {
  const [
    recentRegistrations,
    recentApplications,
    recentAppointments,
    recentPayments,
    recentComplaints,
    recentAdminLogs
  ] = await Promise.all([
    User.find().select("name email role createdAt profileImage isActive").sort({ createdAt: -1 }).limit(5).lean(),
    Lawyer.find()
      .populate("user", "name email profileImage")
      .select("user specialization experienceYears verificationStatus barCouncilId createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Appointment.find()
      .populate("client", "name email profileImage")
      .populate({
        path: "lawyer",
        select: "user specialization",
        populate: { path: "user", select: "name email" }
      })
      .select("client lawyer scheduledAt consultationType status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Payment.find()
      .populate("client", "name email")
      .select("client amount status currency razorpayPaymentId createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Complaint.find()
      .populate("submittedBy", "name email")
      .select("complaintId submittedBy role subject priority status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    AdminLog.find().sort({ createdAt: -1 }).limit(6).lean()
  ]);

  return {
    recentRegistrations,
    recentApplications,
    recentAppointments,
    recentPayments: recentPayments.map((p) => ({
      ...p,
      amountRupees: Math.round(p.amount / 100)
    })),
    recentComplaints,
    recentAdminLogs
  };
};

// =========================================================================
// 4. CLIENT MANAGEMENT
// =========================================================================
const getAdminClientsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { role: "client" };

  if (query.status === "active") filter.isActive = true;
  if (query.status === "blocked") filter.isActive = false;

  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const sort = {};
  if (query.sortBy === "name_asc") sort.name = 1;
  else if (query.sortBy === "name_desc") sort.name = -1;
  else if (query.sortBy === "oldest") sort.createdAt = 1;
  else sort.createdAt = -1;

  const [clients, total] = await Promise.all([
    User.find(filter)
      .select("-password -__v")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  // Augment with appointment counts
  const clientIds = clients.map((c) => c._id);
  const appointmentCounts = await Appointment.aggregate([
    { $match: { client: { $in: clientIds } } },
    { $group: { _id: "$client", count: { $sum: 1 } } }
  ]);
  const countMap = {};
  appointmentCounts.forEach((ac) => {
    countMap[ac._id.toString()] = ac.count;
  });

  const enriched = clients.map((client) => ({
    ...client,
    totalAppointments: countMap[client._id.toString()] || 0
  }));

  return {
    clients: enriched,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAdminClientDetailService = async (clientId) => {
  const client = await User.findOne({ _id: clientId, role: "client" }).select("-password -__v").lean();
  if (!client) {
    const error = new Error("Client account not found");
    error.statusCode = 404;
    throw error;
  }

  const [appointments, reviews, complaints] = await Promise.all([
    Appointment.find({ client: clientId })
      .populate({
        path: "lawyer",
        select: "user specialization city",
        populate: { path: "user", select: "name email profileImage" }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Review.find({ client: clientId })
      .populate({
        path: "lawyer",
        select: "user",
        populate: { path: "user", select: "name" }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Complaint.find({ submittedBy: clientId }).sort({ createdAt: -1 }).limit(10).lean()
  ]);

  return {
    client,
    appointments,
    reviews,
    complaints
  };
};

const toggleClientBlockService = async (adminId, clientId, { isBlocked, blockReason }, req) => {
  if (adminId.toString() === clientId.toString()) {
    const error = new Error("Administrators cannot block their own account");
    error.statusCode = 400;
    throw error;
  }

  const client = await User.findById(clientId);
  if (!client || client.role !== "client") {
    const error = new Error("Client not found");
    error.statusCode = 404;
    throw error;
  }

  if (isBlocked && (!blockReason || !blockReason.trim())) {
    const error = new Error("A specific reason is strictly required when blocking a user");
    error.statusCode = 400;
    throw error;
  }

  if (isBlocked) {
    client.isActive = false;
    client.blockReason = blockReason.trim();
    client.blockedAt = new Date();
    client.blockedBy = adminId;
  } else {
    client.isActive = true;
    client.blockReason = null;
    client.unblockedAt = new Date();
    client.unblockedBy = adminId;
  }

  await client.save();

  // Audit Log
  await logAdminAction({
    adminId,
    action: isBlocked ? "CLIENT_BLOCK" : "CLIENT_UNBLOCK",
    targetType: "Client",
    targetId: client._id,
    description: isBlocked
      ? `Blocked client account: ${client.name} (${client.email}). Reason: ${blockReason}`
      : `Restored/Unblocked client account: ${client.name} (${client.email})`,
    details: { isBlocked, reason: blockReason },
    req
  });

  return {
    client: {
      _id: client._id,
      name: client.name,
      email: client.email,
      isActive: client.isActive,
      blockReason: client.blockReason
    },
    message: isBlocked ? "Client account has been blocked" : "Client account has been unblocked"
  };
};

// =========================================================================
// 5. LAWYER MANAGEMENT
// =========================================================================
const getAdminLawyersService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const lawyerFilter = {};

  if (query.verificationStatus) {
    lawyerFilter.verificationStatus = query.verificationStatus;
  }

  if (query.specialization && query.specialization !== "All Specializations") {
    lawyerFilter.specialization = query.specialization;
  }

  if (query.minExperience) {
    lawyerFilter.experienceYears = { $gte: Number(query.minExperience) };
  }

  // Pre-filter on User model for text search & active status
  let userQuery = { role: "lawyer" };
  if (query.status === "active") userQuery.isActive = true;
  if (query.status === "blocked") userQuery.isActive = false;

  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      userQuery.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
  }

  let matchedUserIds = null;
  if (query.search || query.status) {
    const matchingUsers = await User.find(userQuery).select("_id").lean();
    matchedUserIds = matchingUsers.map((u) => u._id);
    lawyerFilter.user = { $in: matchedUserIds };
  }

  const [lawyers, total] = await Promise.all([
    Lawyer.find(lawyerFilter)
      .populate("user", "name email phone profileImage isActive blockReason createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lawyer.countDocuments(lawyerFilter)
  ]);

  // Augment with appointment counts
  const lawyerIds = lawyers.map((l) => l._id);
  const appointmentCounts = await Appointment.aggregate([
    { $match: { lawyer: { $in: lawyerIds } } },
    { $group: { _id: "$lawyer", count: { $sum: 1 } } }
  ]);
  const countMap = {};
  appointmentCounts.forEach((ac) => {
    countMap[ac._id.toString()] = ac.count;
  });

  const enriched = lawyers.map((l) => ({
    ...l,
    totalAppointments: countMap[l._id.toString()] || 0
  }));

  return {
    lawyers: enriched,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAdminLawyerDetailService = async (lawyerId) => {
  const lawyer = await Lawyer.findById(lawyerId)
    .populate("user", "name email phone profileImage isActive blockReason blockedAt createdAt")
    .populate("reviewedBy", "name email")
    .populate("verificationHistory.reviewedBy", "name email")
    .lean();

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const [appointments, reviews] = await Promise.all([
    Appointment.find({ lawyer: lawyerId })
      .populate("client", "name email profileImage")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Review.find({ lawyer: lawyerId })
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .limit(15)
      .lean()
  ]);

  return {
    lawyer,
    appointments,
    reviews
  };
};

const toggleLawyerBlockService = async (adminId, lawyerId, { isBlocked, blockReason }, req) => {
  const lawyer = await Lawyer.findById(lawyerId).populate("user");
  if (!lawyer || !lawyer.user) {
    const error = new Error("Lawyer record not found");
    error.statusCode = 404;
    throw error;
  }

  if (isBlocked && (!blockReason || !blockReason.trim())) {
    const error = new Error("A specific reason is strictly required when blocking an advocate");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(lawyer.user._id);
  if (!user) {
    const error = new Error("User account associated with lawyer not found");
    error.statusCode = 404;
    throw error;
  }

  if (isBlocked) {
    user.isActive = false;
    user.blockReason = blockReason.trim();
    user.blockedAt = new Date();
    user.blockedBy = adminId;
  } else {
    user.isActive = true;
    user.blockReason = null;
    user.unblockedAt = new Date();
    user.unblockedBy = adminId;
  }

  await user.save();

  // Audit Log
  await logAdminAction({
    adminId,
    action: isBlocked ? "LAWYER_BLOCK" : "LAWYER_UNBLOCK",
    targetType: "Lawyer",
    targetId: lawyer._id,
    description: isBlocked
      ? `Blocked lawyer account: ${user.name} (${user.email}). Reason: ${blockReason}`
      : `Restored/Unblocked lawyer account: ${user.name} (${user.email})`,
    details: { isBlocked, reason: blockReason },
    req
  });

  return {
    lawyerId: lawyer._id,
    isActive: user.isActive,
    message: isBlocked ? "Lawyer account has been blocked" : "Lawyer account has been unblocked"
  };
};

// =========================================================================
// 6. LAWYER VERIFICATION MANAGEMENT
// =========================================================================
const getAdminVerificationsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && query.status !== "all") {
    filter.verificationStatus = query.status;
  }

  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      const matchingUsers = await User.find({ role: "lawyer", $or: [{ name: regex }, { email: regex }] }).select("_id").lean();
      const userIds = matchingUsers.map((u) => u._id);
      filter.$or = [
        { user: { $in: userIds } },
        { barCouncilId: regex },
        { city: regex }
      ];
    }
  }

  const [applications, total] = await Promise.all([
    Lawyer.find(filter)
      .populate("user", "name email phone profileImage createdAt")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lawyer.countDocuments(filter)
  ]);

  return {
    applications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const updateLawyerVerificationService = async (adminId, lawyerId, { status, decisionReason, internalNotes }, req) => {
  const validStatuses = [
    "pending",
    "under_review",
    "approved",
    "rejected",
    "additional_info_required",
    "suspended"
  ];

  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  if (["rejected", "additional_info_required"].includes(status) && (!decisionReason || !decisionReason.trim())) {
    const error = new Error("A clear decision reason is strictly required when rejecting or requesting additional information");
    error.statusCode = 400;
    throw error;
  }

  const lawyer = await Lawyer.findById(lawyerId).populate("user");
  if (!lawyer) {
    const error = new Error("Lawyer application record not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = lawyer.verificationStatus;
  lawyer.verificationStatus = status;
  lawyer.decisionReason = decisionReason ? decisionReason.trim() : "";
  if (internalNotes) lawyer.internalNotes = internalNotes.trim();
  lawyer.reviewedBy = adminId;
  lawyer.reviewedAt = new Date();

  // Record verification history audit entry
  if (!Array.isArray(lawyer.verificationHistory)) lawyer.verificationHistory = [];
  lawyer.verificationHistory.push({
    status,
    decisionReason: lawyer.decisionReason,
    internalNotes: internalNotes ? internalNotes.trim() : "",
    reviewedBy: adminId,
    reviewedAt: new Date()
  });

  if (status === "approved") {
    lawyer.isAvailable = true;
  } else if (status === "rejected") {
    lawyer.isAvailable = false;
  }

  await lawyer.save();

  // Synchronize applicant user role
  if (status === "approved") {
    const targetUserId = lawyer.user?._id || lawyer.user;
    if (targetUserId) {
      await User.findByIdAndUpdate(targetUserId, { role: "lawyer" });
    }
  } else if (status === "rejected") {
    const targetUserId = lawyer.user?._id || lawyer.user;
    if (targetUserId) {
      await User.findByIdAndUpdate(targetUserId, { role: "client" });
    }
  }

  // Send in-app notification to the advocate
  try {
    let title = "Verification Update";
    let message = `Your verification status has been updated to '${status}'.`;
    if (status === "approved") {
      title = "Verification Approved 🎉";
      message = "Congratulations! Your credentials have been verified by LegalConnect Administration. You now have the Verified Advocate badge.";
    } else if (status === "rejected") {
      title = "Verification Application Rejected";
      message = `Your verification application could not be approved. Reason: ${decisionReason}`;
    } else if (status === "additional_info_required") {
      title = "Additional Information Required";
      message = `Admin requested additional details: ${decisionReason}. Please update your profile.`;
    }

    await Notification.create({
      recipient: lawyer.user._id,
      title,
      message,
      type: "system",
      link: "/lawyer/edit-profile",
      relatedId: lawyer._id
    });
  } catch (nErr) {
    console.error("Failed to notify lawyer of verification change:", nErr.message);
  }

  // Audit Log
  await logAdminAction({
    adminId,
    action: status === "approved" ? "LAWYER_VERIFY_APPROVE" : status === "rejected" ? "LAWYER_VERIFY_REJECT" : "LAWYER_VERIFY_STATUS_CHANGE",
    targetType: "Lawyer",
    targetId: lawyer._id,
    description: `Changed verification status of ${lawyer.user?.name || "Advocate"} from ${oldStatus} to ${status}. Reason: ${decisionReason || "N/A"}`,
    details: { oldStatus, newStatus: status, decisionReason, internalNotes },
    req
  });

  return {
    lawyerId: lawyer._id,
    verificationStatus: lawyer.verificationStatus,
    decisionReason: lawyer.decisionReason,
    internalNotes: lawyer.internalNotes,
    message: `Verification status updated to '${status}' successfully`
  };
};

// =========================================================================
// 7. APPOINTMENT MANAGEMENT
// =========================================================================
const getAdminAppointmentsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.consultationType && query.consultationType !== "all") {
    filter.consultationType = query.consultationType;
  }
  if (query.startDate || query.endDate) {
    filter.scheduledAt = {};
    if (query.startDate) filter.scheduledAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.scheduledAt.$lte = new Date(query.endDate);
  }

  // Search by client or lawyer name
  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("_id").lean();
      const userIds = matchingUsers.map((u) => u._id);
      const matchingLawyers = await Lawyer.find({ user: { $in: userIds } }).select("_id").lean();
      const lawyerIds = matchingLawyers.map((l) => l._id);

      filter.$or = [
        { client: { $in: userIds } },
        { lawyer: { $in: lawyerIds } }
      ];
    }
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("client", "name email phone profileImage")
      .populate({
        path: "lawyer",
        select: "user specialization city consultationFee",
        populate: { path: "user", select: "name email phone profileImage" }
      })
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter)
  ]);

  return {
    appointments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAdminAppointmentDetailService = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate("client", "name email phone profileImage")
    .populate({
      path: "lawyer",
      select: "user specialization city consultationFee barCouncilId",
      populate: { path: "user", select: "name email phone profileImage" }
    })
    .lean();

  if (!appointment) {
    const error = new Error("Appointment record not found");
    error.statusCode = 404;
    throw error;
  }

  const payment = await Payment.findOne({ appointment: appointmentId }).lean();
  const review = await Review.findOne({ appointment: appointmentId }).lean();

  return {
    appointment,
    payment: payment ? { ...payment, amountRupees: Math.round(payment.amount / 100) } : null,
    review
  };
};

const cancelAdminAppointmentService = async (adminId, appointmentId, { reason }, req) => {
  if (!reason || !reason.trim()) {
    const error = new Error("A cancellation reason is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  // Session handler for replica set or direct execution for standalone MongoDB / disconnected test env
  const withOptionalTransaction = async (operation) => {
    let session = null;
    let operationExecuted = false;
    try {
      if (mongoose.connection?.readyState === 1) {
        session = await mongoose.startSession();
        let res;
        await session.withTransaction(async () => {
          operationExecuted = true;
          res = await operation(session);
        });
        return res;
      }
      return await operation(null);
    } catch (error) {
      const isUnsupportedTransactionError =
        !operationExecuted &&
        error.message &&
        (error.message.includes("replica set") ||
          error.message.includes("Transaction numbers are only allowed") ||
          error.message.includes("standalone") ||
          error.message.includes("retryable writes") ||
          error.message.includes("retryWrites") ||
          error.code === 20 ||
          error.codeName === "IllegalOperation");

      if (isUnsupportedTransactionError) {
        return await operation(null);
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  };

  const appointment = await withOptionalTransaction(async (session) => {
    const opts = session ? { session } : {};

    // 1. Fetch appointment to validate existence, permissions, and status
    const existing = await Appointment.findById(appointmentId, null, opts);
    if (!existing) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    if (existing.status === "completed") {
      const error = new Error("Cannot cancel a consultation that has already been marked completed");
      error.statusCode = 400;
      throw error;
    }

    if (existing.status === "cancelled") {
      const error = new Error("This appointment has already been cancelled");
      error.statusCode = 400;
      throw error;
    }

    if (existing.status === "rejected") {
      const error = new Error("Cannot cancel an appointment that has already been rejected");
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = existing.status;
    const previousNotes = existing.notes;

    // 2. Atomic status update to prevent race conditions from duplicate cancellation requests
    const cancellationNote = `[Admin Cancelled]: ${reason.trim()}`;
    const updatedNotes = existing.notes
      ? `${existing.notes}\n${cancellationNote}`
      : cancellationNote;

    const updated = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        status: { $in: ["pending", "confirmed"] }
      },
      {
        $set: {
          status: "cancelled",
          notes: updatedNotes
        }
      },
      { new: true, ...opts }
    ).populate("client", "name email")
     .populate({
       path: "lawyer",
       populate: { path: "user", select: "name email" }
     });

    if (!updated) {
      const recheck = await Appointment.findById(appointmentId, null, opts);
      if (recheck?.status === "cancelled") {
        const error = new Error("This appointment has already been cancelled");
        error.statusCode = 400;
        throw error;
      }
      const error = new Error("Failed to cancel appointment due to concurrent modification");
      error.statusCode = 409;
      throw error;
    }

    // 3. Release the linked availability slot using existing schema conventions
    if (updated.slot) {
      const lawyerId = updated.lawyer?._id || updated.lawyer;

      // Ensure the slot is not currently associated with another active appointment
      const otherActiveAppointment = await Appointment.findOne(
        {
          _id: { $ne: updated._id },
          slot: updated.slot,
          status: { $in: ["pending", "confirmed"] }
        },
        null,
        opts
      );

      if (!otherActiveAppointment) {
        let slotResult;
        try {
          slotResult = await LawyerAvailability.updateOne(
            {
              _id: updated.slot,
              lawyer: lawyerId,
              status: "booked"
            },
            { $set: { status: "available" } },
            opts
          );
        } catch (slotErr) {
          // In standalone mode without transactions, compensate by reverting the appointment status
          if (!session) {
            try {
              await Appointment.updateOne(
                { _id: updated._id, status: "cancelled" },
                { $set: { status: previousStatus, notes: previousNotes } }
              );
            } catch (compErr) {
              console.error("CRITICAL_COMPENSATION_FAILURE: Failed to revert appointment cancellation after slot failure:", compErr.message);
            }
          }
          throw slotErr;
        }

        // Verify that the expected slot was actually matched and updated
        if (slotResult.matchedCount === 0) {
          const existingSlot = await LawyerAvailability.findById(updated.slot, null, opts);
          if (!existingSlot) {
            if (!session) {
              try {
                await Appointment.updateOne(
                  { _id: updated._id, status: "cancelled" },
                  { $set: { status: previousStatus, notes: previousNotes } }
                );
              } catch (compErr) {
                console.error("CRITICAL_COMPENSATION_FAILURE: Failed to revert appointment cancellation after missing slot:", compErr.message);
              }
            }
            const error = new Error("Associated availability slot not found");
            error.statusCode = 404;
            error.code = "SLOT_NOT_FOUND";
            throw error;
          }

          if (existingSlot.status === "booked") {
            if (!session) {
              try {
                await Appointment.updateOne(
                  { _id: updated._id, status: "cancelled" },
                  { $set: { status: previousStatus, notes: previousNotes } }
                );
              } catch (compErr) {
                console.error("CRITICAL_COMPENSATION_FAILURE: Failed to revert appointment cancellation after locked slot:", compErr.message);
              }
            }
            const error = new Error("Failed to release availability slot: slot could not be updated to available");
            error.statusCode = 409;
            error.code = "SLOT_RELEASE_FAILED";
            throw error;
          }
          // If existingSlot.status is already 'available', slot is already in desired state
        }
      }
    }

    return updated;
  });

  // 4. Notify both parties
  try {
    const lawyerUser = appointment.lawyer?.user;
    const lawyerUserId = lawyerUser?._id || lawyerUser;

    const notifications = [];
    if (appointment.client?._id) {
      notifications.push({
        recipient: appointment.client._id,
        title: "Appointment Cancelled by Administration",
        message: `Your appointment scheduled for ${appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleDateString() : "your chosen date"} was cancelled. Reason: ${reason.trim()}`,
        type: "appointment",
        link: "/my-appointments",
        relatedId: appointment._id
      });
    }

    if (lawyerUserId) {
      notifications.push({
        recipient: lawyerUserId,
        title: "Appointment Cancelled by Administration",
        message: `Consultation with ${appointment.client?.name || "Client"} was cancelled by administrator. Reason: ${reason.trim()}`,
        type: "appointment",
        link: "/lawyer-dashboard",
        relatedId: appointment._id
      });
    }

    if (notifications.length > 0) {
      await Notification.create(notifications);
    }
  } catch (nErr) {
    console.error("Cancellation notification error:", nErr.message);
  }

  // 5. Audit log
  await logAdminAction({
    adminId,
    action: "APPOINTMENT_CANCEL",
    targetType: "Appointment",
    targetId: appointment._id,
    description: `Cancelled appointment between client ${appointment.client?.name || "Client"} and advocate ${appointment.lawyer?.user?.name || "Advocate"}. Reason: ${reason.trim()}`,
    details: { reason: reason.trim() },
    req
  });

  return {
    appointmentId: appointment._id,
    status: appointment.status,
    message: "Appointment cancelled successfully"
  };
};

// =========================================================================
// 8. REVIEWS & RATINGS MANAGEMENT
// =========================================================================
const getAdminReviewsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.rating) {
    filter.rating = Number(query.rating);
  }

  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      filter.reviewText = regex;
    }
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("client", "name email profileImage")
      .populate({
        path: "lawyer",
        select: "user specialization",
        populate: { path: "user", select: "name email profileImage" }
      })
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const moderateAdminReviewService = async (adminId, reviewId, { status, moderationReason }, req) => {
  if (!["approved", "hidden", "flagged"].includes(status)) {
    const error = new Error("Status must be approved, hidden, or flagged");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = review.status;
  review.status = status;
  review.moderationReason = moderationReason ? moderationReason.trim() : "";
  review.moderatedBy = adminId;
  review.moderatedAt = new Date();
  await review.save();

  // Recalculate lawyer's rating based on approved reviews only
  try {
    const approvedReviews = await Review.find({ lawyer: review.lawyer, status: "approved" }).select("rating").lean();
    const count = approvedReviews.length;
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    await Lawyer.findByIdAndUpdate(review.lawyer, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: count
    });
  } catch (rErr) {
    console.error("Failed to recalculate lawyer rating:", rErr.message);
  }

  // Audit log
  await logAdminAction({
    adminId,
    action: "REVIEW_MODERATE",
    targetType: "Review",
    targetId: review._id,
    description: `Moderated review status from '${oldStatus}' to '${status}'. Reason: ${moderationReason || "None specified"}`,
    details: { oldStatus, newStatus: status, moderationReason },
    req
  });

  return {
    reviewId: review._id,
    status: review.status,
    moderationReason: review.moderationReason,
    message: `Review moderation status updated to '${status}'`
  };
};

// =========================================================================
// 9. PAYMENTS & TRANSACTIONS
// =========================================================================
const getAdminPaymentsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      filter.$or = [
        { razorpayPaymentId: { $regex: term, $options: "i" } },
        { razorpayOrderId: { $regex: term, $options: "i" } },
        { refundId: { $regex: term, $options: "i" } }
      ];
    }
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("client", "name email phone")
      .populate({
        path: "appointment",
        select: "scheduledAt consultationType status lawyer",
        populate: {
          path: "lawyer",
          select: "user city specialization",
          populate: { path: "user", select: "name email" }
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter)
  ]);

  // Aggregate totals
  const [capturedAgg, refundedAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Payment.aggregate([
      { $match: { status: "refunded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  const grossRupees = Math.round((capturedAgg[0]?.total || 0) / 100);
  const refundRupees = Math.round((refundedAgg[0]?.total || 0) / 100);
  const netRupees = Math.max(0, grossRupees - refundRupees);

  return {
    payments: payments.map((p) => ({
      ...p,
      amountRupees: Math.round(p.amount / 100)
    })),
    summary: {
      grossRupees,
      refundRupees,
      netRupees
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAdminPaymentDetailService = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate("client", "name email phone")
    .populate({
      path: "appointment",
      select: "scheduledAt consultationType status notes lawyer",
      populate: {
        path: "lawyer",
        select: "user city specialization consultationFee",
        populate: { path: "user", select: "name email phone" }
      }
    })
    .lean();

  if (!payment) {
    const error = new Error("Payment transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...payment,
    amountRupees: Math.round(payment.amount / 100)
  };
};

const processRefundService = async (adminId, paymentId, { reason }, req) => {
  if (!mongoose.isValidObjectId(paymentId)) {
    const error = new Error("Invalid payment record ID");
    error.statusCode = 400;
    throw error;
  }

  // 1. Atomic claim: Claim payment by moving status from 'captured'/'authorized' to 'refund_pending'
  const payment = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: { $in: ["captured", "authorized"] }
    },
    {
      $set: {
        status: "refund_pending",
        failureReason: reason ? `Refund initiated: ${reason}` : "Refund initiated by Administrator"
      }
    },
    { new: true }
  ).populate("appointment client");

  if (!payment) {
    const existing = await Payment.findById(paymentId);
    if (!existing) {
      const error = new Error("Payment transaction not found");
      error.statusCode = 404;
      throw error;
    }

    if (existing.status === "refunded") {
      const error = new Error("This transaction has already been refunded. Duplicate refunds are strictly prohibited.");
      error.statusCode = 409;
      throw error;
    }

    if (existing.status === "refund_pending") {
      const error = new Error("A refund for this transaction is currently in progress or awaiting reconciliation. Duplicate refund requests are prohibited.");
      error.statusCode = 409;
      throw error;
    }

    const error = new Error(`Cannot refund transaction with current status '${existing.status}'. Only captured payments can be refunded.`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate gateway payment ID
  if (!payment.razorpayPaymentId) {
    await Payment.updateOne(
      { _id: payment._id, status: "refund_pending" },
      { $set: { status: "captured", failureReason: "Missing gateway payment ID" } }
    );
    const error = new Error("Payment transaction does not have an associated gateway payment ID");
    error.statusCode = 400;
    error.code = "PAYMENT_GATEWAY_ID_MISSING";
    throw error;
  }

  // 3. Invoke Razorpay gateway
  let refund;
  try {
    refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount,
      notes: {
        reason: reason || "Administrative authorized refund",
        refundedBy: adminId.toString(),
        paymentId: payment._id.toString()
      }
    });
  } catch (err) {
    // Missing credentials (never reached gateway)
    if (err.code === "PAYMENT_GATEWAY_UNAVAILABLE" || err.statusCode === 503) {
      await Payment.updateOne(
        { _id: payment._id, status: "refund_pending" },
        { $set: { status: "captured", failureReason: "Gateway credentials unavailable" } }
      );
      throw err;
    }

    // Uncertain outcome: Network timeout or connection drop
    const isTimeout =
      err.code === "ETIMEDOUT" ||
      err.code === "ESOCKETTIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "ECONNABORTED" ||
      /timeout|timed out|socket hang up|network/i.test(err.message || "");

    if (isTimeout) {
      await Payment.updateOne(
        { _id: payment._id, status: "refund_pending" },
        {
          $set: {
            failureReason: `Refund pending reconciliation: Gateway network timeout (${err.message})`
          }
        }
      );
      const timeoutError = new Error(
        "Razorpay refund request timed out with uncertain gateway outcome. Transaction is held in refund_pending for webhook reconciliation."
      );
      timeoutError.statusCode = 502;
      timeoutError.code = "GATEWAY_TIMEOUT_RECONCILIATION_REQUIRED";
      throw timeoutError;
    }

    // Definitive failure: Gateway rejected the refund request
    await Payment.updateOne(
      { _id: payment._id, status: "refund_pending" },
      {
        $set: {
          status: "captured",
          failureReason: `Refund rejected: ${err.error?.description || err.message}`
        }
      }
    );

    const gatewayError = new Error(
      `Razorpay refund failed: ${err.error?.description || err.message || "Gateway processing error"}`
    );
    gatewayError.statusCode = 502;
    gatewayError.code = "PAYMENT_GATEWAY_ERROR";
    throw gatewayError;
  }

  // 4. Validate Gateway Response
  if (!refund || !refund.id) {
    const error = new Error("Razorpay refund response did not contain a valid refund ID");
    error.statusCode = 502;
    error.code = "INVALID_GATEWAY_RESPONSE";
    throw error;
  }

  // 5. Inspect refund status and map lifecycle state correctly
  const isProcessed = refund.status === "processed";
  const targetStatus = isProcessed ? "refunded" : "refund_pending";

  // 6. Persist status and real refund ID to database with fallback reconciliation
  let dbSaveSuccess = true;
  try {
    payment.status = targetStatus;
    payment.refundId = refund.id;
    payment.failureReason = reason ? `Refund: ${reason}` : (isProcessed ? "Refunded by Administrator" : "Refund initiated and pending settlement");
    await payment.save();
  } catch (dbErr) {
    dbSaveSuccess = false;
    payment.status = "refund_pending"; // Retain refund_pending in memory to match persisted state
    console.error(
      `[RECONCILIATION_REQUIRED] Database write failed after Razorpay refund confirmed. ` +
      `Payment ID: ${payment._id}, Razorpay Payment ID: ${payment.razorpayPaymentId}, ` +
      `Refund ID: ${refund.id}, Status: ${targetStatus}, Error: ${dbErr.message}`
    );

    // Direct update fallback
    try {
      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: targetStatus,
            refundId: refund.id,
            failureReason: reason ? `Refund: ${reason}` : (isProcessed ? "Refunded by Administrator" : "Refund initiated and pending settlement")
          }
        }
      );
      dbSaveSuccess = true;
    } catch (fallbackErr) {
      console.error(
        `[RECONCILIATION_FALLBACK_FAILED] Direct update fallback also failed. ` +
        `State will be recovered via webhook. Payment ID: ${payment._id}, Refund ID: ${refund.id}, Error: ${fallbackErr.message}`
      );
    }
  }

  if (!dbSaveSuccess) {
    const dbError = new Error("Refund confirmed by payment gateway, but database persistence failed. Transaction is preserved in refund_pending for webhook reconciliation.");
    dbError.statusCode = 500;
    dbError.code = "DATABASE_RECONCILIATION_DEFERRED";
    dbError.refundId = refund.id;
    throw dbError;
  }

  // 7. Client Notification
  try {
    if (payment.client?._id) {
      const notifTitle = isProcessed ? "Refund Issued" : "Refund Initiated";
      const notifMessage = isProcessed
        ? `Your consultation fee of ₹${Math.round(payment.amount / 100)} has been refunded. Reference: ${refund.id}`
        : `Your consultation fee refund of ₹${Math.round(payment.amount / 100)} has been initiated and is pending bank processing. Reference: ${refund.id}`;

      await Notification.create({
        recipient: payment.client._id,
        title: notifTitle,
        message: notifMessage,
        type: "payment",
        link: "/my-appointments",
        relatedId: payment._id
      });
    }
  } catch (nErr) {
    console.error("Refund notification error:", nErr.message);
  }

  // 8. Audit log
  await logAdminAction({
    adminId,
    action: "PAYMENT_REFUND",
    targetType: "Payment",
    targetId: payment._id,
    description: `Issued refund of ₹${Math.round(payment.amount / 100)} for payment ${payment.razorpayPaymentId || payment._id}. Status: ${targetStatus}. Reference: ${refund.id}. Reason: ${reason || "Dispute resolution"}`,
    details: { refundId: refund.id, amountRupees: Math.round(payment.amount / 100), status: targetStatus, reason },
    req
  });

  return {
    paymentId: payment._id,
    refundId: refund.id,
    amountRupees: Math.round(payment.amount / 100),
    status: targetStatus,
    message: isProcessed ? "Refund processed successfully" : "Refund initiated and pending settlement"
  };
};

// =========================================================================
// 10. COMPLAINTS & SUPPORT
// =========================================================================
const getAdminComplaintsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.priority && query.priority !== "all") {
    filter.priority = query.priority;
  }
  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      filter.$or = [
        { complaintId: regex },
        { subject: regex },
        { description: regex }
      ];
    }
  }

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate("submittedBy", "name email phone role profileImage")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter)
  ]);

  return {
    complaints,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAdminComplaintDetailService = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId)
    .populate("submittedBy", "name email phone role profileImage")
    .populate("resolvedBy", "name email")
    .populate("history.updatedBy", "name email")
    .populate({
      path: "relatedAppointment",
      select: "scheduledAt consultationType status lawyer client",
      populate: [
        { path: "client", select: "name email" },
        { path: "lawyer", select: "user", populate: { path: "user", select: "name email" } }
      ]
    })
    .lean();

  if (!complaint) {
    const error = new Error("Complaint record not found");
    error.statusCode = 404;
    throw error;
  }

  return complaint;
};

const updateAdminComplaintService = async (adminId, complaintId, { status, priority, adminResponse, note }, req) => {
  const complaint = await Complaint.findById(complaintId).populate("submittedBy", "name email");
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = complaint.status;
  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (adminResponse !== undefined) complaint.adminResponse = adminResponse.trim();

  if (["resolved", "closed"].includes(status)) {
    complaint.resolvedBy = adminId;
    complaint.resolvedAt = new Date();
  }

  if (!Array.isArray(complaint.history)) complaint.history = [];
  complaint.history.push({
    status: complaint.status,
    note: note || adminResponse || `Status changed from ${oldStatus} to ${complaint.status}`,
    updatedBy: adminId,
    updatedAt: new Date()
  });

  await complaint.save();

  // Notify user if admin provided a response or resolved
  try {
    if (adminResponse || status === "resolved") {
      await Notification.create({
        recipient: complaint.submittedBy._id,
        title: `Support Ticket Updated: ${complaint.complaintId}`,
        message: adminResponse || `Your ticket has been marked as '${complaint.status}'.`,
        type: "system",
        link: "/dashboard",
        relatedId: complaint._id
      });
    }
  } catch (nErr) {
    console.error("Complaint notification error:", nErr.message);
  }

  // Audit log
  await logAdminAction({
    adminId,
    action: "COMPLAINT_STATUS_CHANGE",
    targetType: "Complaint",
    targetId: complaint._id,
    description: `Updated complaint ${complaint.complaintId} status to '${complaint.status}' (priority: ${complaint.priority})`,
    details: { oldStatus, newStatus: complaint.status, priority: complaint.priority, adminResponse },
    req
  });

  return {
    complaintId: complaint._id,
    status: complaint.status,
    priority: complaint.priority,
    adminResponse: complaint.adminResponse,
    message: "Complaint updated successfully"
  };
};

const createComplaintService = async (userId, userRole, data) => {
  if (!data.subject || !data.description) {
    const error = new Error("Subject and description are required");
    error.statusCode = 400;
    throw error;
  }

  const stamp = Date.now().toString().slice(-6);
  const complaintId = `CMP-${stamp}`;

  const complaint = new Complaint({
    complaintId,
    submittedBy: userId,
    role: userRole,
    subject: data.subject.trim(),
    description: data.description.trim(),
    category: data.category || "consultation",
    relatedAppointment: data.relatedAppointment || null,
    priority: data.priority || "medium",
    status: "open",
    history: [
      {
        status: "open",
        note: "Complaint submitted",
        updatedBy: userId,
        updatedAt: new Date()
      }
    ]
  });

  await complaint.save();
  return complaint;
};

// =========================================================================
// 11. NOTIFICATIONS MANAGEMENT
// =========================================================================
const getAdminNotificationsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const [notifications, total, broadcastLogs] = await Promise.all([
    Notification.find({ type: "system" })
      .populate("recipient", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ type: "system" }),
    AdminLog.find({ action: "BROADCAST_NOTIFICATION" }).sort({ createdAt: -1 }).limit(10).lean()
  ]);

  return {
    notifications,
    broadcastLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const broadcastNotificationService = async (adminId, { recipientRole, title, message, type = "system", link = "" }, req) => {
  if (!title || !message) {
    const error = new Error("Both title and message are required for announcements");
    error.statusCode = 400;
    throw error;
  }

  let userFilter = { isActive: true };
  if (recipientRole === "client") userFilter.role = "client";
  else if (recipientRole === "lawyer") userFilter.role = "lawyer";

  const targetUsers = await User.find(userFilter).select("_id").lean();

  if (targetUsers.length === 0) {
    const error = new Error("No active users found matching target criteria");
    error.statusCode = 404;
    throw error;
  }

  const notificationDocs = targetUsers.map((u) => ({
    recipient: u._id,
    title: title.trim(),
    message: message.trim(),
    type: type || "system",
    link: link || "/dashboard"
  }));

  // Bulk insert for high performance
  await Notification.insertMany(notificationDocs, { ordered: false });

  // Audit log
  await logAdminAction({
    adminId,
    action: "BROADCAST_NOTIFICATION",
    targetType: "Notification",
    targetId: "",
    description: `Broadcasted announcement "${title}" to ${targetUsers.length} users (${recipientRole || "all"})`,
    details: { recipientRole, title, recipientCount: targetUsers.length },
    req
  });

  return {
    recipientsCount: targetUsers.length,
    message: `Announcement broadcasted to ${targetUsers.length} users successfully`
  };
};

// =========================================================================
// 12. REPORTS & ANALYTICS
// =========================================================================
const getAdminReportsDataService = async (reportType, query = {}) => {
  const { start, end } = getDateRangeFilter(query.range, query.startDate, query.endDate);

  switch (reportType) {
    case "users": {
      const records = await User.find({ createdAt: { $gte: start, $lte: end } })
        .select("name email phone role isActive createdAt")
        .sort({ createdAt: -1 })
        .lean();
      return records.map((u) => ({
        Name: u.name,
        Email: u.email,
        Phone: u.phone || "N/A",
        Role: u.role,
        Status: u.isActive ? "Active" : "Blocked",
        "Joined Date": new Date(u.createdAt).toISOString().split("T")[0]
      }));
    }

    case "lawyers": {
      const records = await Lawyer.find({ createdAt: { $gte: start, $lte: end } })
        .populate("user", "name email phone isActive")
        .sort({ createdAt: -1 })
        .lean();
      return records.map((l) => ({
        Name: l.user?.name || "N/A",
        Email: l.user?.email || "N/A",
        "Bar Council ID": l.barCouncilId,
        City: l.city,
        State: l.state || "N/A",
        Experience: `${l.experienceYears || 0} Years`,
        "Consultation Fee": `₹${l.consultationFee || 0}`,
        "Verification Status": l.verificationStatus,
        "Account Status": l.user?.isActive ? "Active" : "Blocked",
        "Total Reviews": l.totalReviews || 0,
        "Avg Rating": l.averageRating || 5
      }));
    }

    case "appointments": {
      const records = await Appointment.find({ createdAt: { $gte: start, $lte: end } })
        .populate("client", "name email")
        .populate({ path: "lawyer", populate: { path: "user", select: "name email" } })
        .sort({ scheduledAt: -1 })
        .lean();
      return records.map((a) => ({
        "Appointment ID": a._id.toString(),
        Client: a.client?.name || "N/A",
        "Client Email": a.client?.email || "N/A",
        Lawyer: a.lawyer?.user?.name || "N/A",
        "Scheduled At": a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : "Flexible",
        Type: a.consultationType,
        Status: a.status
      }));
    }

    case "payments": {
      const records = await Payment.find({ createdAt: { $gte: start, $lte: end } })
        .populate("client", "name email")
        .sort({ createdAt: -1 })
        .lean();
      return records.map((p) => ({
        "Payment ID": p._id.toString(),
        "Razorpay Payment ID": p.razorpayPaymentId || "N/A",
        Client: p.client?.name || "N/A",
        "Amount (INR)": Math.round(p.amount / 100),
        Status: p.status,
        "Refund ID": p.refundId || "N/A",
        Date: new Date(p.createdAt).toISOString().split("T")[0]
      }));
    }

    case "reviews": {
      const records = await Review.find({ createdAt: { $gte: start, $lte: end } })
        .populate("client", "name email")
        .populate({ path: "lawyer", populate: { path: "user", select: "name" } })
        .sort({ createdAt: -1 })
        .lean();
      return records.map((r) => ({
        Client: r.client?.name || "N/A",
        Lawyer: r.lawyer?.user?.name || "N/A",
        Rating: r.rating,
        Review: r.reviewText,
        Status: r.status,
        Date: new Date(r.createdAt).toISOString().split("T")[0]
      }));
    }

    default:
      return [];
  }
};

// =========================================================================
// 13. ADMIN ACTIVITY LOGS
// =========================================================================
const getAdminActivityLogsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.action && query.action !== "all") {
    filter.action = query.action;
  }
  if (query.targetType && query.targetType !== "all") {
    filter.targetType = query.targetType;
  }
  if (query.search && query.search.trim()) {
    const term = escapeRegex(query.search.trim());
    if (term) {
      const regex = { $regex: term, $options: "i" };
      filter.$or = [
        { adminName: regex },
        { adminEmail: regex },
        { description: regex }
      ];
    }
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [logs, total] = await Promise.all([
    AdminLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdminLog.countDocuments(filter)
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// =========================================================================
// 14. ADMIN SETTINGS
// =========================================================================
const getAdminSettingsService = async (adminId) => {
  const admin = await User.findById(adminId).select("name email phone role createdAt").lean();
  let settings = await PlatformSetting.findOne({ key: "global_config" }).lean();

  if (!settings) {
    settings = await PlatformSetting.create({ key: "global_config" });
  }

  return {
    admin,
    settings
  };
};

const updateAdminProfileService = async (adminId, { name, phone }, req) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    const error = new Error("Administrator profile not found");
    error.statusCode = 404;
    throw error;
  }

  if (name && name.trim()) admin.name = name.trim();
  if (phone && phone.trim()) admin.phone = phone.trim();
  await admin.save();

  await logAdminAction({
    adminId,
    action: "PROFILE_UPDATE",
    targetType: "Settings",
    targetId: adminId,
    description: `Updated administrator profile details (${admin.email})`,
    req
  });

  return {
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone
    },
    message: "Admin profile updated successfully"
  };
};

const changeAdminPasswordService = async (adminId, { currentPassword, newPassword }, req) => {
  if (!currentPassword || !newPassword) {
    const error = new Error("Both current password and new password are required");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error("New password must be at least 8 characters long");
    error.statusCode = 400;
    throw error;
  }

  const admin = await User.findById(adminId).select("+password");
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  admin.password = newPassword; // Will be hashed via pre-save hook
  await admin.save();

  await logAdminAction({
    adminId,
    action: "PASSWORD_CHANGE",
    targetType: "Settings",
    targetId: adminId,
    description: `Administrator changed their account password`,
    req
  });

  return {
    message: "Password changed successfully"
  };
};

const updatePlatformSettingsService = async (adminId, settingsData, req) => {
  let settings = await PlatformSetting.findOne({ key: "global_config" });
  if (!settings) {
    settings = new PlatformSetting({ key: "global_config" });
  }

  if (settingsData.platformFeePercent !== undefined) {
    settings.platformFeePercent = Math.min(50, Math.max(0, Number(settingsData.platformFeePercent)));
  }
  if (settingsData.maintenanceMode !== undefined) {
    settings.maintenanceMode = Boolean(settingsData.maintenanceMode);
  }
  if (settingsData.maintenanceMessage !== undefined) {
    settings.maintenanceMessage = settingsData.maintenanceMessage.trim();
  }
  if (settingsData.emailNotificationsEnabled !== undefined) {
    settings.emailNotificationsEnabled = Boolean(settingsData.emailNotificationsEnabled);
  }
  if (settingsData.autoApproveReviews !== undefined) {
    settings.autoApproveReviews = Boolean(settingsData.autoApproveReviews);
  }
  if (settingsData.supportEmail !== undefined) {
    settings.supportEmail = settingsData.supportEmail.trim();
  }
  if (settingsData.supportPhone !== undefined) {
    settings.supportPhone = settingsData.supportPhone.trim();
  }
  settings.updatedBy = adminId;
  await settings.save();

  await logAdminAction({
    adminId,
    action: "SETTINGS_UPDATE",
    targetType: "Settings",
    targetId: settings._id,
    description: `Updated platform configuration settings (fee: ${settings.platformFeePercent}%, maintenance: ${settings.maintenanceMode})`,
    details: settingsData,
    req
  });

  return {
    settings,
    message: "Platform settings saved successfully"
  };
};

// =========================================================================
// EXPORTS
// =========================================================================
module.exports = {
  getAdminMetricsService,
  getAdminAnalyticsService,
  getAdminRecentActivityService,
  getAdminClientsService,
  getAdminClientDetailService,
  toggleClientBlockService,
  getAdminLawyersService,
  getAdminLawyerDetailService,
  toggleLawyerBlockService,
  getAdminVerificationsService,
  updateLawyerVerificationService,
  getAdminAppointmentsService,
  getAdminAppointmentDetailService,
  cancelAdminAppointmentService,
  getAdminReviewsService,
  moderateAdminReviewService,
  getAdminPaymentsService,
  getAdminPaymentDetailService,
  processRefundService,
  getAdminComplaintsService,
  getAdminComplaintDetailService,
  updateAdminComplaintService,
  createComplaintService,
  getAdminNotificationsService,
  broadcastNotificationService,
  getAdminReportsDataService,
  getAdminActivityLogsService,
  getAdminSettingsService,
  updateAdminProfileService,
  changeAdminPasswordService,
  updatePlatformSettingsService
};
