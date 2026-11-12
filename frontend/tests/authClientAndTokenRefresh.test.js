/**
 * LegalConnect Phase 4: Shared Authentication Client & Token Refresh Test Suite
 *
 * Covers:
 * 1. Admin service request using shared authFetch.
 * 2. Notification service request using shared authFetch.
 * 3. Review service request using shared authFetch.
 * 4. Expired access token and successful refresh with transparent retry.
 * 5. Failed refresh and existing logout/storage cleanup behavior.
 * 6. Concurrent 401 requests handled by single refresh coordination.
 * 7. No infinite retry loop on persistent 401.
 * 8. Existing request payloads, endpoints, and response contracts remain unchanged.
 *
 * Run with:
 *   node --test frontend/tests/authClientAndTokenRefresh.test.js
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Setup global sessionStorage before importing services
const storage = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

import { authFetch, API_BASE_URL, refreshAccessTokenApi } from "../src/services/apiClient.js";
import {
  getAdminMetrics,
  getAdminClients,
  toggleClientBlock,
  cancelAdminAppointment
} from "../src/services/adminService.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../src/services/notificationService.js";
import {
  createReview,
  getMyReviews,
  getLawyerReviews,
  getAppointmentReviewStatus,
  adminGetReviews,
  adminModerateReview
} from "../src/services/reviewService.js";

describe("Phase 4: Shared Authentication Client & Token Refresh", () => {
  let originalFetch;

  beforeEach(() => {
    storage.clear();
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    storage.clear();
  });

  // Helper to create a mock Response object
  function mockResponse(data, status = 200, ok = true) {
    return {
      status,
      ok,
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  }

  // =========================================================================
  // 1. ADMIN SERVICE REQUESTS USING SHARED authFetch
  // =========================================================================
  test("1. Admin service requests use shared authFetch and automatically include Authorization header", async () => {
    sessionStorage.setItem("accessToken", "admin_secret_token_123");

    let capturedUrl = null;
    let capturedOptions = null;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return mockResponse({ success: true, metrics: { totalUsers: 42 } });
    };

    const result = await getAdminMetrics({ range: "30d" });

    assert.ok(capturedUrl.includes("/admin/metrics?range=30d"));
    assert.equal(capturedOptions.method, "GET");
    assert.equal(capturedOptions.headers["Authorization"], "Bearer admin_secret_token_123");
    assert.equal(capturedOptions.headers["Content-Type"], "application/json");
    assert.deepEqual(result, { success: true, metrics: { totalUsers: 42 } });

    // Test PATCH with payload
    let capturedPatchBody = null;
    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      capturedPatchBody = JSON.parse(options.body);
      return mockResponse({ success: true, message: "Client blocked" });
    };

    const blockResult = await toggleClientBlock("client_abc", true, "Terms violation");
    assert.ok(capturedUrl.includes("/admin/clients/client_abc/block"));
    assert.equal(capturedOptions.method, "PATCH");
    assert.equal(capturedOptions.headers["Authorization"], "Bearer admin_secret_token_123");
    assert.deepEqual(capturedPatchBody, { isBlocked: true, blockReason: "Terms violation" });
    assert.equal(blockResult.success, true);
  });

  // =========================================================================
  // 2. NOTIFICATION SERVICE REQUESTS USING SHARED authFetch
  // =========================================================================
  test("2. Notification service requests use shared authFetch with proper verbs and endpoints", async () => {
    sessionStorage.setItem("accessToken", "client_jwt_token_456");

    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, method: options.method, auth: options.headers["Authorization"] });
      return mockResponse({ success: true, notifications: [] });
    };

    await getNotifications();
    await markNotificationRead("notif_789");
    await markAllNotificationsRead();

    assert.equal(calls.length, 3);
    assert.ok(calls[0].url.endsWith("/notifications"));
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[0].auth, "Bearer client_jwt_token_456");

    assert.ok(calls[1].url.endsWith("/notifications/notif_789/read"));
    assert.equal(calls[1].method, "PATCH");
    assert.equal(calls[1].auth, "Bearer client_jwt_token_456");

    assert.ok(calls[2].url.endsWith("/notifications/read-all"));
    assert.equal(calls[2].method, "PATCH");
    assert.equal(calls[2].auth, "Bearer client_jwt_token_456");
  });

  // =========================================================================
  // 3. REVIEW SERVICE REQUESTS USING SHARED authFetch & PUBLIC FETCH RETENTION
  // =========================================================================
  test("3. Review service uses authFetch for client/admin routes, and retains public fetch for lawyer reviews", async () => {
    sessionStorage.setItem("accessToken", "user_jwt_token_789");

    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, method: options.method, headers: options?.headers });
      return mockResponse({ success: true, reviews: [] });
    };

    // Authenticated calls
    await createReview({ lawyerId: "lawyer_1", rating: 5, reviewText: "Superb advice" });
    await getMyReviews();
    await getAppointmentReviewStatus("app_100");
    await adminGetReviews({ status: "pending" });
    await adminModerateReview("rev_1", "approved", "Valid");

    assert.equal(calls.length, 5);
    for (const call of calls) {
      assert.equal(call.headers["Authorization"], "Bearer user_jwt_token_789");
    }

    // Public call: getLawyerReviews does NOT require auth headers
    calls.length = 0;
    await getLawyerReviews("lawyer_1", { page: 1, limit: 10 });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes("/reviews/lawyer/lawyer_1"));
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[0].headers?.["Authorization"], undefined, "Public route must not mandate auth header");
  });

  // =========================================================================
  // 4. EXPIRED ACCESS TOKEN & SUCCESSFUL REFRESH
  // =========================================================================
  test("4. Expired access token triggers /auth/refresh and seamlessly retries the original request", async () => {
    sessionStorage.setItem("accessToken", "expired_access_token");
    sessionStorage.setItem("refreshToken", "valid_stored_refresh_token");

    const fetchHistory = [];

    globalThis.fetch = async (url, options) => {
      fetchHistory.push({ url, options });

      // 1. Initial request with expired token -> returns 401
      if (url.includes("/admin/metrics") && options.headers?.["Authorization"] === "Bearer expired_access_token") {
        return mockResponse({ message: "Token expired" }, 401, false);
      }

      // 2. Token refresh request
      if (url.includes("/auth/refresh")) {
        const body = JSON.parse(options.body);
        if (body.refreshToken === "valid_stored_refresh_token") {
          return mockResponse({
            success: true,
            accessToken: "newly_minted_access_token",
            refreshToken: "rotated_refresh_token"
          });
        }
        return mockResponse({ message: "Invalid refresh" }, 401, false);
      }

      // 3. Retried request with the new access token -> returns 200
      if (url.includes("/admin/metrics") && options.headers?.["Authorization"] === "Bearer newly_minted_access_token") {
        return mockResponse({ success: true, metrics: { activeCases: 15 } });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    };

    const data = await getAdminMetrics();

    // Verify 3 network calls took place: initial (401) -> refresh (200) -> retry (200)
    assert.equal(fetchHistory.length, 3);
    assert.ok(fetchHistory[0].url.includes("/admin/metrics"));
    assert.equal(fetchHistory[0].options.headers["Authorization"], "Bearer expired_access_token");

    assert.ok(fetchHistory[1].url.includes("/auth/refresh"));
    assert.equal(fetchHistory[1].options.method, "POST");

    assert.ok(fetchHistory[2].url.includes("/admin/metrics"));
    assert.equal(fetchHistory[2].options.headers["Authorization"], "Bearer newly_minted_access_token");

    // Verify storage was updated with both new access token and rotated refresh token
    assert.equal(sessionStorage.getItem("accessToken"), "newly_minted_access_token");
    assert.equal(sessionStorage.getItem("refreshToken"), "rotated_refresh_token");

    // Verify original caller received the final response data
    assert.deepEqual(data, { success: true, metrics: { activeCases: 15 } });
  });

  // =========================================================================
  // 5. FAILED REFRESH AND EXISTING LOGOUT BEHAVIOR
  // =========================================================================
  test("5. Failed refresh clears sessionStorage and throws session expiry error", async () => {
    sessionStorage.setItem("accessToken", "expired_access_token");
    sessionStorage.setItem("refreshToken", "revoked_refresh_token");
    sessionStorage.setItem("user", JSON.stringify({ name: "Admin" }));

    globalThis.fetch = async (url) => {
      if (url.includes("/admin/metrics")) {
        return mockResponse({ message: "Token expired" }, 401, false);
      }
      if (url.includes("/auth/refresh")) {
        return mockResponse({ message: "Refresh token expired" }, 401, false);
      }
      return mockResponse({}, 500, false);
    };

    let caughtError = null;
    try {
      await getAdminMetrics();
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError);
    assert.match(caughtError.message, /Session expired\. Please log in again/i);

    // Verify sessionStorage was sanitized to force user re-login
    assert.equal(sessionStorage.getItem("accessToken"), null);
    assert.equal(sessionStorage.getItem("refreshToken"), null);
    assert.equal(sessionStorage.getItem("user"), null);
  });

  // =========================================================================
  // 6. CONCURRENT 401 REQUESTS (SINGLE REFRESH COORDINATION)
  // =========================================================================
  test("6. Multiple concurrent 401 requests trigger only ONE refresh call and all resolve successfully", async () => {
    sessionStorage.setItem("accessToken", "stale_token");
    sessionStorage.setItem("refreshToken", "active_refresh_token");

    let refreshCallCount = 0;

    globalThis.fetch = async (url, options) => {
      // Refresh endpoint
      if (url.includes("/auth/refresh")) {
        refreshCallCount++;
        // Small delay to simulate async network latency
        await new Promise((r) => setTimeout(r, 20));
        return mockResponse({
          success: true,
          accessToken: "coordinated_fresh_token"
        });
      }

      // Initial calls with stale token fail with 401
      if (options.headers?.["Authorization"] === "Bearer stale_token") {
        return mockResponse({ message: "Token expired" }, 401, false);
      }

      // Retried calls with coordinated fresh token succeed
      if (options.headers?.["Authorization"] === "Bearer coordinated_fresh_token") {
        if (url.includes("/admin/metrics")) {
          return mockResponse({ success: true, metrics: {} });
        }
        if (url.includes("/notifications")) {
          return mockResponse({ success: true, notifications: [] });
        }
        if (url.includes("/reviews/my")) {
          return mockResponse({ success: true, reviews: [] });
        }
      }

      return mockResponse({}, 404, false);
    };

    // Fire 3 simultaneous authenticated requests
    const [metricsRes, notifsRes, reviewsRes] = await Promise.all([
      getAdminMetrics(),
      getNotifications(),
      getMyReviews()
    ]);

    // All three must succeed
    assert.ok(metricsRes.success);
    assert.ok(notifsRes.success);
    assert.ok(reviewsRes.success);

    // EXACTLY 1 refresh call must have occurred for all 3 concurrent requests
    assert.equal(refreshCallCount, 1, "Exactly one refresh request must be sent for concurrent 401s");
    assert.equal(sessionStorage.getItem("accessToken"), "coordinated_fresh_token");
  });

  // =========================================================================
  // 7. NO INFINITE RETRY LOOP ON PERSISTENT 401
  // =========================================================================
  test("7. Persistent 401 on retry does NOT trigger infinite refresh loops", async () => {
    sessionStorage.setItem("accessToken", "token_a");
    sessionStorage.setItem("refreshToken", "refresh_a");

    let metricsAttempts = 0;
    let refreshAttempts = 0;

    globalThis.fetch = async (url) => {
      if (url.includes("/admin/metrics")) {
        metricsAttempts++;
        // Server continues returning 401 (e.g. user revoked/blocked)
        return mockResponse({ message: "Unauthorized account" }, 401, false);
      }
      if (url.includes("/auth/refresh")) {
        refreshAttempts++;
        return mockResponse({ success: true, accessToken: "token_b" });
      }
      return mockResponse({}, 500, false);
    };

    let caughtErr = null;
    try {
      await getAdminMetrics();
    } catch (err) {
      caughtErr = err;
    }

    assert.ok(caughtErr);
    // Initial attempt + 1 retry = exactly 2 calls to /admin/metrics
    assert.equal(metricsAttempts, 2);
    // Exactly 1 refresh call
    assert.equal(refreshAttempts, 1);
  });

  // =========================================================================
  // 8. REQUEST PAYLOADS, ENDPOINTS, AND RESPONSE CONTRACTS PRESERVED
  // =========================================================================
  test("8. Request payloads, query parameters, endpoints, and error response contracts remain unchanged", async () => {
    sessionStorage.setItem("accessToken", "valid_token");

    let sentUrl = null;
    let sentMethod = null;
    let sentBody = null;

    globalThis.fetch = async (url, options) => {
      sentUrl = url;
      sentMethod = options.method;
      sentBody = options.body ? JSON.parse(options.body) : null;
      return mockResponse({
        success: true,
        appointmentId: "app_999",
        status: "cancelled",
        message: "Appointment cancelled successfully"
      });
    };

    const cancelRes = await cancelAdminAppointment("app_999", "Advocate conflict");
    assert.ok(sentUrl.endsWith("/admin/appointments/app_999/cancel"));
    assert.equal(sentMethod, "PATCH");
    assert.deepEqual(sentBody, { reason: "Advocate conflict" });
    assert.equal(cancelRes.status, "cancelled");

    // Verify error response message extraction contract
    globalThis.fetch = async () => {
      return mockResponse({ message: "Appointment already cancelled" }, 400, false);
    };

    let errContract = null;
    try {
      await cancelAdminAppointment("app_999", "Reason");
    } catch (err) {
      errContract = err;
    }
    assert.equal(errContract?.message, "Appointment already cancelled");
  });
});

