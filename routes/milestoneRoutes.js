const express = require("express");
const router = express.Router();

const {
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getJobMilestones,
} = require("../controllers/milestoneController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");



// Add milestone to a job (Client only)
router.post("/:jobId", authMiddleware, roleMiddleware("client"), addMilestone);

// Update milestone (Client or assigned Freelancer)
router.put("/job/:jobId/:milestoneId", authMiddleware, updateMilestone);

// Delete milestone (Client only)
router.delete("/:jobId/:milestoneId", authMiddleware, roleMiddleware("client"), deleteMilestone);

// Get all milestones for a job (Client or Freelancer involved)
router.get("/job/:jobId", authMiddleware, getJobMilestones);

module.exports = router;