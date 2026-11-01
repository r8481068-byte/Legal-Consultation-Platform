import { authFetch, API_BASE_URL } from "./apiClient";

async function appointmentRequest(endpoint, options = {}) {
  const response = await authFetch(`${API_BASE_URL}/appointments${endpoint}`, options);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "Appointment request failed.");
    error.status = response.status;
    error.code = result.code;
    error.data = result;
    throw error;
  }

  return result;
}

export async function bookAppointment(appointmentData) {
  return appointmentRequest("/", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}

export async function getMyAppointments() {
  const result = await appointmentRequest("/my");
  return result.appointments || [];
}

export async function cancelAppointment(appointmentId) {
  return appointmentRequest(`/${appointmentId}/cancel`, {
    method: "PATCH",
  });
}

export async function getVideoAccess(appointmentId) {
  return appointmentRequest(`/${appointmentId}/video-access`, {
    method: "GET",
  });
}

export async function endConsultationCall(appointmentId) {
  return appointmentRequest(`/${appointmentId}/end-call`, {
    method: "POST",
  });
}

