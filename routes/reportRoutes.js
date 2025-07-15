const express = require("express");
const router = express.Router();

const {
  getUserReport,
  getMonthlyActivity,
  getAdminOverview,
} = require("../controllers/reportController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Endpoints related to user and admin reports
 */

/**
 * @swagger
 * /reports/me:
 *   get:
 *     summary: Get the authenticated user's performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 performance:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getUserReport);

/**
 * @swagger
 * /reports/activity:
 *   get:
 *     summary: Get user activity for a specific month
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: "2023-06"
 *         description: The month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Monthly activity data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: string
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid month format
 *       401:
 *         description: Unauthorized
 */
router.get("/activity", authMiddleware, getMonthlyActivity);

/**
 * @swagger
 * /reports/admin/overview:
 *   get:
 *     summary: Get an overview of platform-wide statistics (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 activeUsers:
 *                   type: integer
 *                 revenue:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get(
  "/admin/overview",
  [authMiddleware, roleMiddleware("admin")],
  getAdminOverview
);

module.exports = router;