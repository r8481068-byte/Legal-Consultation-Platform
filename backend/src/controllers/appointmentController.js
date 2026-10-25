
const {
  bookAppointmentService,
  getMyAppointmentsService,
  cancelAppointmentService,
  getLawyerAppointmentsService,
  updateLawyerAppointmentStatusService
} = require("../services/appointmentService");

const bookAppointment = async (req, res, next) => {
  try {
    const appointment = await bookAppointmentService(
      req.user.userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await getMyAppointmentsService(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await cancelAppointmentService(
      req.user.userId,
      req.params.appointmentId
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    next(error);
  }
};


const getLawyerAppointments = async (req, res, next) => {
  try {
    const appointments = await getLawyerAppointmentsService(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

const confirmAppointment = async (req, res, next) => {
  try {
    const appointment =
      await updateLawyerAppointmentStatusService(
        req.user.userId,
        req.params.appointmentId,
        "confirmed"
      );

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      appointment
    });
  } catch (error) {
    next(error);
  }
};


const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await updateLawyerAppointmentStatusService(
      req.user.userId,
      req.params.appointmentId,
      "completed"
    );

    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};



const rejectAppointment = async (req, res, next) => {
  try {
    const appointment =
      await updateLawyerAppointmentStatusService(
        req.user.userId,
        req.params.appointmentId,
        "rejected"
      );

    return res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
      appointment
    });
  } catch (error) {
    next(error);
  }
};

const getVideoAccess = async (req, res, next) => {
  try {
    const { getVideoAccessService } = require("../services/appointmentService");
    const result = await getVideoAccessService(
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

const endConsultationCall = async (req, res, next) => {
  try {
    const { endConsultationCallService } = require("../services/appointmentService");
    const result = await endConsultationCallService(
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

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getLawyerAppointments,
  confirmAppointment,
  completeAppointment,
  rejectAppointment,
  getVideoAccess,
  endConsultationCall
};

