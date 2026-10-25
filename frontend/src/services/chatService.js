import { io } from "socket.io-client";

const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

let socketInstance = null;

export const getSocket = () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return null;

  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

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
    throw new Error(data.message || "Chat request failed");
  }
  return data;
};

// Fetch messages for an appointment
export const getAppointmentMessages = async (appointmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/chat/messages/${appointmentId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

// Send a message
export const sendMessage = async (appointmentId, messageData) => {
  const response = await fetch(
    `${API_BASE_URL}/chat/messages/${appointmentId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    }
  );
  return handleResponse(response);
};

// Get conversations list
export const getUserConversations = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
