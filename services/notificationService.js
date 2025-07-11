const Notification = require("../models/Notification");
const { getSocketIO } = require("../utils/socket");

const createNotification = async ({ userId, type, message, data }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    data,
  });

  // emit to socket room
  const io = getSocketIO();
  io.to(userId.toString()).emit("notification", notification);

  return notification;
};

module.exports = { createNotification };