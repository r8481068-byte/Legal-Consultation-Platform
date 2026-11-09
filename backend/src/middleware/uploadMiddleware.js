const multer = require("multer");
const path = require("path");
const fs = require("fs");
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

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx"
];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

/**
 * Checks if a buffer starts with an array of byte values.
 */
function bufferStartsWith(buffer, bytes) {
  if (buffer.length < bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[i] !== bytes[i]) return false;
  }
  return true;
}

/**
 * Safely inspects a ZIP archive in-memory to ensure it is a valid Office OpenXML Word Document (.docx).
 * Validates the presence of required entries [Content_Types].xml and word/document.xml.
 * Applies strict limits on entry counts and decompression ratios to prevent ZIP bomb attacks.
 * Never decompresses or extracts files to disk.
 */
function validateDocxArchive(buffer) {
  if (!buffer || buffer.length < 30) return false;

  // Must start with PK\x03\x04
  if (
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4B ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  ) {
    return false;
  }

  const MAX_ENTRIES = 1000;
  const MAX_UNCOMPRESSED_TOTAL = 150 * 1024 * 1024; // 150 MB safe expansion threshold
  const MAX_COMPRESSION_RATIO = 100; // Decompression ratio limit

  const entryNames = new Set();
  let totalUncompressedSize = 0;
  let entryCount = 0;

  let offset = 0;
  while (offset + 30 <= buffer.length) {
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4B &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      entryCount++;
      if (entryCount > MAX_ENTRIES) return false;

      const flags = buffer.readUInt16LE(offset + 6);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const uncompressedSize = buffer.readUInt32LE(offset + 22);
      const fileNameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);

      // ZIP bomb expansion ratio protection
      if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_COMPRESSION_RATIO) {
        return false;
      }

      totalUncompressedSize += uncompressedSize;
      if (totalUncompressedSize > MAX_UNCOMPRESSED_TOTAL) {
        return false;
      }

      if (offset + 30 + fileNameLen <= buffer.length) {
        const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLen);
        entryNames.add(fileName);
      }

      if ((flags & 0x08) !== 0 || compressedSize === 0) {
        offset += 30 + fileNameLen + extraLen;
        const nextPk = buffer.indexOf(Buffer.from([0x50, 0x4B]), offset);
        if (nextPk === -1) break;
        offset = nextPk;
      } else {
        offset += 30 + fileNameLen + extraLen + compressedSize;
      }
    } else if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4B &&
      buffer[offset + 2] === 0x01 &&
      buffer[offset + 3] === 0x02
    ) {
      if (offset + 46 > buffer.length) break;
      entryCount++;
      if (entryCount > MAX_ENTRIES) return false;

      const compressedSize = buffer.readUInt32LE(offset + 20);
      const uncompressedSize = buffer.readUInt32LE(offset + 24);
      const fileNameLen = buffer.readUInt16LE(offset + 28);
      const extraLen = buffer.readUInt16LE(offset + 30);
      const commentLen = buffer.readUInt16LE(offset + 32);

      if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_COMPRESSION_RATIO) {
        return false;
      }

      totalUncompressedSize += uncompressedSize;
      if (totalUncompressedSize > MAX_UNCOMPRESSED_TOTAL) {
        return false;
      }

      if (offset + 46 + fileNameLen <= buffer.length) {
        const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLen);
        entryNames.add(fileName);
      }

      offset += 46 + fileNameLen + extraLen + commentLen;
    } else {
      const nextPk = buffer.indexOf(Buffer.from([0x50, 0x4B]), offset + 1);
      if (nextPk === -1) break;
      offset = nextPk;
    }
  }

  // A valid Word Document (.docx) MUST contain [Content_Types].xml and word/document.xml
  const hasContentTypes = entryNames.has("[Content_Types].xml");
  const hasWordDocument = entryNames.has("word/document.xml");

  return hasContentTypes && hasWordDocument;
}

/**
 * Validates actual binary content against known magic byte signatures.
 * Rejects spoofed, corrupted, or executable files.
 */
function verifyFileSignature(buffer, declaredExt) {
  if (!buffer || buffer.length < 4) return null;

  // Immediate rejection of executable and script signatures
  // MZ (Windows PE Executable / DLL)
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) return null;
  // ELF (Linux executable)
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) return null;
  // Shell script shebang (#!)
  if (buffer[0] === 0x23 && buffer[1] === 0x21) return null;

  // Reject text scripts posing as documents
  const headerStr = buffer.slice(0, 32).toString("utf8").toLowerCase();
  if (
    headerStr.startsWith("<?php") ||
    headerStr.startsWith("<script") ||
    headerStr.startsWith("<html")
  ) {
    return null;
  }

  // 1. PDF: starts with %PDF- (0x25 0x50 0x44 0x46)
  if (bufferStartsWith(buffer, [0x25, 0x50, 0x44, 0x46])) {
    return declaredExt === ".pdf" ? "application/pdf" : null;
  }

  // 2. JPEG: starts with 0xFF 0xD8 0xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return (declaredExt === ".jpg" || declaredExt === ".jpeg") ? "image/jpeg" : null;
  }

  // 3. PNG: starts with 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (bufferStartsWith(buffer, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return declaredExt === ".png" ? "image/png" : null;
  }

  // 4. WEBP: standard RIFF....WEBP format
  if (
    buffer.length >= 12 &&
    bufferStartsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && // "RIFF"
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return declaredExt === ".webp" ? "image/webp" : null;
  }

  // 5. DOC (OLE2 Compound Document): starts with 0xD0 0xCF 0x11 0xE0 0xA1 0xB1 0x1A 0xE1
  // Verified to specifically contain the Microsoft WordDocument stream
  if (bufferStartsWith(buffer, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
    if (declaredExt !== ".doc") return null;
    const wordStreamMarker = Buffer.from("WordDocument", "utf16le");
    const hasWordStream = buffer.includes(wordStreamMarker) || buffer.includes("WordDocument");
    return hasWordStream ? "application/msword" : null;
  }

  // 6. DOCX (Office OpenXML Document): verified zip container with [Content_Types].xml and word/document.xml
  if (declaredExt === ".docx") {
    const isValidDocx = validateDocxArchive(buffer);
    return isValidDocx
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : null;
  }

  return null;
}

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error("Invalid file type. Only PDF, JPG, PNG, WEBP, and DOC/DOCX files are supported.");
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter
});

/**
 * Express middleware to verify uploaded file signatures on disk.
 * Immediately unlinks spoofed/corrupted files before downstream processing.
 */
const validateUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    const buffer = fs.readFileSync(filePath);
    const verifiedMime = verifyFileSignature(buffer, ext);

    if (!verifiedMime) {
      fs.unlink(filePath, () => {});
      const error = new Error(
        "File signature verification failed. The file content does not match its declared extension or MIME type."
      );
      error.statusCode = 400;
      return next(error);
    }

    req.file.mimetype = verifiedMime;
    next();
  } catch (err) {
    fs.unlink(filePath, () => {});
    const error = new Error("Unable to verify uploaded file content");
    error.statusCode = 400;
    return next(error);
  }
};

upload.validateUploadedFile = validateUploadedFile;
upload.verifyFileSignature = verifyFileSignature;
upload.validateDocxArchive = validateDocxArchive;
upload.ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS;
upload.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;

module.exports = upload;
