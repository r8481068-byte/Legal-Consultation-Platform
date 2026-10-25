const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Verify if a user is an authorized participant (client or lawyer) of the appointment.
 */
const verifyAppointmentAccess = async (appointmentId, userId, userRole) => {
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

  if (userRole === "admin") {
    return appointment;
  }

  const isClient = appointment.client.toString() === userId.toString();
  const isLawyer = appointment.lawyer?.user?.toString() === userId.toString();

  if (!isClient && !isLawyer) {
    const error = new Error("Access denied: You are not a participant in this appointment");
    error.statusCode = 403;
    throw error;
  }

  return appointment;
};

const uploadDocumentService = async (userId, userRole, file, data) => {
  if (!file) {
    const error = new Error("Please select a file to upload");
    error.statusCode = 400;
    throw error;
  }

  const { appointmentId, title, description } = data;
  if (!appointmentId) {
    // Clean up uploaded file if validation fails
    fs.unlink(file.path, () => {});
    const error = new Error("Appointment ID is required for case documents");
    error.statusCode = 400;
    throw error;
  }

  let appointment;
  try {
    appointment = await verifyAppointmentAccess(appointmentId, userId, userRole);
  } catch (err) {
    fs.unlink(file.path, () => {});
    throw err;
  }

  const document = await Document.create({
    uploader: userId,
    appointment: appointment._id,
    title: title?.trim() || file.originalname,
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    fileSize: file.size,
    filePath: file.path,
    description: description?.trim() || ""
  });

  // Notify the other participant
  try {
    const isClientUploader = appointment.client.toString() === userId.toString();
    const recipientId = isClientUploader ? appointment.lawyer.user : appointment.client;
    const senderRoleName = isClientUploader ? "Client" : "Lawyer";

    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        title: "New Case Document Uploaded",
        message: `${senderRoleName} uploaded document: "${document.title}".`,
        type: "appointment",
        link: isClientUploader ? "/lawyer-dashboard" : "/my-appointments",
        relatedId: appointment._id
      });
    }
  } catch (err) {
    console.error("Failed to create document notification:", err.message);
  }

  return document;
};

const getAppointmentDocumentsService = async (appointmentId, userId, userRole) => {
  await verifyAppointmentAccess(appointmentId, userId, userRole);

  return Document.find({ appointment: appointmentId, isArchived: false })
    .populate("uploader", "name role profileImage")
    .sort({ createdAt: -1 })
    .lean();
};

const getMyDocumentsService = async (userId, userRole) => {
  // Find appointments where user is participant
  let appointmentFilter;
  if (userRole === "client") {
    appointmentFilter = { client: userId };
  } else if (userRole === "lawyer") {
    const Lawyer = require("../models/Lawyer");
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return [];
    appointmentFilter = { lawyer: lawyer._id };
  } else {
    // admin
    appointmentFilter = {};
  }

  const appointments = await Appointment.find(appointmentFilter).select("_id").lean();
  const appointmentIds = appointments.map((a) => a._id);

  return Document.find({
    appointment: { $in: appointmentIds },
    isArchived: false
  })
    .populate("uploader", "name role")
    .populate("appointment", "scheduledAt consultationType status")
    .sort({ createdAt: -1 })
    .lean();
};

const getDocumentForDownloadService = async (documentId, userId, userRole) => {
  if (!mongoose.isValidObjectId(documentId)) {
    const error = new Error("Invalid document ID");
    error.statusCode = 400;
    throw error;
  }

  const document = await Document.findById(documentId);
  if (!document || document.isArchived) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  await verifyAppointmentAccess(document.appointment, userId, userRole);

  if (!fs.existsSync(document.filePath)) {
    const error = new Error("File content not found on server");
    error.statusCode = 404;
    throw error;
  }

  return document;
};

const deleteDocumentService = async (documentId, userId, userRole) => {
  if (!mongoose.isValidObjectId(documentId)) {
    const error = new Error("Invalid document ID");
    error.statusCode = 400;
    throw error;
  }

  const document = await Document.findById(documentId);
  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== "admin" && document.uploader.toString() !== userId.toString()) {
    const error = new Error("You are not authorized to delete this document");
    error.statusCode = 403;
    throw error;
  }

  // Remove file from disk
  if (fs.existsSync(document.filePath)) {
    fs.unlink(document.filePath, () => {});
  }

  await Document.findByIdAndDelete(documentId);

  return { message: "Document deleted successfully" };
};

module.exports = {
  uploadDocumentService,
  getAppointmentDocumentsService,
  getMyDocumentsService,
  getDocumentForDownloadService,
  deleteDocumentService,
  UPLOAD_DIR
};
