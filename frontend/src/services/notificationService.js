import { authFetch, API_BASE_URL } from "./apiClient.js";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Notification request failed");
  }
  return data;
};

export const getNotifications = async () => {
  const response = await authFetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
  });
  return handleResponse(response);
};

export const markNotificationRead = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });
  return handleResponse(response);
};

export const markAllNotificationsRead = async () => {
  const response = await authFetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
  });
  return handleResponse(response);
};
