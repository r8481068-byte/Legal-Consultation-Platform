const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Document request failed");
  }
  return data;
};

// Upload a case document
export const uploadDocument = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    headers: getAuthHeaders(), // Let browser set multipart boundary
    body: formData,
  });
  return handleResponse(response);
};

// Get documents for an appointment
export const getAppointmentDocuments = async (appointmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/documents/appointment/${appointmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  );
  return handleResponse(response);
};

// Get user's documents
export const getMyDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/documents/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
};

// Download a document securely
export const downloadDocument = async (documentId, filename = "document") => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to download document");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Delete a document
export const deleteDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
};
