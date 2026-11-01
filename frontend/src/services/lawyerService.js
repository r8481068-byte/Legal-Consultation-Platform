import { API_BASE_URL, authFetch } from "./apiClient";

export async function getLawyers(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/lawyers?${params.toString()}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch lawyers");
  }

  return {
    lawyers: result.lawyers || [],
    pagination: result.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}




export async function getLawyerById(lawyerId) {
  const response = await fetch(
    `${API_BASE_URL}/lawyers/${lawyerId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load lawyer profile");
  }

  return result.lawyer;
}

export async function getDirectorySummary() {
  const response = await fetch(`${API_BASE_URL}/lawyers/directory-summary`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to load directory summary");
  }
  return result;
}

export async function applyAsLawyer(data) {
  const response = await authFetch(`${API_BASE_URL}/lawyers/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit lawyer application");
  }

  return result;
}

export async function getMyLawyerProfile() {
  const response = await authFetch(`${API_BASE_URL}/lawyers/profile/me`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch lawyer profile");
  }
  return result.lawyer;
}

export async function updateLawyerProfile(data) {
  const response = await authFetch(`${API_BASE_URL}/lawyers/profile/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to update lawyer profile");
  }
  return result.lawyer;
}

export async function getMyEarnings() {
  const response = await authFetch(`${API_BASE_URL}/lawyers/profile/me/earnings`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch earnings summary");
  }
  return result;
}

export async function getMyLawyerApplication() {
  const response = await authFetch(`${API_BASE_URL}/lawyers/application/status`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch application status");
  }
  return result.application;
}

export async function getAuthorizedClientDetail(clientId) {
  const response = await authFetch(`${API_BASE_URL}/lawyers/clients/${clientId}`, {
    method: "GET",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Unable to fetch client details");
  }
  return result;
}



