const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const getNotificationsService = async (userId, query = {}) => {
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return {
    notifications,
    unreadCount
  };
};

const markNotificationReadService = async (userId, notificationId) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    const error = new Error("Invalid notification ID");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAllNotificationsReadService = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { message: "All notifications marked as read" };
};

module.exports = {
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService
};
