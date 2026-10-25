const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
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

    // Temporary debugging: inspect the JWT payload keys.
    console.log("JWT payload keys:", Object.keys(decoded));
    console.log("JWT user ID fields:", {
      id: decoded.id,
      _id: decoded._id,
      userId: decoded.userId,
      role: decoded.role,
    });

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token does not contain a user ID",
      });
    }

    req.user = {
      ...decoded,
      _id: userId,
      id: userId,
      userId: userId,
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
