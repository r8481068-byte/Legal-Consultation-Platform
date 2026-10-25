const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/token");

const registerUserService = async ({
  name,
  email,
  password,
  phone
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "client"
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};


const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -__v");
  if (!user || !user.isActive) {
    const error = new Error("User account not found or inactive");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUserProfileService = async (userId, data) => {
  const allowedUpdates = ["name", "phone", "profileImage"];
  const updates = {};

  for (const field of allowedUpdates) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  // Strictly disallow role or email escalation
  delete updates.role;
  delete updates.email;
  delete updates.password;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -__v");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const changePasswordService = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    const error = new Error("Current and new password are required");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
  changePasswordService
};