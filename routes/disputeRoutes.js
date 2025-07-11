const express = require("express");
const router = express.Router();

const {
  createDispute,
  getUserDisputes,
  getAllDisputes,
  updateDisputeStatus,
  getSingleDispute,
} = require("../controllers/disputeController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");



// Create a new dispute (client or freelancer)
router.post("/", authMiddleware, createDispute);

// Get disputes of logged-in user
router.get("/my", authMiddleware, getUserDisputes);

// Admin-only: Get all disputes
router.get("/", authMiddleware, roleMiddleware("admin"), getAllDisputes);

// Get single dispute
router.get("/:id", authMiddleware, getSingleDispute);

// Admin-only: update dispute status 
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), updateDisputeStatus);

module.exports = router;