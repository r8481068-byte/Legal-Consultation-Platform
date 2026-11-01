const rawBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Calls backend /api/auth/refresh to obtain a fresh access token using the stored refresh token.
 */
export async function refreshAccessTokenApi() {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.accessToken) {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    throw new Error(data.message || "Session expired. Please log in again.");
  }

  sessionStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
}

/**
 * Authenticated fetch with automatic token refresh on 401 Unauthorized responses.
 */
export async function authFetch(url, options = {}) {
  let token = sessionStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 Unauthorized occurs, attempt to refresh the token using the refresh token
  if (response.status === 401) {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessTokenApi();
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request with the new access token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          return await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        } catch (refreshErr) {
          isRefreshing = false;
          refreshSubscribers = [];
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("user");
          throw new Error("Session expired. Please log in again.");
        }
      } else {
        // Wait for active refresh to complete and retry
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken) => {
            try {
              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              };
              const retryResponse = await fetch(url, {
                ...options,
                headers: retryHeaders,
              });
              resolve(retryResponse);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }
  }

  return response;
}
