/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: API endpoints for managing contracts and milestones
 */

const express = require("express");
const router = express.Router();

const {
  createContract,
  approveContract,
  rejectContract,
  updateContractStatus,
  createMilestoneForContract,
  getContractsForUser,
  getSingleContract,
  deleteContract,
} = require("../controllers/contractController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Contract creation payload
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - freelancerId
 *               - terms
 *               - startDate
 *               - endDate
 *             properties:
 *               jobId:
 *                 type: string
 *               freelancerId:
 *                 type: string
 *               terms:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Contract created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate contract
 */
router.post("/", authMiddleware, createContract);

/**
 * @swagger
 * /contracts/{id}/approve:
 *   patch:
 *     summary: Approve a contract as freelancer
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract approved
 *       400:
 *         description: Already approved or invalid
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.patch("/:id/approve", authMiddleware, approveContract);

/**
 * @swagger
 * /contracts/{id}/reject:
 *   patch:
 *     summary: Reject a contract as freelancer
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract rejected
 *       400:
 *         description: Invalid state
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.patch("/:id/reject", authMiddleware, rejectContract);

/**
 * @swagger
 * /contracts/{id}/status:
 *   patch:
 *     summary: Update the status of a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: New status to apply
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paused, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.patch("/:id/status", authMiddleware, updateContractStatus);

/**
 * @swagger
 * /contracts/{id}/milestones:
 *   post:
 *     summary: Add a milestone to a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Milestone data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Milestone created
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Contract not found
 */
router.post("/:id/milestones", authMiddleware, createMilestoneForContract);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get contracts for current user
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contracts
 */
router.get("/", authMiddleware, getContractsForUser);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get a specific contract by ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get("/:id", authMiddleware, getSingleContract);

/**
 * @swagger
 * /contracts/{id}:
 *   delete:
 *     summary: Delete a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Contract not found
 */
router.delete("/:id", authMiddleware, deleteContract);

module.exports = router;