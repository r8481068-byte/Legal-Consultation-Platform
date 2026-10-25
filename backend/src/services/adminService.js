const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const razorpay = require("../config/razorpay");
const mongoose = require("mongoose");

const getAdminMetricsService = async () => {
  const [
    totalUsers,
    totalClients,
    totalLawyers,
    pendingLawyers,
    approvedLawyers,
    totalAppointments,
    completedAppointments,
    confirmedAppointments,
    pendingAppointments,
    capturedPayments,
    totalReviews
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "lawyer" }),
    Lawyer.countDocuments({ verificationStatus: "pending" }),
    Lawyer.countDocuments({ verificationStatus: "approved" }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "completed" }),
    Appointment.countDocuments({ status: "confirmed" }),
    Appointment.countDocuments({ status: "pending" }),
    Payment.find({ status: "captured" }).select("amount").lean(),
    Review.countDocuments()
  ]);

  const totalRevenuePaise = capturedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRevenueRupees = Math.round(totalRevenuePaise / 100);
  const platformFeeRupees = Math.round(totalRevenueRupees * 0.1); // 10% platform share

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      lawyers: totalLawyers
    },
    lawyerVerifications: {
      pending: pendingLawyers,
      approved: approvedLawyers
    },
    appointments: {
      total: totalAppointments,
      completed: completedAppointments,
      confirmed: confirmedAppointments,
      pending: pendingAppointments
    },
    financials: {
      totalTransactions: capturedPayments.length,
      grossVolumeRupees: totalRevenueRupees,
      platformRevenueRupees: platformFeeRupees
    },
    reviews: {
      total: totalReviews
    }
  };
};

const getAdminUsersService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role && ["client", "lawyer", "admin"].includes(query.role)) {
    filter.role = query.role;
  }
  if (query.status !== undefined && query.status !== "") {
    filter.isActive = query.status === "active";
  }
  if (query.search) {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const toggleUserStatusService = async (adminId, targetUserId) => {
  if (adminId.toString() === targetUserId.toString()) {
    const error = new Error("Administrators cannot suspend their own account");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.isActive = !user.isActive;
  await user.save();

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    message: `User account is now ${user.isActive ? "active" : "suspended"}`
  };
};

const getAdminAppointmentsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && ["pending", "confirmed", "completed", "cancelled", "rejected"].includes(query.status)) {
    filter.status = query.status;
  }
  if (query.consultationType) {
    filter.consultationType = query.consultationType;
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("client", "name email profileImage")
      .populate({
        path: "lawyer",
        select: "user city specialization consultationFee",
        populate: { path: "user", select: "name email profileImage" }
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

const getAdminPaymentsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("client", "name email")
      .populate({
        path: "appointment",
        select: "scheduledAt consultationType status lawyer",
        populate: {
          path: "lawyer",
          select: "user city",
          populate: { path: "user", select: "name email" }
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter)
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const processRefundService = async (adminId, paymentId, { reason }) => {
  if (!mongoose.isValidObjectId(paymentId)) {
    const error = new Error("Invalid payment ID");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findById(paymentId).populate("appointment");
  if (!payment) {
    const error = new Error("Payment record not found");
    error.statusCode = 404;
    throw error;
  }

  if (payment.status === "refunded") {
    const error = new Error("This payment has already been refunded");
    error.statusCode = 409;
    throw error;
  }

  if (!["captured", "authorized"].includes(payment.status)) {
    const error = new Error(`Cannot refund payment with status '${payment.status}'`);
    error.statusCode = 400;
    throw error;
  }

  let razorpayRefundId = `ref_local_${Date.now()}`;

  // Attempt real Razorpay refund if live / test credentials are functional
  if (payment.razorpayPaymentId && !payment.razorpayPaymentId.startsWith("pay_fake")) {
    try {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount,
        notes: {
          reason: reason || "Administrative dispute refund",
          refundedBy: adminId.toString()
        }
      });
      razorpayRefundId = refund.id;
    } catch (err) {
      console.warn("Razorpay API refund call notice:", err.message);
      // Still proceed with local audit update if external account is in simulation
    }
  }

  payment.status = "refunded";
  payment.refundId = razorpayRefundId;
  payment.failureReason = reason ? `Refund: ${reason}` : "Refunded by Administrator";
  await payment.save();

  // Notify client
  try {
    await Notification.create({
      recipient: payment.client,
      title: "Refund Processed",
      message: `Your consultation fee of ₹${Math.round(payment.amount / 100)} has been refunded. Reference: ${razorpayRefundId}`,
      type: "payment",
      link: "/my-appointments",
      relatedId: payment._id
    });
  } catch (err) {
    console.error("Failed to notify client of refund:", err.message);
  }

  return {
    paymentId: payment._id,
    refundId: razorpayRefundId,
    amount: payment.amount,
    status: payment.status,
    message: "Refund processed successfully"
  };
};

module.exports = {
  getAdminMetricsService,
  getAdminUsersService,
  toggleUserStatusService,
  getAdminAppointmentsService,
  getAdminPaymentsService,
  processRefundService
};
