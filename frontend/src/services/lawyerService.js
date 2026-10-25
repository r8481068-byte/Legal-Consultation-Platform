
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export async function applyAsLawyer(data) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/lawyers/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/lawyers/profile/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch lawyer profile");
  }
  return result.lawyer;
}

export async function updateLawyerProfile(data) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/lawyers/profile/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/lawyers/profile/me/earnings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch earnings summary");
  }
  return result;
}

export async function getMyLawyerApplication() {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/lawyers/application/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch application status");
  }
  return result.application;
}


