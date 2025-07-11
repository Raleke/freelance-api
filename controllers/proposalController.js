const Proposal = require("../models/Proposal");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const submitProposal = async (req, res, next) => {
  try {
    const { jobId, coverLetter, expectedRate, estimatedTime } = req.body;

    // Validate required jobId
    if (!jobId) {
      return res.status(400).json({ msg: "Job ID is required" });
    }

    const existing = await Proposal.findOne({
      job: jobId,
      freelancer: req.user.id,
    });

    if (existing) {
      logger.warn(`Duplicate proposal by ${req.user.id} for job ${jobId}`);
      return res.status(400).json({ msg: "Proposal already submitted" });
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user.id,
      coverLetter,
      expectedRate,
      estimatedTime,
    });

    const job = await Job.findById(jobId);
    await Notification.create({
      recipient: job.client,
      type: "proposal",
      message: `New proposal submitted for your job: ${job.title}`,
      data: { jobId },
    });

    logger.info(`Proposal submitted by ${req.user.id} for job ${jobId}`);
    res.status(201).json({ msg: "Proposal submitted", proposal });
  } catch (err) {
    logger.error("Error submitting proposal", err);
    next(err);
  }
};

const getJobProposals = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job || job.client.toString() !== req.user.id) {
      logger.warn(`Unauthorized proposal view attempt by ${req.user.id} for job ${jobId}`);
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const proposals = await Proposal.find({ job: jobId })
      .populate("freelancer", "name email skills")
      .sort({ createdAt: -1 });

    logger.info(`Proposals fetched for job ${jobId} by client ${req.user.id}`);
    res.json({ proposals });
  } catch (err) {
    logger.error("Error getting job proposals", err);
    next(err);
  }
};

const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate("job", "title budget")
      .sort({ createdAt: -1 });

    logger.info(`Proposals fetched for freelancer ${req.user.id}`);
    res.json({ proposals });
  } catch (err) {
    logger.error("Error getting freelancer proposals", err);
    next(err);
  }
};

const respondToProposal = async (req, res, next) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.proposalId).populate({
      path: "job",
      select: "client title",
    });

    console.log("Proposal:", proposal);
    console.log("Proposal job client:", proposal?.job?.client);
    console.log("Authenticated user id:", req.user.id);

    if (!proposal || proposal.job.client.toString() !== req.user.id) {
      logger.warn(`Unauthorized proposal response attempt by ${req.user.id}`);
      return res.status(403).json({ msg: "Unauthorized" });
    }

    proposal.status = status;
    await proposal.save();

    await Notification.create({
      recipient: proposal.freelancer,
      type: "proposal_response",
      message: `Your proposal for "${proposal.job.title}" was ${status}`,
      data: { jobId: proposal.job._id },
    });

    logger.info(`Proposal ${proposal._id} ${status} by client ${req.user.id}`);
    res.json({ msg: `Proposal ${status}`, proposal });
  } catch (err) {
    logger.error("Error responding to proposal", err);
    next(err);
  }
};

const deleteProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal || proposal.freelancer.toString() !== req.user.id) {
      logger.warn(`Unauthorized proposal delete attempt by ${req.user.id}`);
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await proposal.deleteOne();
    logger.info(`Proposal ${proposal._id} deleted by freelancer ${req.user.id}`);
    res.json({ msg: "Proposal deleted" });
  } catch (err) {
    logger.error("Error deleting proposal", err);
    next(err);
  }
};

module.exports = {
  submitProposal,
  getJobProposals,
  getMyProposals,
  respondToProposal,
  deleteProposal,
};