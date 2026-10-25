const express = require("express");

const {
  createLawyerProfile,
  getMyLawyerProfile,
  updateLawyerProfile,
  searchLawyers,
  getPendingLawyers,
  verifyLawyer,
  getLawyerById,
  applyAsLawyer,
  getMyLawyerApplication
} = require("../controllers/lawyerController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public search
router.get("/", searchLawyers);

// Client-only lawyer application & status routes
router.get(
  "/application/status",
  protect,
  authorize("client"),
  getMyLawyerApplication
);

router.post(
  "/apply",
  protect,
  authorize("client"),
  applyAsLawyer
);

router.get("/:lawyerId", getLawyerById);

// Admin-only verification routes
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  getPendingLawyers
);

router.patch(
  "/admin/:lawyerId/verification",
  protect,
  authorize("admin"),
  verifyLawyer
);

// Lawyer-only profile routes
router.use(protect, authorize("lawyer"));

const { getMyEarnings } = require("../controllers/lawyerController");

router.post("/profile", createLawyerProfile);
router.get("/profile/me", getMyLawyerProfile);
router.patch("/profile/me", updateLawyerProfile);
router.get("/profile/me/earnings", getMyEarnings);

module.exports = router;
