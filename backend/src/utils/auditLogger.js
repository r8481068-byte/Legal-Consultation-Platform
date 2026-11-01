const AdminLog = require("../models/AdminLog");
const User = require("../models/User");

/**
 * Log an administrative action to MongoDB audit logs
 */
async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  description,
  details = null,
  req = null,
}) {
  try {
    let adminName = "System Administrator";
    let adminEmail = "admin@legalconnect.in";

    if (adminId) {
      const admin = await User.findById(adminId).select("name email").lean();
      if (admin) {
        adminName = admin.name || adminName;
        adminEmail = admin.email || adminEmail;
      }
    }

    let ipAddress = "";
    let userAgent = "";
    if (req) {
      ipAddress =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "";
      userAgent = req.headers["user-agent"] || "";
    }

    return await AdminLog.create({
      admin: adminId,
      adminName,
      adminEmail,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : "",
      description,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Audit log creation error:", error.message);
    // Non-blocking for primary flow
    return null;
  }
}

module.exports = { logAdminAction };
