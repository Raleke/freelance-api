const Dispute = require("../models/Dispute");
const Contract = require("../models/Contract");
const logger = require("../utils/logger");


const createDispute = async (req, res, next) => {
  try {
    const { contractId, reason, description, milestoneId } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      logger.warn(` Contract not found for dispute: ${contractId}`);
      return res.status(404).json({ msg: "Contract not found" });
    }

    const dispute = await Dispute.create({
      contract: contractId,
      raisedBy: req.user.id,
      milestone: milestoneId || undefined,
      reason,
      description,
    });

    logger.info(` Dispute raised by user ${req.user.id} for contract ${contractId}`);
    res.status(201).json({ msg: "Dispute created", dispute });
  } catch (err) {
    logger.error(" Error creating dispute", err);
    next(err);
  }
};


const getUserDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({
      raisedBy: req.user.id,
    })
      .populate("contract", "status")
      .populate("milestone", "title")
      .sort({ createdAt: -1 });

    logger.info(` Fetched disputes for user ${req.user.id}`);
    res.json({ disputes });
  } catch (err) {
    logger.error(" Error fetching user disputes", err);
    next(err);
  }
};


const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate("raisedBy", "name email")
      .populate("contract", "status")
      .sort({ createdAt: -1 });

    logger.info(" Admin retrieved all disputes");
    res.json({ disputes });
  } catch (err) {
    logger.error(" Error fetching all disputes", err);
    next(err);
  }
};


const updateDisputeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      logger.warn(` Dispute not found: ${id}`);
      return res.status(404).json({ msg: "Dispute not found" });
    }

    dispute.status = status || dispute.status;
    dispute.resolution = resolution || dispute.resolution;

    await dispute.save();

    logger.info(` Dispute ${id} updated to status "${dispute.status}" by admin`);
    res.json({ msg: "Dispute updated", dispute });
  } catch (err) {
    logger.error("Error updating dispute", err);
    next(err);
  }
};


const getSingleDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("raisedBy", "name email")
      .populate("milestone", "title")
      .populate("contract");

    if (!dispute) {
      logger.warn(` Dispute not found: ${req.params.id}`);
      return res.status(404).json({ msg: "Dispute not found" });
    }

    logger.info(` Fetched single dispute: ${req.params.id}`);
    res.json({ dispute });
  } catch (err) {
    logger.error(" Error fetching single dispute", err);
    next(err);
  }
};

module.exports = {
  createDispute,
  getUserDisputes,
  getAllDisputes,
  updateDisputeStatus,
  getSingleDispute,
};