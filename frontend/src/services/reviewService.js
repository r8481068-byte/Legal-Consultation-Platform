const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Review request failed");
  }
  return data;
};

// Create a review for a completed appointment
export const createReview = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};

// Get reviews submitted by logged-in client
export const getMyReviews = async () => {
  const response = await fetch(`${API_BASE_URL}/reviews/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get approved reviews for a lawyer
export const getLawyerReviews = async (lawyerId, params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.limit) searchParams.append("limit", params.limit);

  const response = await fetch(
    `${API_BASE_URL}/reviews/lawyer/${lawyerId}?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );
  return handleResponse(response);
};

// Get review status / eligibility for an appointment
export const getAppointmentReviewStatus = async (appointmentId) => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/appointment/${appointmentId}/status`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

// Admin: Get all reviews
export const adminGetReviews = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.status) searchParams.append("status", params.status);

  const response = await fetch(
    `${API_BASE_URL}/reviews/admin/all?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

// Admin: Moderate review
export const adminModerateReview = async (reviewId, status, moderationReason = "") => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/admin/${reviewId}/moderate`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, moderationReason }),
    }
  );
  return handleResponse(response);
};
