
// const Appointment = require("../models/Appointment");
// const Lawyer = require("../models/Lawyer");
// const User = require("../models/User");



const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Lawyer = require("../models/Lawyer");
const LawyerAvailability = require("../models/LawyerAvailability");
const Payment = require("../models/Payment");
const User = require("../models/User");

// const bookAppointmentService = async (clientId, data) => {
//   const { lawyerId, scheduledAt, consultationType, notes } = data;

//   const start = new Date(scheduledAt);

//   if (!Number.isFinite(start.getTime()) || start <= new Date()) {
//     const error = new Error("Appointment must be scheduled for a future date");
//     error.statusCode = 400;
//     throw error;
//   }

//   const client = await User.findById(clientId);

//   if (!client || !client.isActive || client.role !== "client") {
//     const error = new Error("Active client account not found");
//     error.statusCode = 403;
//     throw error;
//   }

//   const lawyer = await Lawyer.findOne({
//     _id: lawyerId,
//     verificationStatus: "approved",
//     isAvailable: true
//   });

//   if (!lawyer) {
//     const error = new Error("Approved and available lawyer not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   const durationMinutes = 30;
//   const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

//   const conflict = await Appointment.findOne({
//     lawyer: lawyerId,
//     status: { $in: ["pending", "confirmed"] },
//     scheduledAt: { $lt: end },
//     $expr: {
//       $gt: [
//         {
//           $add: [
//             "$scheduledAt",
//             { $multiply: ["$durationMinutes", 60000] }
//           ]
//         },
//         start
//       ]
//     }
//   });

//   if (conflict) {
//     const error = new Error("This lawyer already has an overlapping appointment");
//     error.statusCode = 409;
//     throw error;
//   }

//   const appointment = await Appointment.create({
//     client: clientId,
//     lawyer: lawyerId,
//     scheduledAt: start,
//     durationMinutes,
//     consultationType,
//     notes
//   });

//   return appointment;
// };


const withOptionalTransaction = async (operation) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    if (
      error.message &&
      (error.message.includes("replica set") ||
        error.message.includes("Transaction numbers are only allowed") ||
        error.message.includes("standalone"))
    ) {
      // Standalone MongoDB without replica set: execute directly without transaction session
      return await operation(null);
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const bookAppointmentService = async (clientId, data) => {
  return await withOptionalTransaction(async (session) => {
    const opts = session ? { session } : {};

    const client = await User.findOne({
      _id: clientId,
      role: "client",
      isActive: true,
    }, null, opts);

    if (!client) {
      const error = new Error("Active client account not found");
      error.statusCode = 403;
      throw error;
    }

    // Atomically reserve the slot. Only one request can claim it.
    const slot = await LawyerAvailability.findOneAndUpdate(
      {
        _id: data.slotId,
        status: "available",
        startAt: { $gt: new Date() },
      },
      { $set: { status: "booked" } },
      { new: true, ...opts }
    );

    if (!slot) {
      const error = new Error("Slot is unavailable or already booked");
      error.statusCode = 409;
      throw error;
    }

    const lawyer = await Lawyer.findOne({
      _id: slot.lawyer,
      verificationStatus: "approved",
      isAvailable: true,
    }, null, opts);

    if (!lawyer) {
      const error = new Error("Lawyer is not available for booking");
      error.statusCode = 409;
      throw error;
    }

    // Prevent overlap with existing pending/confirmed appointments.
    const conflict = await Appointment.findOne({
      lawyer: lawyer._id,
      status: { $in: ["pending", "confirmed"] },
      scheduledAt: { $lt: slot.endAt },
      $expr: {
        $gt: [
          {
            $add: [
              "$scheduledAt",
              { $multiply: ["$durationMinutes", 60000] },
            ],
          },
          slot.startAt,
        ],
      },
    }, null, opts);

    if (conflict) {
      const error = new Error("This time conflicts with another appointment");
      error.statusCode = 409;
      throw error;
    }

    const appointment = await Appointment.create(
      [
        {
          client: client._id,
          lawyer: lawyer._id,
          slot: slot._id,
          scheduledAt: slot.startAt,
          durationMinutes: 30,
          consultationType: data.consultationType,
          notes: data.notes || "",
        },
      ],
      opts
    );

    return appointment[0] || appointment;
  });
};


const getMyAppointmentsService = async (clientId) => {
  const appointments = await Appointment.find({ client: clientId })
    .populate({
      path: "lawyer",
      select: "city specialization consultationFee user",
      populate: {
        path: "user",
        select: "name profileImage",
      },
    })
    .sort({ scheduledAt: -1 })
    .lean();

  const appointmentIds = appointments.map((a) => a._id);
  const payments = await Payment.find({
    appointment: { $in: appointmentIds },
    status: { $in: ["captured", "authorized"] },
  }).lean();

  const paidMap = new Map();
  payments.forEach((p) => {
    paidMap.set(p.appointment.toString(), p);
  });

  return appointments.map((app) => ({
    ...app,
    isPaid: paidMap.has(app._id.toString()),
    payment: paidMap.get(app._id.toString()) || null,
  }));
};




const cancelAppointmentService = async (clientId, appointmentId) => {
  return await withOptionalTransaction(async (session) => {
    const opts = session ? { session } : {};

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        client: clientId,
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true, ...opts }
    );

    if (!appointment) {
      const existing = await Appointment.findOne(
        {
          _id: appointmentId,
          client: clientId,
        },
        null,
        opts
      );

      const error = new Error(
        existing
          ? "Only pending appointments can be cancelled"
          : "Appointment not found"
      );
      error.statusCode = existing ? 409 : 404;
      throw error;
    }

    if (appointment.slot) {
      await LawyerAvailability.updateOne(
        {
          _id: appointment.slot,
          lawyer: appointment.lawyer,
          status: "booked",
        },
        { $set: { status: "available" } },
        opts
      );
    }

    return appointment;
  });
};



const getLawyerAppointmentsService = async (lawyerUserId) => {
  const lawyer = await Lawyer.findOne({ user: lawyerUserId });

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const appointments = await Appointment.find({ lawyer: lawyer._id })
    .populate("client", "name email profileImage")
    .sort({ scheduledAt: 1 })
    .lean();

  const appointmentIds = appointments.map((a) => a._id);
  const payments = await Payment.find({
    appointment: { $in: appointmentIds },
    status: { $in: ["captured", "authorized"] },
  }).lean();

  const paidSet = new Set(payments.map((p) => p.appointment.toString()));

  return appointments.map((app) => ({
    ...app,
    isPaid: paidSet.has(app._id.toString()),
  }));
};


const updateLawyerAppointmentStatusService = async (
  lawyerUserId,
  appointmentId,
  status
) => {
  if (!["confirmed", "rejected", "completed"].includes(status)) {
    const error = new Error("Invalid appointment status");
    error.statusCode = 400;
    throw error;
  }

  return await withOptionalTransaction(async (session) => {
    const opts = session ? { session } : {};

    const lawyer = await Lawyer.findOne({
      user: lawyerUserId,
    }, null, opts);

    if (!lawyer) {
      const error = new Error("Lawyer profile not found");
      error.statusCode = 404;
      throw error;
    }

    const allowedCurrentStatus =
      status === "completed" ? "confirmed" : "pending";

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        lawyer: lawyer._id,
        status: allowedCurrentStatus,
      },
      { $set: { status } },
      { new: true, ...opts }
    ).populate("client", "name email profileImage");

    if (!appointment) {
      const existing = await Appointment.findOne({
        _id: appointmentId,
        lawyer: lawyer._id,
      }, null, opts);

      const error = new Error(
        existing
          ? `Cannot change appointment from ${existing.status} to ${status}`
          : "Appointment not found for this lawyer"
      );
      error.statusCode = existing ? 409 : 404;
      throw error;
    }

    if (status === "rejected" && appointment.slot) {
      await LawyerAvailability.updateOne(
        {
          _id: appointment.slot,
          lawyer: lawyer._id,
          status: "booked",
        },
        { $set: { status: "available" } },
        opts
      );
    }

    return appointment;
  });
};

const getVideoAccessService = async (userId, userRole, appointmentId) => {
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

  const isClient = appointment.client._id.toString() === userId.toString();
  const isLawyer = appointment.lawyer?.user?._id?.toString() === userId.toString() ||
                   appointment.lawyer?.user?.toString() === userId.toString();

  if (!isClient && !isLawyer && userRole !== "admin") {
    const error = new Error("You are not authorized to join this consultation room");
    error.statusCode = 403;
    throw error;
  }

  if (appointment.consultationType !== "video") {
    const error = new Error("This appointment was not booked as an online video consultation");
    error.statusCode = 400;
    throw error;
  }

  if (!["confirmed", "completed"].includes(appointment.status)) {
    const error = new Error(`Video room is unavailable. Appointment status is currently: ${appointment.status}`);
    error.statusCode = 400;
    throw error;
  }

  if (!appointment.meetingRoomId) {
    appointment.meetingRoomId = `room-${appointment._id}`;
  }

  if (!appointment.callStartedAt) {
    appointment.callStartedAt = new Date();
  }

  await appointment.save();

  return {
    canJoin: true,
    roomName: appointment.meetingRoomId,
    appointment,
    role: isClient ? "client" : "lawyer"
  };
};

const endConsultationCallService = async (userId, userRole, appointmentId) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId).populate("lawyer");
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  const isClient = appointment.client.toString() === userId.toString();
  const isLawyer = appointment.lawyer?.user?.toString() === userId.toString();

  if (!isClient && !isLawyer && userRole !== "admin") {
    const error = new Error("Unauthorized to end this call");
    error.statusCode = 403;
    throw error;
  }

  appointment.callEndedAt = new Date();

  // If currently confirmed, transition to completed
  if (appointment.status === "confirmed") {
    appointment.status = "completed";
  }

  await appointment.save();

  return {
    success: true,
    message: "Consultation call completed successfully",
    appointment
  };
};

module.exports = {
  bookAppointmentService,
  getMyAppointmentsService,
  cancelAppointmentService,
  getLawyerAppointmentsService,
  updateLawyerAppointmentStatusService,
  getVideoAccessService,
  endConsultationCallService
};

