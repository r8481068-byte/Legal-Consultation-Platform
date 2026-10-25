const {
  getAppointmentMessagesService,
  sendMessageService,
  getUserConversationsService
} = require("../services/chatService");

const getAppointmentMessages = async (req, res, next) => {
  try {
    const result = await getAppointmentMessagesService(
      req.user.userId,
      req.user.role,
      req.params.appointmentId
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await sendMessageService(
      req.user.userId,
      req.user.role,
      req.params.appointmentId,
      req.body
    );

    // Emit to Socket.IO room if socket instance is attached to app
    const io = req.app.get("io");
    if (io) {
      io.to(`appointment-${req.params.appointmentId}`).emit("new_message", message);
    }

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await getUserConversationsService(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointmentMessages,
  sendMessage,
  getUserConversations
};
