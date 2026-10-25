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

// Admin metrics
export const getAdminMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Pending lawyer applications
export const getPendingLawyers = async () => {
  const response = await fetch(`${API_BASE_URL}/lawyers/admin/pending`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Approve, reject, or request additional information for lawyer application
export const verifyLawyer = async (lawyerId, status, decisionReason = "") => {
  const response = await fetch(
    `${API_BASE_URL}/lawyers/admin/${lawyerId}/verification`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, decisionReason }),
    }
  );
  return handleResponse(response);
};

// User management
export const getAdminUsers = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.role) searchParams.append("role", params.role);
  if (params.status) searchParams.append("status", params.status);
  if (params.search) searchParams.append("search", params.search);

  const response = await fetch(
    `${API_BASE_URL}/admin/users?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

export const toggleUserStatus = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

// Appointments management
export const getAdminAppointments = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.status) searchParams.append("status", params.status);

  const response = await fetch(
    `${API_BASE_URL}/admin/appointments?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

// Payments & Disputes management
export const getAdminPayments = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.status) searchParams.append("status", params.status);

  const response = await fetch(
    `${API_BASE_URL}/admin/payments?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

export const processRefund = async (paymentId, reason = "") => {
  const response = await fetch(
    `${API_BASE_URL}/admin/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    }
  );
  return handleResponse(response);
};
