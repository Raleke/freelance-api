/**
 * @swagger
 * tags:
 *   name: Disputes
 *   description: API for dispute creation, retrieval, and resolution
 */

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

/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Create a new dispute (Client or Freelancer)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Submit a dispute related to a contract or milestone
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractId
 *               - reason
 *               - description
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: Contract related to the dispute
 *               reason:
 *                 type: string
 *                 description: Reason/title of the dispute
 *               description:
 *                 type: string
 *                 description: Detailed explanation of the dispute
 *               milestoneId:
 *                 type: string
 *                 description: Optional milestone ID involved
 *     responses:
 *       201:
 *         description: Dispute created successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.post("/", authMiddleware, createDispute);

/**
 * @swagger
 * /disputes/my:
 *   get:
 *     summary: Get disputes for current user
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's disputes
 */
router.get("/my", authMiddleware, getUserDisputes);

/**
 * @swagger
 * /disputes:
 *   get:
 *     summary: Get all disputes (Admin only)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all disputes
 *       403:
 *         description: Forbidden (Admin access required)
 */
router.get("/", authMiddleware, roleMiddleware("admin"), getAllDisputes);

/**
 * @swagger
 * /disputes/{id}:
 *   get:
 *     summary: Get a specific dispute by ID
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Dispute ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispute details retrieved
 *       404:
 *         description: Dispute not found
 */
router.get("/:id", authMiddleware, getSingleDispute);

/**
 * @swagger
 * /disputes/{id}/status:
 *   patch:
 *     summary: Update dispute status (Admin only)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Dispute ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: New dispute status and optional resolution
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, resolved, closed]
 *                 example: resolved
 *               resolution:
 *                 type: string
 *                 description: Explanation of the resolution
 *                 example: Payment refunded by admin after investigation.
 *     responses:
 *       200:
 *         description: Dispute status updated
 *       404:
 *         description: Dispute not found
 */
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), updateDisputeStatus);

module.exports = router;