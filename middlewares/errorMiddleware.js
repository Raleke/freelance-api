const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`[ERROR] ${err.message}`, err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    msg: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;