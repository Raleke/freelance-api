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

// Create a new notification (for system events or admin/manual triggering)
router.post("/", authMiddleware, createNotification);

// Get all notifications for the current user
router.get("/", authMiddleware, getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

// Delete a notification
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;