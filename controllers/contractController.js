const Contract = require("../models/Contract");
const Job = require("../models/Job");
const Milestone = require("../models/Milestone");
const Proposal = require("../models/Proposal");
const logger = require("../utils/logger");

// Create New Contract (Client)
const createContract = async (req, res, next) => {
  try {
    const { jobId, freelancerId, terms, startDate, endDate } = req.body;

    if (!jobId || !freelancerId || !terms || !startDate || !endDate) {
      logger.warn("Missing contract fields");
      return res.status(400).json({ msg: "All fields are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`Job not found: ${jobId}`);
      return res.status(404).json({ msg: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} is not the owner of job ${jobId}`);
      return res.status(403).json({ msg: "Only the client who owns the job can create contracts" });
    }

    const proposal = await Proposal.findOne({
      job: jobId,
      freelancer: freelancerId,
      status: "accepted",
    });

    if (!proposal) {
      return res.status(400).json({
        msg: "No accepted proposal found for this freelancer on this job.",
      });
    }

    const existing = await Contract.findOne({ job: jobId, freelancer: freelancerId });
    if (existing) {
      logger.warn("Duplicate contract attempt");
      return res.status(409).json({ msg: "Contract already exists" });
    }

    const contract = await Contract.create({
      job: jobId,
      client: req.user.id,
      freelancer: freelancerId,
      terms,
      startDate,
      endDate,
      status: "active", 
    });

    logger.info(`Contract created by ${req.user.id} for job ${jobId}`);
    res.status(201).json({ msg: "Contract created", contract });
  } catch (err) {
    logger.error("Error creating contract", err);
    next(err);
  }
};

// Freelancer Approval
const approveContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      logger.warn("Contract not found for approval");
      return res.status(404).json({ msg: "Contract not found" });
    }

    if (contract.freelancer.toString() !== req.user.id) {
      logger.warn("Unauthorized contract approval attempt");
      return res.status(403).json({ msg: "You are not authorized to approve this contract" });
    }

    if (contract.status !== "active") {
      logger.warn("Contract already approved or invalid state");
      return res.status(400).json({ msg: "Contract already approved or not in active state" });
    }

    contract.status = "active";
    await contract.save();

    logger.info(`Contract approved by freelancer ${req.user.id}`);
    res.json({ msg: "Contract approved", contract });
  } catch (err) {
    logger.error("Error approving contract", err);
    next(err);
  }
};

// Update Status (Client/Freelancer)
const updateContractStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["paused", "completed", "cancelled"];

    if (!allowed.includes(status)) {
      logger.warn("Invalid contract status update attempt");
      return res.status(400).json({ msg: "Invalid status" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      logger.warn("Contract not found for status update");
      return res.status(404).json({ msg: "Contract not found" });
    }

    if (
      contract.client.toString() !== req.user.id &&
      contract.freelancer.toString() !== req.user.id
    ) {
      logger.warn("Unauthorized status update attempt");
      return res.status(403).json({ msg: "Unauthorized to change status" });
    }

    contract.status = status;
    await contract.save();

    logger.info(`Contract ${contract._id} status updated to ${status} by ${req.user.id}`);
    res.json({ msg: "Contract status updated", contract });
  } catch (err) {
    logger.error("Error updating contract status", err);
    next(err);
  }
};

// Create Milestone (Client only)
const createMilestoneForContract = async (req, res, next) => {
  try {
    const { title, description, dueDate, amount } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      logger.warn("Contract not found for milestone creation");
      return res.status(404).json({ msg: "Contract not found" });
    }

    if (contract.client.toString() !== req.user.id) {
      logger.warn("Unauthorized milestone creation attempt");
      return res.status(403).json({ msg: "Only client can create milestones" });
    }

    const milestone = await Milestone.create({
      contract: contract._id,
      title,
      description,
      dueDate,
      amount,
    });

    logger.info(`Milestone created for contract ${contract._id} by ${req.user.id}`);
    res.status(201).json({ msg: "Milestone created", milestone });
  } catch (err) {
    logger.error("Error creating milestone", err);
    next(err);
  }
};

// Fetch All Contracts for a User
const getContractsForUser = async (req, res, next) => {
  try {
    const contracts = await Contract.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
    })
      .populate("job", "title")
      .populate("freelancer", "name email")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    logger.info(`Contracts fetched for user ${req.user.id}`);
    res.json({ contracts });
  } catch (err) {
    logger.error("Error fetching user contracts", err);
    next(err);
  }
};

// Get Single Contract
const getSingleContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("job")
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!contract) {
      logger.warn("Contract not found");
      return res.status(404).json({ msg: "Contract not found" });
    }

   if (
  contract.client._id.toString() !== req.user.id &&
  contract.freelancer._id.toString() !== req.user.id
) {
  logger.warn("Unauthorized access to single contract");
  return res.status(403).json({ msg: "Not authorized" });
}

    logger.info(`Single contract retrieved by ${req.user.id}`);
    res.json({ contract });
  } catch (err) {
    logger.error("Error retrieving contract", err);
    next(err);
  }
};

// Delete Contract (Admin or Client)
const deleteContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      logger.warn("Contract not found for deletion");
      return res.status(404).json({ msg: "Contract not found" });
    }

    if (
      contract.client.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn("Unauthorized delete attempt");
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await contract.deleteOne();
    logger.info(`Contract ${req.params.id} deleted by ${req.user.id}`);
    res.json({ msg: "Contract deleted" });
  } catch (err) {
    logger.error("Error deleting contract", err);
    next(err);
  }
};

const rejectContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ msg: "Contract not found" });
    }

    if (contract.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You are not authorized to reject this contract" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({ msg: "Only active contracts can be rejected" });
    }

    contract.status = "cancelled";
    await contract.save();

    res.json({ msg: "Contract rejected", contract });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createContract,
  approveContract,
  updateContractStatus,
  createMilestoneForContract,
  getContractsForUser,
  getSingleContract,
  deleteContract,
  rejectContract,
};