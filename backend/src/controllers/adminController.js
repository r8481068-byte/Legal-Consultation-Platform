const {
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
} = require("../services/adminService");

// 1. Dashboard Metrics & Analytics
const getAdminMetrics = async (req, res, next) => {
  try {
    const metrics = await getAdminMetricsService(req.query);
    return res.status(200).json({ success: true, metrics });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const analytics = await getAdminAnalyticsService(req.query);
    return res.status(200).json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};

const getAdminRecentActivity = async (req, res, next) => {
  try {
    const activity = await getAdminRecentActivityService();
    return res.status(200).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

// 2. Client Management
const getAdminClients = async (req, res, next) => {
  try {
    const result = await getAdminClientsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAdminClientDetail = async (req, res, next) => {
  try {
    const result = await getAdminClientDetailService(req.params.clientId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const toggleClientBlock = async (req, res, next) => {
  try {
    const result = await toggleClientBlockService(
      req.user.userId,
      req.params.clientId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 3. Lawyer Management
const getAdminLawyers = async (req, res, next) => {
  try {
    const result = await getAdminLawyersService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAdminLawyerDetail = async (req, res, next) => {
  try {
    const result = await getAdminLawyerDetailService(req.params.lawyerId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const toggleLawyerBlock = async (req, res, next) => {
  try {
    const result = await toggleLawyerBlockService(
      req.user.userId,
      req.params.lawyerId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 4. Lawyer Verification
const getAdminVerifications = async (req, res, next) => {
  try {
    const result = await getAdminVerificationsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateLawyerVerification = async (req, res, next) => {
  try {
    const result = await updateLawyerVerificationService(
      req.user.userId,
      req.params.lawyerId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 5. Appointments
const getAdminAppointments = async (req, res, next) => {
  try {
    const result = await getAdminAppointmentsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAdminAppointmentDetail = async (req, res, next) => {
  try {
    const result = await getAdminAppointmentDetailService(req.params.appointmentId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const cancelAdminAppointment = async (req, res, next) => {
  try {
    const result = await cancelAdminAppointmentService(
      req.user.userId,
      req.params.appointmentId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 6. Reviews
const getAdminReviews = async (req, res, next) => {
  try {
    const result = await getAdminReviewsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const moderateAdminReview = async (req, res, next) => {
  try {
    const result = await moderateAdminReviewService(
      req.user.userId,
      req.params.reviewId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 7. Payments & Refunds
const getAdminPayments = async (req, res, next) => {
  try {
    const result = await getAdminPaymentsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAdminPaymentDetail = async (req, res, next) => {
  try {
    const result = await getAdminPaymentDetailService(req.params.paymentId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const processRefund = async (req, res, next) => {
  try {
    const result = await processRefundService(
      req.user.userId,
      req.params.paymentId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 8. Complaints
const getAdminComplaints = async (req, res, next) => {
  try {
    const result = await getAdminComplaintsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAdminComplaintDetail = async (req, res, next) => {
  try {
    const result = await getAdminComplaintDetailService(req.params.complaintId);
    return res.status(200).json({ success: true, complaint: result });
  } catch (error) {
    next(error);
  }
};

const updateAdminComplaint = async (req, res, next) => {
  try {
    const result = await updateAdminComplaintService(
      req.user.userId,
      req.params.complaintId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const result = await createComplaintService(
      req.user.userId,
      req.user.role,
      req.body
    );
    return res.status(201).json({ success: true, complaint: result });
  } catch (error) {
    next(error);
  }
};

// 9. Notifications
const getAdminNotifications = async (req, res, next) => {
  try {
    const result = await getAdminNotificationsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const broadcastNotification = async (req, res, next) => {
  try {
    const result = await broadcastNotificationService(
      req.user.userId,
      req.body,
      req
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 10. Reports
const getAdminReports = async (req, res, next) => {
  try {
    const data = await getAdminReportsDataService(req.query.type, req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 11. Activity Logs
const getAdminActivityLogs = async (req, res, next) => {
  try {
    const result = await getAdminActivityLogsService(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// 12. Settings
const getAdminSettings = async (req, res, next) => {
  try {
    const result = await getAdminSettingsService(req.user.userId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateAdminProfile = async (req, res, next) => {
  try {
    const result = await updateAdminProfileService(req.user.userId, req.body, req);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const changeAdminPassword = async (req, res, next) => {
  try {
    const result = await changeAdminPasswordService(req.user.userId, req.body, req);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updatePlatformSettings = async (req, res, next) => {
  try {
    const result = await updatePlatformSettingsService(req.user.userId, req.body, req);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// Backward-compatible alias for older tests/callers
const getAdminUsers = getAdminClients;
const toggleUserStatus = toggleClientBlock;

module.exports = {
  getAdminMetrics,
  getAdminAnalytics,
  getAdminRecentActivity,
  getAdminClients,
  getAdminClientDetail,
  toggleClientBlock,
  getAdminLawyers,
  getAdminLawyerDetail,
  toggleLawyerBlock,
  getAdminVerifications,
  updateLawyerVerification,
  getAdminAppointments,
  getAdminAppointmentDetail,
  cancelAdminAppointment,
  getAdminReviews,
  moderateAdminReview,
  getAdminPayments,
  getAdminPaymentDetail,
  processRefund,
  getAdminComplaints,
  getAdminComplaintDetail,
  updateAdminComplaint,
  createComplaint,
  getAdminNotifications,
  broadcastNotification,
  getAdminReports,
  getAdminActivityLogs,
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  updatePlatformSettings,
  getAdminUsers,
  toggleUserStatus
};
