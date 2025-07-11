const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
} = require("../controllers/jobController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");



// Create a job (Client only)
router.post("/", authMiddleware, roleMiddleware("client"), createJob);

// Get all jobs with filters (open to everyone or authenticated)
router.get("/", authMiddleware, getJobs);

// Get job by ID
router.get("/:id", authMiddleware, getJobById);

// Update job (Client only)
router.put("/:id", authMiddleware, roleMiddleware("client"), updateJob);

// Delete job (Client only)
router.delete("/:id", authMiddleware, roleMiddleware("client"), deleteJob);

// Update job status (pause, close, reopen)
router.patch("/:id/status", authMiddleware, roleMiddleware("client"), updateJobStatus);

module.exports = router;