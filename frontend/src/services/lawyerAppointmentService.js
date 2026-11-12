
import { API_BASE_URL, authFetch } from "./apiClient";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Fetch appointments for the logged-in lawyer
export const getLawyerAppointments = async () => {
  const response = await authFetch(
    `${API_BASE_URL}/appointments/lawyer/my`,
    {
      method: "GET",
    }
  );

  return handleResponse(response);
};

// Update appointment status
const updateAppointmentStatus = async (appointmentId, action, bodyData) => {
  const response = await authFetch(
    `${API_BASE_URL}/appointments/${appointmentId}/${action}`,
    {
      method: "PATCH",
      ...(bodyData ? { body: JSON.stringify(bodyData) } : {}),
    }
  );

  return handleResponse(response);
};

export const confirmLawyerAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "confirm");

export const rejectLawyerAppointment = (appointmentId, reason = "") =>
  updateAppointmentStatus(appointmentId, "reject", reason ? { reason } : undefined);

export const cancelLawyerAppointment = (appointmentId, reason = "") =>
  updateAppointmentStatus(appointmentId, "cancel", reason ? { reason } : undefined);

export const completeLawyerAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "complete");
