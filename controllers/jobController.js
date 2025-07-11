const Job = require("../models/Job");
const User = require("../models/User");
const logger = require("../utils/logger");


const createJob = async (req, res, next) => {
  try {
    const { title, description, budget, skills, deadline, milestones = [] } = req.body;

    // Validate required fields with improved error response
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (budget === undefined || budget === null) missingFields.push("budget");

    if (missingFields.length > 0) {
      return res.status(400).json({
        msg: "Missing required fields",
        missingFields,
      });
    }

    // Validate and parse deadline
    let parsedDeadline = null;
    if (deadline) {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ msg: "Invalid deadline date format" });
      }
    }

    // Validate and parse milestones dueDate
    const parsedMilestones = [];
    for (const milestone of milestones) {
      if (!milestone.dueDate) {
        return res.status(400).json({ msg: "Milestone dueDate is required" });
      }
      const parsedDueDate = new Date(milestone.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ msg: `Invalid milestone dueDate format: ${milestone.dueDate}` });
      }
      parsedMilestones.push({
        ...milestone,
        dueDate: parsedDueDate,
      });
    }

    const job = await Job.create({
      title,
      description,
      budget,
      skills,
      deadline: parsedDeadline,
      milestones: parsedMilestones,
      client: req.user.id,
    });

    logger.info(` Job created by ${req.user.id} - ${job._id}`);
    res.status(201).json({ msg: "Job created", job });
  } catch (err) {
    logger.error(" Error creating job", err);
    next(err);
  }
};


const getJobs = async (req, res, next) => {
  try {
    const {
      status,
      keyword,
      skill,
      matchSkills,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (keyword) filter.title = { $regex: keyword, $options: "i" };
    if (skill) filter.skills = { $in: [skill] };


    if (matchSkills === "true" && req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user?.skills?.length) {
        filter.skills = { $in: user.skills };
        logger.info(`Skill match applied for user ${req.user.id}: [${user.skills.join(", ")}]`);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const jobs = await Job.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("client", "name email");

    const total = await Job.countDocuments(filter);

    logger.info(
      ` Jobs fetched with filters: ${JSON.stringify(filter)} | Page: ${page} | Sort: ${sort} ${order}`
    );

    res.json({
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    logger.error(" Error fetching jobs", err);
    next(err);
  }
};


const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name email");

    if (!job) {
      logger.warn(` Job not found: ${req.params.id}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    logger.info(` Job retrieved: ${req.params.id}`);
    res.json({ job });
  } catch (err) {
    logger.error(" Error getting job by ID", err);
    next(err);
  }
};


const updateJob = async (req, res, next) => {
  try {
    const updates = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, client: req.user.id },
      updates,
      { new: true }
    );

    if (!job) {
      logger.warn(` Update failed - Job not found or unauthorized: ${req.params.id}`);
      return res.status(404).json({ msg: "Job not found or unauthorized" });
    }

    logger.info(` Job updated by ${req.user.id} - ${job._id}`);
    res.json({ msg: "Job updated", job });
  } catch (err) {
    logger.error(" Error updating job", err);
    next(err);
  }
};


const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user.id });

    if (!job) {
      logger.warn(` Delete failed - Job not found or unauthorized: ${req.params.id}`);
      return res.status(404).json({ msg: "Job not found or unauthorized" });
    }

    logger.info(`Job deleted by ${req.user.id} - ${job._id}`);
    res.json({ msg: "Job deleted" });
  } catch (err) {
    logger.error(" Error deleting job", err);
    next(err);
  }
};


const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, client: req.user.id },
      { status },
      { new: true }
    );

    if (!job) {
      logger.warn(` Job status update failed: ${req.params.id}`);
      return res.status(404).json({ msg: "Job not found or unauthorized" });
    }

    logger.info(` Job status updated to "${status}" by ${req.user.id} - ${job._id}`);
    res.json({ msg: `Status updated to ${status}`, job });
  } catch (err) {
    logger.error(" Error updating job status", err);
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
};