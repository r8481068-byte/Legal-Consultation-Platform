const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("JWT_SECRET environment variable is required in production");
      error.statusCode = 500;
      error.code = "JWT_SECRET_MISSING";
      throw error;
    }

    if (process.env.NODE_ENV !== "test") {
      const error = new Error(
        "JWT_SECRET environment variable is required in development. " +
        "Please set JWT_SECRET in your backend/.env file."
      );
      error.statusCode = 500;
      error.code = "JWT_SECRET_MISSING";
      throw error;
    }
  }

  return jwt.sign(
    {
      userId: user._id || user.id,
      role: user.role
    },
    secret || "test_jwt_secret_isolated_unit_tests_only",
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};