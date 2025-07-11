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



router.post("/", authMiddleware, messageUpload.single("attachment"), sendMessage);
router.get("/", authMiddleware, getChatHistory); 
router.post("/seen", authMiddleware, markSeen); 
router.post("/typing", authMiddleware, notifyTyping); 


router.post("/groups", authMiddleware, createGroup); 
router.get("/groups", authMiddleware, getUserGroups); 


router.delete("/:id", authMiddleware, deleteMessage); 

module.exports = router;