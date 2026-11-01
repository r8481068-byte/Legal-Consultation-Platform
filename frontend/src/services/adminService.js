const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Admin request failed");
  }
  return data;
};

// =========================================================================
// 1. DASHBOARD METRICS & ANALYTICS
// =========================================================================
export const getAdminMetrics = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/metrics${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminAnalytics = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/analytics${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminRecentActivity = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/recent-activity`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// =========================================================================
// 2. CLIENT MANAGEMENT
// =========================================================================
export const getAdminClients = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/clients?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminClientDetail = async (clientId) => {
  const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const toggleClientBlock = async (clientId, isBlocked, blockReason = "") => {
  const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/block`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isBlocked, blockReason }),
  });
  return handleResponse(response);
};

// =========================================================================
// 3. LAWYER MANAGEMENT
// =========================================================================
export const getAdminLawyers = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/lawyers?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminLawyerDetail = async (lawyerId) => {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${lawyerId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const toggleLawyerBlock = async (lawyerId, isBlocked, blockReason = "") => {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${lawyerId}/block`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isBlocked, blockReason }),
  });
  return handleResponse(response);
};

// =========================================================================
// 4. LAWYER VERIFICATION
// =========================================================================
export const getAdminVerifications = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/verifications?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateLawyerVerification = async (lawyerId, status, decisionReason = "", internalNotes = "") => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${lawyerId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, decisionReason, internalNotes }),
  });
  return handleResponse(response);
};

// Backward-compatible alias
export const verifyLawyer = updateLawyerVerification;
export const getPendingLawyers = () => getAdminVerifications({ status: "pending" });

// =========================================================================
// 5. APPOINTMENTS MANAGEMENT
// =========================================================================
export const getAdminAppointments = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/appointments?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminAppointmentDetail = async (appointmentId) => {
  const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const cancelAdminAppointment = async (appointmentId, reason) => {
  const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

// =========================================================================
// 6. REVIEWS & RATINGS MODERATION
// =========================================================================
export const getAdminReviews = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/reviews?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const moderateAdminReview = async (reviewId, status, moderationReason = "") => {
  const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/moderate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, moderationReason }),
  });
  return handleResponse(response);
};

// =========================================================================
// 7. PAYMENTS & TRANSACTIONS
// =========================================================================
export const getAdminPayments = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/payments?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminPaymentDetail = async (paymentId) => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const processRefund = async (paymentId, reason = "") => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/refund`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

// =========================================================================
// 8. COMPLAINTS & SUPPORT
// =========================================================================
export const getAdminComplaints = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/complaints?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAdminComplaintDetail = async (complaintId) => {
  const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateAdminComplaint = async (complaintId, payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// =========================================================================
// 9. NOTIFICATIONS & BROADCASTS
// =========================================================================
export const getAdminNotifications = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/notifications?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const broadcastNotification = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// =========================================================================
// 10. REPORTS
// =========================================================================
export const getAdminReports = async (type, params = {}) => {
  const qs = new URLSearchParams({ type, ...params }).toString();
  const response = await fetch(`${API_BASE_URL}/admin/reports?${qs}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// =========================================================================
// 11. ACTIVITY LOGS
// =========================================================================
export const getAdminActivityLogs = async (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const response = await fetch(`${API_BASE_URL}/admin/activity-logs?${qs.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// =========================================================================
// 12. ADMIN SETTINGS
// =========================================================================
export const getAdminSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateAdminProfile = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const changeAdminPassword = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updatePlatformSettings = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings/platform`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// Backward-compatible alias
export const getAdminUsers = (params) => getAdminClients(params);
export const toggleUserStatus = (userId) => toggleClientBlock(userId, true, "Administrative action");
