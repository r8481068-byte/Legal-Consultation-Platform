const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/**
 * Helper to safely parse API responses, supporting JSON and non-JSON payloads.
 */
async function handleResponse(response) {
  let data = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const rawText = await response.text().catch(() => "");
    if (!response.ok) {
      throw new Error(
        rawText ||
          `Server responded with status ${response.status} (${response.statusText || "Error"})`
      );
    }
  }

  if (!response.ok) {
    let errorMessage = data?.message;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMessage = data.errors
        .map((e) => e.msg || e.message)
        .filter(Boolean)
        .join(". ");
    } else if (!errorMessage && data?.error) {
      errorMessage =
        typeof data.error === "string" ? data.error : data.error?.message;
    }
    const err = new Error(errorMessage || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function registerUser(userData) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  } catch {
    throw new Error(
      "Unable to connect to the authentication server. Please check your network and verify the backend is running."
    );
  }

  return handleResponse(response);
}

export async function loginUser(credentials) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error(
      "Unable to connect to the authentication server. Please check your network and verify the backend is running."
    );
  }

  return handleResponse(response);
}

export async function logoutUser(refreshToken) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new Error("Unable to connect to the authentication server for logout.");
  }

  return handleResponse(response);
}

export async function getCurrentUser() {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(response);
}

export async function updateProfile(data) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function changePassword(passwords) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(passwords),
  });
  return handleResponse(response);
}

export async function requestPasswordReset(email) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("Unable to connect to the authentication server.");
  }
  return handleResponse(response);
}

export async function resetPasswordWithToken({ token, password }) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });
  } catch {
    throw new Error("Unable to connect to the authentication server.");
  }
  return handleResponse(response);
}

/**
 * ==========================================
 * Verification Services (Resend & MSG91)
 * ==========================================
 */

export async function requestEmailOtp(payload = {}) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/verify-email/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function verifyEmailOtp(payload) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/verify-email/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function requestPhoneOtp(payload = {}) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/verify-phone/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function verifyPhoneOtp(payload) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/verify-phone/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getVerificationStatus(userId = null) {
  const token = sessionStorage.getItem("accessToken");
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const response = await fetch(`${API_BASE_URL}/auth/verification-status${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(response);
}

/**
 * ==========================================
 * Client Profile & Identity Services
 * ==========================================
 */

export async function getClientProfileCompletion() {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/profile-completion`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(response);
}

export async function updateClientAddress(addressData) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/client-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(addressData),
  });
  return handleResponse(response);
}

export async function updateClientIdentity({ aadhaar, pan }) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/auth/client-identity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ aadhaar, pan }),
  });
  return handleResponse(response);
}

/**
 * Centralized Booking Eligibility Check
 */
export async function getBookingEligibility() {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/appointments/eligibility`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(response);
}
