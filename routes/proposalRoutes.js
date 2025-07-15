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

/**
 * @swagger
 * tags:
 *   name: Proposals
 *   description: Proposal management and operations
 */

/**
 * @swagger
 * /proposals/{jobId}:
 *   post:
 *     summary: Submit a proposal for a job (freelancer only)
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *     requestBody:
 *       required: true
 *       description: Proposal details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverLetter
 *               - expectedRate
 *               - estimatedTime
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 example: I'm excited to work on this project.
 *               expectedRate:
 *                 type: number
 *                 example: 1500
 *               estimatedTime:
 *                 type: string
 *                 example: 2 weeks
 *     responses:
 *       201:
 *         description: Proposal submitted
 *       400:
 *         description: Proposal already exists or invalid data
 */
router.post("/:jobId", authMiddleware, submitProposal);

/**
 * @swagger
 * /proposals/job/{jobId}:
 *   get:
 *     summary: Get all proposals submitted to a job (client only)
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *     responses:
 *       200:
 *         description: List of proposals for the job
 */
router.get("/job/:jobId", authMiddleware, getJobProposals);

/**
 * @swagger
 * /proposals/me:
 *   get:
 *     summary: Get logged-in freelancer's own proposals
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of proposals submitted by the freelancer
 */
router.get("/me", authMiddleware, getMyProposals);

/**
 * @swagger
 * /proposals/{proposalId}/respond:
 *   put:
 *     summary: Client responds to a proposal (accept or reject)
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the proposal
 *     requestBody:
 *       required: true
 *       description: Response status
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Proposal response updated
 *       403:
 *         description: Unauthorized action
 */
router.put("/:proposalId/respond", authMiddleware, respondToProposal);

/**
 * @swagger
 * /proposals/{proposalId}:
 *   delete:
 *     summary: Delete a proposal (owner only)
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the proposal
 *     responses:
 *       200:
 *         description: Proposal deleted
 *       403:
 *         description: Unauthorized
 */
router.delete("/:proposalId", authMiddleware, deleteProposal);

module.exports = router;