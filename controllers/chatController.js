const Message = require("../models/Message");
const Group = require("../models/Group");
const { getSocketIO } = require("../utils/socket");
const logger = require("../utils/logger");

const sendMessage = async (req, res, next) => {
  try {
    const { content, recipientId, groupId } = req.body;
    const attachment = req.file?.filename;

    const message = await Message.create({
      sender: req.user.id,
      content,
      attachment,
      recipient: groupId ? undefined : recipientId,
      group: groupId || undefined,
    });

    const io = getSocketIO();
    const room = groupId || recipientId;
    io.to(room).emit("new_message", message);

    logger.info(` Message sent by ${req.user.id} to ${room}`);
    res.status(201).json({ message });
  } catch (err) {
    logger.error(" Error in sendMessage", err);
    next(err);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { recipientId, groupId } = req.query;

    const filter = groupId
      ? { group: groupId }
      : {
          $or: [
            { sender: req.user.id, recipient: recipientId },
            { sender: recipientId, recipient: req.user.id },
          ],
        };

    const messages = await Message.find(filter)
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    logger.info(` Chat history fetched by ${req.user.id}`);
    res.json({ messages });
  } catch (err) {
    logger.error(" Error in getChatHistory", err);
    next(err);
  }
};

const markSeen = async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    await Promise.all(
      messageIds.map((id) =>
        Message.updateOne(
          { _id: id, "seenBy.user": { $ne: userId } },
          { $push: { seenBy: { user: userId, seenAt: new Date() } } }
        )
      )
    );

    const io = getSocketIO();
    messageIds.forEach((id) => {
      io.emit("message_seen", { messageId: id, userId });
    });

    logger.info(` Seen status updated by ${userId} for messages: ${messageIds}`);
    res.json({ msg: "Seen status updated" });
  } catch (err) {
    logger.error(" Error in markSeen", err);
    next(err);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds, isTeam } = req.body;
    const group = await Group.create({
      name,
      members: [req.user.id, ...memberIds],
      isTeam: isTeam || false,
    });

    logger.info(`Group created: "${name}" by user ${req.user.id}`);
    res.status(201).json({ group });
  } catch (err) {
    logger.error(" Error in createGroup", err);
    next(err);
  }
};

const notifyTyping = async (req, res, next) => {
  try {
    const { to } = req.body;
    const from = req.user.id;
    const io = getSocketIO();

    io.to(to).emit("typing", { from });
    logger.info(` Typing notification from ${from} to ${to}`);

    res.json({ msg: "Typing event emitted" });
  } catch (err) {
    logger.error(" Error in notifyTyping", err);
    next(err);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate("members", "name email");

    logger.info(` Groups fetched for user ${req.user.id}`);
    res.json({ groups });
  } catch (err) {
    logger.error(" Error in getUserGroups", err);
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      logger.warn(" Attempt to delete nonexistent message");
      return res.status(404).json({ msg: "Message not found" });
    }

    if (message.sender.toString() !== req.user.id) {
      logger.warn(` Unauthorized delete attempt by ${req.user.id}`);
      return res.status(403).json({ msg: "You can only delete your own messages" });
    }

    await message.deleteOne();

    const io = getSocketIO();
    io.to(message.group || message.recipient.toString()).emit("message_deleted", { id });

    logger.info(` Message deleted by ${req.user.id}: ${id}`);
    res.json({ msg: "Message deleted" });
  } catch (err) {
    logger.error(" Error in deleteMessage", err);
    next(err);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  markSeen,
  createGroup,
  notifyTyping,
  getUserGroups,
  deleteMessage,
};