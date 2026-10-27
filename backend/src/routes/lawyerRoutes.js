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
const { getMyEarnings, getAuthorizedClientDetail } = require("../controllers/lawyerController");

router.post("/profile", protect, authorize("lawyer"), createLawyerProfile);
router.get("/profile/me", protect, authorize("lawyer"), getMyLawyerProfile);
router.patch("/profile/me", protect, authorize("lawyer"), updateLawyerProfile);
router.put("/profile/me", protect, authorize("lawyer"), updateLawyerProfile);
router.get("/me", protect, authorize("lawyer"), getMyLawyerProfile);
router.patch("/me", protect, authorize("lawyer"), updateLawyerProfile);
router.put("/me", protect, authorize("lawyer"), updateLawyerProfile);
router.get("/profile/me/earnings", protect, authorize("lawyer"), getMyEarnings);
router.get("/clients/:clientId", protect, authorize("lawyer"), getAuthorizedClientDetail);

// Public single lawyer profile (defined last to prevent parameterized collision)
router.get("/:lawyerId", getLawyerById);

module.exports = router;
