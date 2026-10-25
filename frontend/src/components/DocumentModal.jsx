import { useState, useEffect } from "react";
import {
  getAppointmentDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument
} from "../services/documentService";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  File
} from "lucide-react";

export default function DocumentModal({ appointment, isOpen, onClose }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadDocuments = async () => {
    if (!appointment) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAppointmentDocuments(appointment._id);
      setDocuments(res.documents || []);
    } catch (err) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && appointment) {
      loadDocuments();
    }
  }, [isOpen, appointment]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("appointmentId", appointment._id);
      formData.append("title", title.trim() || file.name);
      if (description) formData.append("description", description.trim());

      await uploadDocument(formData);
      setSuccess("Document uploaded securely.");
      setFile(null);
      setTitle("");
      setDescription("");
      await loadDocuments();
    } catch (err) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setError("");
      await downloadDocument(doc._id, doc.originalName);
    } catch (err) {
      setError(err.message || "Failed to download document.");
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(docId);
    setError("");
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setSuccess("Document deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setDeletingId("");
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Case Documents</h2>
            <p className="text-xs text-slate-500">
              Securely share confidential case files, contracts, and legal evidence.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-3">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800 border border-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Content Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Form Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-700" />
              Upload New Document
            </h3>

            <form onSubmit={handleUpload} className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Property Agreement Draft"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Select File (PDF, DOCX, PNG, JPG up to 15MB)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    className="w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-800"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief description or note for the other party..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {uploading ? "Uploading Securely..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Shared Documents ({documents.length})
              </h3>
              <button
                type="button"
                onClick={loadDocuments}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Refresh List
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Loading case documents...
              </p>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <File className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  No documents shared for this consultation yet.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Uploaded documents are encrypted and restricted to you and the lawyer.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc) => {
                  const uploaderId = doc.uploader?._id || doc.uploader;
                  const canDelete =
                    user?.role === "admin" ||
                    uploaderId?.toString() === user?.id?.toString() ||
                    uploaderId?.toString() === user?._id?.toString();

                  const formattedSize = (doc.fileSize / 1024 / 1024).toFixed(2);

                  return (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-slate-900">
                            {doc.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>{doc.originalName}</span>
                            <span>•</span>
                            <span>{formattedSize} MB</span>
                            <span>•</span>
                            <span>
                              By {doc.uploader?.name || "Participant"} ({doc.uploader?.role || "user"})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc._id)}
                            disabled={deletingId === doc._id}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
