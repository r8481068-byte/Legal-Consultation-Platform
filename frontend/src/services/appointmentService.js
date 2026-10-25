const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function appointmentRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/appointments${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Appointment request failed.");
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

