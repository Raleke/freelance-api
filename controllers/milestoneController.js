const Job = require("../models/Job");
const logger = require("../utils/logger");

const addMilestone = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { title, dueDate, amount } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`Job not found for ID: ${jobId}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    const newMilestone = { title, dueDate, amount };
    job.milestones.push(newMilestone);
    await job.save();

    logger.info(`Milestone added to Job: ${jobId} by User: ${req.user?.id}`);
    res.status(201).json({ msg: "Milestone added", milestones: job.milestones });
  } catch (err) {
    logger.error("Error adding milestone:", err);
    next(err);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const { jobId, milestoneId } = req.params;
    const { title, dueDate, amount } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`Job not found for ID: ${jobId}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    const milestone = job.milestones.id(milestoneId);
    if (!milestone) {
      logger.warn(`Milestone not found: ${milestoneId}`);
      return res.status(404).json({ msg: "Milestone not found" });
    }

    if (title) milestone.title = title;
    if (dueDate) milestone.dueDate = dueDate;
    if (amount) milestone.amount = amount;

    await job.save();
    logger.info(`Milestone ${milestoneId} updated for Job: ${jobId}`);
    res.json({ msg: "Milestone updated", milestone });
  } catch (err) {
    logger.error("Error updating milestone:", err);
    next(err);
  }
};


  const deleteMilestone = async (req, res, next) => {
  try {
    const { jobId, milestoneId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`Job not found for ID: ${jobId}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    const index = job.milestones.findIndex(m => m._id.toString() === milestoneId);
    if (index === -1) {
      logger.warn(`Milestone not found: ${milestoneId}`);
      return res.status(404).json({ msg: "Milestone not found" });
    }

    job.milestones.splice(index, 1);
    await job.save();

    logger.info(`Milestone ${milestoneId} deleted from Job: ${jobId}`);
    res.json({ msg: "Milestone deleted" });
  } catch (err) {
    logger.error("Error deleting milestone:", err);
    next(err);
  }
};

const getJobMilestones = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`Job not found for ID: ${jobId}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    logger.info(`Fetched milestones for Job: ${jobId}`);
    res.json({ milestones: job.milestones });
  } catch (err) {
    logger.error("Error fetching milestones:", err);
    next(err);
  }
};

module.exports = {
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getJobMilestones,
};