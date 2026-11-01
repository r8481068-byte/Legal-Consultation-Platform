import { API_BASE_URL, authFetch } from "./apiClient";

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
  const response = await authFetch(`${API_BASE_URL}/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const response = await authFetch(`${API_BASE_URL}/availability/my/slots`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch slots");
  }
  return result.slots || [];
}

export async function deleteSlot(slotId) {
  const response = await authFetch(`${API_BASE_URL}/availability/${slotId}`, {
    method: "DELETE",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete slot");
  }
  return result;
}