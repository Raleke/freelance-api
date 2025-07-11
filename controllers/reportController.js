const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const User = require("../models/User");
const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const Contract = require("../models/Contract");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const logger = require("../utils/logger");

const getUserReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const summary = {};

    if (role === "client") {
      const jobs = await Job.find({ client: userId }).select("_id");
      const jobIds = jobs.map(job => job._id);

      const [jobsPosted, proposalsReceived, activeContracts, completedContracts, invoices] =
        await Promise.all([
          jobs.length,
          Proposal.countDocuments({ job: { $in: jobIds } }),
          Contract.countDocuments({ client: userId, status: "active" }),
          Contract.countDocuments({ client: userId, status: "completed" }),
          Invoice.find({ paidBy: userId, status: "paid" }),
        ]);

      summary.jobsPosted = jobsPosted;
      summary.proposalsReceived = proposalsReceived;
      summary.activeContracts = activeContracts;
      summary.completedContracts = completedContracts;
      summary.totalSpent = invoices.reduce((sum, inv) => sum + inv.total, 0);

    } else if (role === "freelancer") {
      const [proposalsSent, activeContracts, completedContracts, invoices] =
        await Promise.all([
          Proposal.countDocuments({ freelancer: userId }),
          Contract.countDocuments({ freelancer: userId, status: "active" }),
          Contract.countDocuments({ freelancer: userId, status: "completed" }),
          Invoice.find({ issuedBy: userId, status: "paid" }),
        ]);

      summary.proposalsSent = proposalsSent;
      summary.activeContracts = activeContracts;
      summary.completedContracts = completedContracts;
      summary.totalEarned = invoices.reduce((sum, inv) => sum + inv.total, 0);
    }

    res.json({ summary });
  } catch (err) {
    logger.error("Error generating user report:", err);
    next(err);
  }
};


const getMonthlyActivity = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const year = new Date().getFullYear();

    const result = await Contract.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
          $or: [
            { client: userId },
            { freelancer: userId },
          ],
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "contract",
          as: "invoices",
        },
      },
      {
        $addFields: {
          month: { $month: "$createdAt" },
          isClient: { $eq: ["$client", userId] },
          isFreelancer: { $eq: ["$freelancer", userId] },
          totalSpent: {
            $sum: {
              $map: {
                input: "$invoices",
                as: "inv",
                in: {
                  $cond: [
                    { $eq: ["$client", userId] },
                    "$$inv.total",
                    0
                  ]
                }
              }
            }
          },
          totalEarned: {
            $sum: {
              $map: {
                input: "$invoices",
                as: "inv",
                in: {
                  $cond: [
                    { $eq: ["$freelancer", userId] },
                    "$$inv.total",
                    0
                  ]
                }
              }
            }
          },
          completedMilestones: {
            $size: {
              $filter: {
                input: { $ifNull: ["$milestones", []] },
                as: "ms",
                cond: { $eq: ["$$ms.status", "completed"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$month",
          contractsAsClient: { $sum: { $cond: ["$isClient", 1, 0] } },
          contractsAsFreelancer: { $sum: { $cond: ["$isFreelancer", 1, 0] } },
          earned: { $sum: "$totalEarned" },
          spent: { $sum: "$totalSpent" },
          milestonesCompleted: { $sum: "$completedMilestones" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          contractsAsClient: 1,
          contractsAsFreelancer: 1,
          earned: 1,
          spent: 1,
          milestonesCompleted: 1,
        },
      },
    ]);

    // Fill all 12 months
    const fullActivity = Array.from({ length: 12 }, (_, i) => {
      const match = result.find((r) => r.month === i + 1);
      return {
        month: i + 1,
        contractsAsClient: match?.contractsAsClient || 0,
        contractsAsFreelancer: match?.contractsAsFreelancer || 0,
        earned: match?.earned || 0,
        spent: match?.spent || 0,
        milestonesCompleted: match?.milestonesCompleted || 0,
      };
    });

    logger.info(` Monthly activity fetched for user ${req.user.id}`);
    res.json({ year, activity: fullActivity });

  } catch (err) {
    logger.error(" Error in getMonthlyActivity", err);
    next(err);
  }
};

const getAdminOverview = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      logger.warn(`Unauthorized admin overview access attempt by user ${req.user.id}`);
      return res.status(403).json({ msg: "Forbidden" });
    }

    // Global totals
    const [users, jobs, proposals, contracts] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Proposal.countDocuments(),
      Contract.countDocuments(),
    ]);

    const revenueAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // Aggregates for each model
    const [monthlyUsers, monthlyRevenue, monthlyJobs, monthlyContracts, monthlyProposals] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            newUsers: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            jobsPosted: { $sum: 1 },
          },
        },
      ]),
      Contract.aggregate([
        { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            contractsCreated: { $sum: 1 },
          },
        },
      ]),
      Proposal.aggregate([
        { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            proposalsSubmitted: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Initialize structure
    const monthlyStats = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${currentYear}-${String(m).padStart(2, "0")}`;
      monthlyStats[key] = {
        newUsers: 0,
        revenue: 0,
        jobsPosted: 0,
        contractsCreated: 0,
        proposalsSubmitted: 0,
      };
    }

    // Populate each data point
    monthlyUsers.forEach(({ _id, newUsers }) => {
      if (monthlyStats[_id]) monthlyStats[_id].newUsers = newUsers;
    });

    monthlyRevenue.forEach(({ _id, revenue }) => {
      if (monthlyStats[_id]) monthlyStats[_id].revenue = revenue;
    });

    monthlyJobs.forEach(({ _id, jobsPosted }) => {
      if (monthlyStats[_id]) monthlyStats[_id].jobsPosted = jobsPosted;
    });

    monthlyContracts.forEach(({ _id, contractsCreated }) => {
      if (monthlyStats[_id]) monthlyStats[_id].contractsCreated = contractsCreated;
    });

    monthlyProposals.forEach(({ _id, proposalsSubmitted }) => {
      if (monthlyStats[_id]) monthlyStats[_id].proposalsSubmitted = proposalsSubmitted;
    });

    logger.info("Admin overview stats retrieved");

    res.json({
      metrics: {
        users,
        jobs,
        proposals,
        contracts,
        totalRevenue,
      },
      monthlyStats,
    });
  } catch (err) {
    logger.error("Failed to fetch admin overview", err);
    next(err);
  }
};


module.exports = {
  getUserReport,
  getMonthlyActivity,
  getAdminOverview,
};