const Notification = require("../models/Notification");
const logger = require("../utils/logger");
const { getSocketIO } = require("../utils/socket");


const createNotification = async (req, res, next) => {
  try {
    const { recipientId, type, message, link } = req.body;

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      message,
      link,
    });

    const io = getSocketIO();
    io.to(recipientId).emit("notification", notification);

    logger.info(`Notification sent to user ${recipientId} of type ${type}`);
    res.status(201).json({ msg: "Notification created", notification });
  } catch (err) {
    logger.error("Error creating notification", err);
    next(err);
  }
};


const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    logger.info(`Fetched notifications for user ${req.user.id}`);
    res.json({ notifications });
  } catch (err) {
    logger.error("Error fetching notifications", err);
    next(err);
  }
};


const mongoose = require("mongoose");

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid notification id: ${id}`);
      return res.status(400).json({ msg: "Invalid notification id" });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      logger.warn(`Notification not found or unauthorized: ${id}`);
      return res.status(404).json({ msg: "Notification not found" });
    }

    logger.info(`Notification ${id} marked as read by user ${req.user.id}`);
    res.json({ msg: "Marked as read", notification });
  } catch (err) {
    logger.error("Error marking notification as read", err);
    next(err);
  }
};


const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true });

    logger.info(`All notifications marked as read for user ${req.user.id}`);
    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    logger.error("Error marking all notifications as read", err);
    next(err);
  }
};


const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid notification id: ${id}`);
      return res.status(400).json({ msg: "Invalid notification id" });
    }

    const result = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user.id,
    });

    if (!result) {
      logger.warn(`Delete failed. Notification not found: ${id}`);
      return res.status(404).json({ msg: "Notification not found" });
    }

    logger.info(`Notification ${id} deleted by user ${req.user.id}`);
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    logger.error("Error deleting notification", err);
    next(err);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};