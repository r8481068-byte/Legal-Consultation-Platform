const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { UPLOAD_DIR } = require("../services/documentService");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Invalid file type. Only PDF, JPG, PNG, WEBP, and DOC/DOCX files are supported.");
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter
});

module.exports = upload;
