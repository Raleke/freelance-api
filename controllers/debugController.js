const Job = require("../models/Job");

const getJobClient = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId).select("client title");
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json({ jobId: job._id, client: job.client, title: job.title });
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobClient };
