const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getAvailableSlots(lawyerId) {
  const response = await fetch(
    `${API_BASE_URL}/availability/${lawyerId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load available slots");
  }

  return Array.isArray(result.slots)
    ? result.slots
    : Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];
}

export async function createAvailabilitySlot(startAt) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ startAt }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Failed to create availability slot");
  }

  return result;
}

export async function getMySlots() {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/availability/my/slots`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch slots");
  }
  return result.slots || [];
}

export async function deleteSlot(slotId) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/availability/${slotId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete slot");
  }
  return result;
}