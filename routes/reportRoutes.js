const express = require("express");
const router = express.Router();

const {
  getUserReport,
  getMonthlyActivity,
  getAdminOverview,
} = require("../controllers/reportController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware"); // To restrict admin route



//  Authenticated user gets their performance report
router.get("/me", authMiddleware, getUserReport);

// User’s activity in a given month
router.get("/activity", authMiddleware, getMonthlyActivity);

//  Admin-only: platform-wide stats and overview
router.get("/admin/overview", authMiddleware, roleMiddleware("admin"), getAdminOverview);

module.exports = router;