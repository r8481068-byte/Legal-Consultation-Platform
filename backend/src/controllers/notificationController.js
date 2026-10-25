const {
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService
} = require("../services/notificationService");

const getNotifications = async (req, res, next) => {
  try {
    const result = await getNotificationsService(req.user.userId, req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markNotificationReadService(
      req.user.userId,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsReadService(req.user.userId);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
