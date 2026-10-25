const express = require("express");
const router = express.Router();

const {
  getAppointmentMessages,
  sendMessage,
  getUserConversations
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/conversations", getUserConversations);
router.get("/messages/:appointmentId", getAppointmentMessages);
router.post("/messages/:appointmentId", sendMessage);

module.exports = router;
