
const Lawyer = require("../models/Lawyer");
const LawyerAvailability = require("../models/LawyerAvailability");

const createAvailabilitySlotService = async (userId, startAt) => {
  const lawyer = await Lawyer.findOne({ user: userId });

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  if (lawyer.verificationStatus !== "approved") {
    const error = new Error("Only approved lawyers can add availability");
    error.statusCode = 403;
    throw error;
  }

  const start = new Date(startAt);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    const error = new Error("Slot must start in the future");
    error.statusCode = 400;
    throw error;
  }

  // Reject overlapping slots for this lawyer.
  const overlap = await LawyerAvailability.findOne({
    lawyer: lawyer._id,
    startAt: { $lt: end },
    endAt: { $gt: start },
  });

  if (overlap) {
    const error = new Error("This slot overlaps an existing slot");
    error.statusCode = 409;
    throw error;
  }

  try {
    return await LawyerAvailability.create({
      lawyer: lawyer._id,
      startAt: start,
      endAt: end,
      status: "available",
    });
  } catch (error) {
    // Also handle a duplicate start-time index conflict.
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "This slot already exists";
    }
    throw error;
  }
};

const getAvailableSlotsService = async (lawyerId) => {
  const lawyer = await Lawyer.findOne({
    _id: lawyerId,
    verificationStatus: "approved",
    isAvailable: true,
  });

  if (!lawyer) {
    const error = new Error("Available lawyer not found");
    error.statusCode = 404;
    throw error;
  }

  return LawyerAvailability.find({
    lawyer: lawyer._id,
    status: "available",
    startAt: { $gt: new Date() },
  }).sort({ startAt: 1 });
};

const getMySlotsService = async (userId) => {
  const lawyer = await Lawyer.findOne({ user: userId });
  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return LawyerAvailability.find({ lawyer: lawyer._id })
    .sort({ startAt: 1 })
    .lean();
};

const deleteAvailabilitySlotService = async (userId, slotId) => {
  const lawyer = await Lawyer.findOne({ user: userId });
  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const slot = await LawyerAvailability.findOne({
    _id: slotId,
    lawyer: lawyer._id
  });

  if (!slot) {
    const error = new Error("Availability slot not found");
    error.statusCode = 404;
    throw error;
  }

  if (slot.status === "booked") {
    const error = new Error("Cannot delete a booked availability slot");
    error.statusCode = 409;
    throw error;
  }

  await LawyerAvailability.findByIdAndDelete(slotId);

  return { message: "Availability slot deleted successfully" };
};

module.exports = {
  createAvailabilitySlotService,
  getAvailableSlotsService,
  getMySlotsService,
  deleteAvailabilitySlotService
};

