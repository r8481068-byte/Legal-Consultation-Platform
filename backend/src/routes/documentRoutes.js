const express = require("express");
const router = express.Router();

const {
  uploadDocument,
  getAppointmentDocuments,
  getMyDocuments,
  downloadDocument,
  deleteDocument
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All document routes require authentication
router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/appointment/:appointmentId", getAppointmentDocuments);
router.get("/my", getMyDocuments);
router.get("/:documentId/download", downloadDocument);
router.delete("/:documentId", deleteDocument);

module.exports = router;
