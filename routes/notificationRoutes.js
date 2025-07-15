const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management and retrieval
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Notification data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - userId
 *             properties:
 *               message:
 *                 type: string
 *                 example: "You have a new proposal"
 *               userId:
 *                 type: string
 *                 example: "64b2fc1c6b3f0e9d7427a812"
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createNotification);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64b2fcd76b3f0e9d7427a825"
 *                   message:
 *                     type: string
 *                     example: "Your contract was approved"
 *                   read:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-14T15:32:00.000Z"
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *           example: "64b2fcd76b3f0e9d7427a825"
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", authMiddleware, markAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *           example: "64b2fcd76b3f0e9d7427a825"
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;