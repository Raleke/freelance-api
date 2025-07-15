/**
 * @swagger
 * tags:
 *   name: Milestones
 *   description: Endpoints for managing project/job milestones
 */

const express = require("express");
const router = express.Router();

const {
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getJobMilestones,
} = require("../controllers/milestoneController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * /milestones/{jobId}:
 *   post:
 *     summary: Add milestone to a job (Client only)
 *     tags: [Milestones]
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
 *       description: Milestone details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *               - amount
 *             properties:
 *               title:
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
 *         description: Only clients can create milestones
 *       404:
 *         description: Job not found
 */
router.post("/:jobId", authMiddleware, roleMiddleware("client"), addMilestone);

/**
 * @swagger
 * /milestones/job/{jobId}/{milestoneId}:
 *   put:
 *     summary: Update an existing milestone (Client or Freelancer)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone ID
 *     requestBody:
 *       required: true
 *       description: Fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Milestone updated
 *       404:
 *         description: Milestone or Job not found
 */
router.put("/job/:jobId/:milestoneId", authMiddleware, updateMilestone);

/**
 * @swagger
 * /milestones/{jobId}/{milestoneId}:
 *   delete:
 *     summary: Delete a milestone (Client only)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone ID
 *     responses:
 *       200:
 *         description: Milestone deleted
 *       403:
 *         description: Only client can delete milestones
 *       404:
 *         description: Job or milestone not found
 */
router.delete("/:jobId/:milestoneId", authMiddleware, roleMiddleware("client"), deleteMilestone);

/**
 * @swagger
 * /milestones/job/{jobId}:
 *   get:
 *     summary: Get all milestones for a specific job
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of milestones returned
 */
router.get("/job/:jobId", authMiddleware, getJobMilestones);

module.exports = router;