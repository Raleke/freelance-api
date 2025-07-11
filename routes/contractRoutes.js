const express = require("express");
const router = express.Router();
const {
  createContract,
  approveContract,
  updateContractStatus,
  createMilestoneForContract,
  getContractsForUser,
  getSingleContract,
  deleteContract,
  rejectContract,
} = require("../controllers/contractController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware"); 


// Create contract (typically by client)
router.post("/", authMiddleware, createContract);

// Freelancer approves a contract
router.patch("/:id/approve", authMiddleware, approveContract);

router.patch("/:id/reject", authMiddleware, rejectContract);

// Update status (pause, complete, cancel)
router.patch("/:id/status", authMiddleware, updateContractStatus);

// Create a milestone under a contract
router.post("/:id/milestones", authMiddleware, createMilestoneForContract);

// Get all contracts for the current user (client/freelancer)
router.get("/", authMiddleware, getContractsForUser);

// Get a single contract
router.get("/:id", authMiddleware, getSingleContract);

// Delete a contract
router.delete("/:id", authMiddleware, deleteContract);

module.exports = router;