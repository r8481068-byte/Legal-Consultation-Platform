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
    throw new Error(data.message || "Notification request failed");
  }
  return data;
};

export const getNotifications = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const markNotificationRead = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
