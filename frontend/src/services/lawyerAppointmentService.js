
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Fetch appointments for the logged-in lawyer
export const getLawyerAppointments = async () => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/lawyer/my`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

// Update appointment status
const updateAppointmentStatus = async (appointmentId, action) => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/${action}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const confirmLawyerAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "confirm");

export const rejectLawyerAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "reject");

export const completeLawyerAppointment = (appointmentId) =>
  updateAppointmentStatus(appointmentId, "complete");
