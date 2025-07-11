const express = require("express");
const router = express.Router();

const {
  submitProposal,
  getJobProposals,
  getMyProposals,
  respondToProposal,
  deleteProposal,
} = require("../controllers/proposalController");

const authMiddleware = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");



// Freelancer submits a proposal to a job
router.post("/:jobId", authMiddleware, submitProposal);

// Client views proposals submitted for a specific job
router.get("/job/:jobId", authMiddleware, getJobProposals);

// Freelancer views their own proposals
router.get("/me", authMiddleware, getMyProposals);

// Client accepts or rejects a proposal
router.put("/:proposalId/respond", authMiddleware, respondToProposal);

router.delete("/:proposalId", authMiddleware, deleteProposal);

module.exports = router;