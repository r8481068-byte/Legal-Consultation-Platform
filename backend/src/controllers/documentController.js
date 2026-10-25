const {
  uploadDocumentService,
  getAppointmentDocumentsService,
  getMyDocumentsService,
  getDocumentForDownloadService,
  deleteDocumentService
} = require("../services/documentService");

const uploadDocument = async (req, res, next) => {
  try {
    const document = await uploadDocumentService(
      req.user.userId,
      req.user.role,
      req.file,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentDocuments = async (req, res, next) => {
  try {
    const documents = await getAppointmentDocumentsService(
      req.params.appointmentId,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await getMyDocumentsService(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const document = await getDocumentForDownloadService(
      req.params.documentId,
      req.user.userId,
      req.user.role
    );

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.originalName)}"`
    );

    return res.download(document.filePath, document.originalName);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const result = await deleteDocumentService(
      req.params.documentId,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getAppointmentDocuments,
  getMyDocuments,
  downloadDocument,
  deleteDocument
};
