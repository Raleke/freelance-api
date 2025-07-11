const User = require("../models/User");
const Job = require("../models/Job");
const Contract = require("../models/Contract");
const Transaction = require("../models/Transaction");
const logger = require("../utils/logger");

const getDashboardStats = async (req, res, next) => {
  try {
    logger.info(" Fetching dashboard statistics");

    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalJobs,
      totalContracts,
      totalRevenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "client" }),
      User.countDocuments({ role: "freelancer" }),
      Job.countDocuments(),
      Contract.countDocuments(),
      Transaction.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    logger.info(" Dashboard stats fetched successfully");

    res.status(200).json({
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          freelancers: totalFreelancers,
        },
        jobs: totalJobs,
        contracts: totalContracts,
        revenue: totalRevenue,
      },
    });
  } catch (err) {
    logger.error(" Error fetching dashboard stats:", err);
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};