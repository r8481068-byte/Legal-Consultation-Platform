const Message = require("../models/Message");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const Lawyer = require("../models/Lawyer");
const mongoose = require("mongoose");

/**
 * Verify user's participation in an appointment.
 */
const verifyAppointmentParticipant = async (appointmentId, userId, userRole) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate("client", "name email profileImage")
    .populate({
      path: "lawyer",
      select: "user city specialization consultationFee",
      populate: { path: "user", select: "name profileImage" }
    });

  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (userRole === "admin") {
    return { appointment, isClient: false, isLawyer: false, isAdmin: true };
  }

  const isClient = appointment.client._id.toString() === userId.toString();
  const lawyerUserId = appointment.lawyer?.user?._id?.toString() ||
                       appointment.lawyer?.user?.toString();
  const isLawyer = lawyerUserId === userId.toString();

  if (!isClient && !isLawyer) {
    const error = new Error("You are not authorized to access this conversation");
    error.statusCode = 403;
    throw error;
  }

  return { appointment, isClient, isLawyer, isAdmin: false };
};

const getAppointmentMessagesService = async (userId, userRole, appointmentId) => {
  const { appointment, isClient, isLawyer } = await verifyAppointmentParticipant(
    appointmentId,
    userId,
    userRole
  );

  const messages = await Message.find({ appointment: appointmentId })
    .populate("sender", "name profileImage role")
    .sort({ createdAt: 1 })
    .lean();

  // Mark messages sent to current user as read
  await Message.updateMany(
    {
      appointment: appointmentId,
      receiver: userId,
      isRead: false
    },
    {
      $set: { isRead: true, readAt: new Date() }
    }
  );

  return {
    appointment,
    messages
  };
};

const sendMessageService = async (userId, userRole, appointmentId, data) => {
  const { appointment } = await verifyAppointmentParticipant(
    appointmentId,
    userId,
    userRole
  );

  const { text, messageType = "text", attachment } = data;

  if (messageType === "text" && (!text || !text.trim())) {
    const error = new Error("Message text cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  // Determine recipient
  const isClient = appointment.client._id.toString() === userId.toString();
  const lawyerUserId = appointment.lawyer?.user?._id || appointment.lawyer?.user;
  const receiverId = isClient ? lawyerUserId : appointment.client._id;

  if (!receiverId) {
    const error = new Error("Unable to determine message recipient");
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.create({
    appointment: appointment._id,
    sender: userId,
    receiver: receiverId,
    messageType,
    text: text?.trim() || "",
    attachment: attachment || {}
  });

  const populated = await Message.findById(message._id)
    .populate("sender", "name profileImage role")
    .lean();

  // Send in-app notification to receiver
  try {
    const senderName = populated.sender?.name || (isClient ? "Client" : "Lawyer");
    await Notification.create({
      recipient: receiverId,
      title: `New message from ${senderName}`,
      message: messageType === "document"
        ? `Shared a document: ${attachment?.title || "File"}`
        : (text.length > 60 ? `${text.substring(0, 60)}...` : text),
      type: "chat",
      link: isClient ? "/lawyer-dashboard" : "/my-appointments",
      relatedId: appointment._id
    });
  } catch (err) {
    console.error("Failed to create chat notification:", err.message);
  }

  return populated;
};

const getUserConversationsService = async (userId, userRole) => {
  let appointmentFilter;

  if (userRole === "client") {
    appointmentFilter = { client: userId };
  } else if (userRole === "lawyer") {
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return [];
    appointmentFilter = { lawyer: lawyer._id };
  } else {
    appointmentFilter = {};
  }

  const appointments = await Appointment.find(appointmentFilter)
    .populate("client", "name email profileImage")
    .populate({
      path: "lawyer",
      select: "user city specialization consultationFee",
      populate: { path: "user", select: "name profileImage" }
    })
    .sort({ scheduledAt: -1 })
    .lean();

  const conversations = await Promise.all(
    appointments.map(async (appointment) => {
      const [latestMessage, unreadCount] = await Promise.all([
        Message.findOne({ appointment: appointment._id })
          .sort({ createdAt: -1 })
          .lean(),
        Message.countDocuments({
          appointment: appointment._id,
          receiver: userId,
          isRead: false
        })
      ]);

      const isClient = appointment.client?._id?.toString() === userId.toString();
      const partner = isClient
        ? {
            name: appointment.lawyer?.user?.name || "Lawyer",
            profileImage: appointment.lawyer?.user?.profileImage,
            subtitle: appointment.lawyer?.city || "Legal Consultant"
          }
        : {
            name: appointment.client?.name || "Client",
            profileImage: appointment.client?.profileImage,
            subtitle: appointment.client?.email || ""
          };

      return {
        appointmentId: appointment._id,
        appointment,
        partner,
        latestMessage,
        unreadCount
      };
    })
  );

  return conversations;
};

module.exports = {
  verifyAppointmentParticipant,
  getAppointmentMessagesService,
  sendMessageService,
  getUserConversationsService
};
