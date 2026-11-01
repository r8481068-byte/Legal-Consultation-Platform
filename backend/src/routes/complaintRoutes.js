const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const { protect } = require("../middleware/authMiddleware");

// Client / Lawyer submit a complaint or support ticket
router.post("/", protect, async (req, res, next) => {
  try {
    const { subject, description, category, relatedAppointment, priority } = req.body;
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const stamp = Date.now().toString().slice(-6);
    const complaintId = `CMP-${stamp}`;

    const complaint = new Complaint({
      complaintId,
      submittedBy: req.user.userId,
      role: req.user.role,
      subject: subject.trim(),
      description: description.trim(),
      category: category || "consultation",
      relatedAppointment: relatedAppointment || null,
      priority: priority || "medium",
      status: "open",
      history: [
        {
          status: "open",
          note: "Ticket submitted by user",
          updatedBy: req.user.userId,
          updatedAt: new Date(),
        },
      ],
    });

    await complaint.save();

    return res.status(201).json({
      success: true,
      complaint,
      message: `Support ticket ${complaintId} created successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// View my submitted complaints
router.get("/my", protect, async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
