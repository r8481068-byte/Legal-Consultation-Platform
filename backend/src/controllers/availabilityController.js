
const {
  createAvailabilitySlotService,
  getAvailableSlotsService,
  getMySlotsService,
  deleteAvailabilitySlotService
} = require("../services/availabilityService");

const createAvailabilitySlot = async (req, res, next) => {
  try {
    const slot = await createAvailabilitySlotService(
      req.user.userId,
      req.body.startAt
    );

    return res.status(201).json({
      success: true,
      message: "Availability slot created successfully",
      slot,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const slots = await getAvailableSlotsService(req.params.lawyerId);

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

const getMySlots = async (req, res, next) => {
  try {
    const slots = await getMySlotsService(req.user.userId);
    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAvailabilitySlot = async (req, res, next) => {
  try {
    const result = await deleteAvailabilitySlotService(
      req.user.userId,
      req.params.slotId
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAvailabilitySlot,
  getAvailableSlots,
  getMySlots,
  deleteAvailabilitySlot
};

