const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = err.statusCode || 500;

  // Upstream third-party/gateway 401s must never leak to clients as client-auth failures
  if (statusCode === 401 && (err.code?.startsWith("PAYMENT_GATEWAY") || err.error?.code === "BAD_REQUEST_ERROR" || !err.message)) {
    statusCode = 502;
  }

  const message =
    err.message ||
    err.error?.description ||
    "Internal server error";

  const payload = {
    success: false,
    message
  };

  if (err.code) payload.code = err.code;
  if (err.eligibility) payload.eligibility = err.eligibility;

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;