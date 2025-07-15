const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
} = require("../controllers/jobController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management and operations
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a job (Client only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Job data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *             required:
 *               - title
 *               - description
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, roleMiddleware("client"), createJob);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with filters
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get("/:id", authMiddleware, getJobById);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update job (Client only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Job update data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Job updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.put("/:id", authMiddleware, roleMiddleware("client"), updateJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete job (Client only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.delete("/:id", authMiddleware, roleMiddleware("client"), deleteJob);

/**
 * @swagger
 * /jobs/{id}/status:
 *   patch:
 *     summary: Update job status (pause, close, reopen)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Status update data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pause, close, reopen]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Job status updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.patch("/:id/status", authMiddleware, roleMiddleware("client"), updateJobStatus);

module.exports = router;
