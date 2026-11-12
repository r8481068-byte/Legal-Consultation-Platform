import { io } from "socket.io-client";
import { authFetch, API_BASE_URL } from "./apiClient";

const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

let socketInstance = null;

export const getSocket = () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return null;

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  } else {
    // Update token if it has changed since socket creation
    if (socketInstance.auth?.token !== token) {
      socketInstance.auth = { token };
    }
    // Reconnect only if disconnected
    if (socketInstance.disconnected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
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
  const response = await authFetch(
    `${API_BASE_URL}/chat/messages/${appointmentId}`,
    {
      method: "GET",
    }
  );
  return handleResponse(response);
};

// Send a message
export const sendMessage = async (appointmentId, messageData) => {
  const response = await authFetch(
    `${API_BASE_URL}/chat/messages/${appointmentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    }
  );
  return handleResponse(response);
};

// Get conversations list
export const getUserConversations = async () => {
  const response = await authFetch(`${API_BASE_URL}/chat/conversations`, {
    method: "GET",
  });
  return handleResponse(response);
};
