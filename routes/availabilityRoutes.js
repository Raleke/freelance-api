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


router.post("/", authMiddleware, setAvailability);         
router.get("/", authMiddleware, getAvailability);          
router.delete("/:id", authMiddleware, deleteAvailability);
router.get("/ical", authMiddleware, exportICal);          
router.post("/ical/email", authMiddleware, sendICalEmail);

module.exports = router;
