const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
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