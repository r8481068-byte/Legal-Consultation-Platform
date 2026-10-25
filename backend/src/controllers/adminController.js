const {
  getAdminMetricsService,
  getAdminUsersService,
  toggleUserStatusService,
  getAdminAppointmentsService,
  getAdminPaymentsService,
  processRefundService
} = require("../services/adminService");

const getAdminMetrics = async (req, res, next) => {
  try {
    const metrics = await getAdminMetricsService();
    return res.status(200).json({
      success: true,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const result = await getAdminUsersService(req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const result = await toggleUserStatusService(
      req.user.userId,
      req.params.userId
    );
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAppointments = async (req, res, next) => {
  try {
    const result = await getAdminAppointmentsService(req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getAdminPayments = async (req, res, next) => {
  try {
    const result = await getAdminPaymentsService(req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const processRefund = async (req, res, next) => {
  try {
    const result = await processRefundService(
      req.user.userId,
      req.params.paymentId,
      req.body
    );
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  toggleUserStatus,
  getAdminAppointments,
  getAdminPayments,
  processRefund
};
