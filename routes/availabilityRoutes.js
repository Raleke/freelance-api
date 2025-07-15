/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Manage user availability, export iCal, and send via email
 */

const express = require("express");
const router = express.Router();

const {
  setAvailability,
  getAvailability,
  deleteAvailability,
  exportICal,
  sendICalEmail,
} = require("../controllers/availabilityController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Set availability for authenticated user
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Time range to set as available
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start
 *               - end
 *             properties:
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T09:00:00Z"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T17:00:00Z"
 *     responses:
 *       200:
 *         description: Availability set successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", authMiddleware, setAvailability);

/**
 * @swagger
 * /availability:
 *   get:
 *     summary: Get all availability entries for the current user
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of availability entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 */
router.get("/", authMiddleware, getAvailability);

/**
 * @swagger
 * /availability/{id}:
 *   delete:
 *     summary: Delete a specific availability entry by ID
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the availability entry to delete
 *     responses:
 *       200:
 *         description: Availability deleted successfully
 *       404:
 *         description: Availability not found
 */
router.delete("/:id", authMiddleware, deleteAvailability);

/**
 * @swagger
 * /availability/ical:
 *   get:
 *     summary: Export availability as an iCal file
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: iCal file downloaded
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/ical", authMiddleware, exportICal);

/**
 * @swagger
 * /availability/ical/email:
 *   post:
 *     summary: Email the user's availability as an iCal file
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Email address to send iCal to
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: iCal sent to email successfully
 *       400:
 *         description: Validation error or email issue
 */
router.post("/ical/email", authMiddleware, sendICalEmail);

module.exports = router;