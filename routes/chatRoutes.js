/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Endpoints for chat messaging and group chat features
 */

const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getChatHistory,
  markSeen,
  createGroup,
  notifyTyping,
  getUserGroups,
  deleteMessage,
} = require("../controllers/chatController");

const authMiddleware = require("../middlewares/authMiddleware");
const messageUpload = require("../middlewares/messageUpload");

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a new chat message (with optional file)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello, how are you?
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error or missing fields
 */
router.post("/", authMiddleware, messageUpload.single("attachment"), sendMessage);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Retrieve chat history for authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages in chat history
 */
router.get("/", authMiddleware, getChatHistory);

/**
 * @swagger
 * /chat/seen:
 *   post:
 *     summary: Mark one or more messages as seen
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64d16f93c9dd5e3273b0a345", "64d16f93c9dd5e3273b0a346"]
 *     responses:
 *       200:
 *         description: Messages marked as seen
 */
router.post("/seen", authMiddleware, markSeen);

/**
 * @swagger
 * /chat/typing:
 *   post:
 *     summary: Notify typing status to chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isTyping
 *             properties:
 *               isTyping:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Typing status updated
 */
router.post("/typing", authMiddleware, notifyTyping);

/**
 * @swagger
 * /chat/groups:
 *   post:
 *     summary: Create a group chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - members
 *             properties:
 *               name:
 *                 type: string
 *                 example: Project Alpha Team
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64b235aec9dd5e3273b0a111", "64b235aec9dd5e3273b0a112"]
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post("/groups", authMiddleware, createGroup);

/**
 * @swagger
 * /chat/groups:
 *   get:
 *     summary: Get all groups user is part of
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat groups for user
 */
router.get("/groups", authMiddleware, getUserGroups);

/**
 * @swagger
 * /chat/{id}:
 *   delete:
 *     summary: Delete a message by its ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The message ID to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete("/:id", authMiddleware, deleteMessage);

module.exports = router;