const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token does not contain a user ID",
      });
    }

    // Immediate database check: Block suspended/deactivated users in real-time
    const userDoc = await User.findById(userId).select("isActive isVerified emailVerified role name email");
    if (userDoc && userDoc.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated or suspended by Administrator",
      });
    }

    req.user = {
      ...decoded,
      _id: userId,
      id: userId,
      userId: userId,
      role: userDoc ? userDoc.role : decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
