import { authFetch, API_BASE_URL } from "./apiClient";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Payment request failed");
  }

  return data;
};

// Create Razorpay payment order for an appointment
export const createPaymentOrder = async (appointmentId) => {
  const response = await authFetch(`${API_BASE_URL}/payments/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointmentId }),
  });

  return handleResponse(response);
};

// Verify Razorpay payment signature
export const verifyPayment = async (verificationData) => {
  const response = await authFetch(`${API_BASE_URL}/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verificationData),
  });

  return handleResponse(response);
};

// Dynamically load the Razorpay checkout script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
