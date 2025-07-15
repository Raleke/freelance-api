const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Retrieve dashboard statistics for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usersCount:
 *                   type: integer
 *                   example: 150
 *                 activeJobs:
 *                   type: integer
 *                   example: 42
 *                 revenue:
 *                   type: number
 *                   format: float
 *                   example: 12500.75
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only admin can access this route
 */
router.get("/dashboard", authMiddleware, roleMiddleware("admin"), getDashboardStats);

module.exports = router;