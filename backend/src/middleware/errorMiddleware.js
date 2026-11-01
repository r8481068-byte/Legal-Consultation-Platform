const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;

  const payload = {
    success: false,
    message: err.message || "Internal server error"
  };

  if (err.code) payload.code = err.code;
  if (err.eligibility) payload.eligibility = err.eligibility;

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;