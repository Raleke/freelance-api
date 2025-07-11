const Review = require("../models/Review");
const Contract = require("../models/Contract");
const logger = require("../utils/logger");


const mongoose = require("mongoose");
const createReview = async (req, res, next) => {
  try {
    const { rating, comment, toUserId, contractId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ msg: "Invalid or missing contractId" });
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ msg: "Contract not found" });
    }

    // Debug logging for permission check
    console.log("createReview: contract.client =", contract.client);
    console.log("createReview: contract.freelancer =", contract.freelancer);
    console.log("createReview: req.user.id =", req.user.id);

    if (
      !contract.client.equals(req.user.id) &&
      !contract.freelancer.equals(req.user.id)
    ) {
      return res.status(403).json({ msg: "You cannot review this contract" });
    }

    const existing = await Review.findOne({
      from: req.user.id,
      to: toUserId,
      contract: contractId,
    });

    if (existing) {
      return res.status(400).json({ msg: "You already submitted a review" });
    }

    const review = await Review.create({
      from: req.user.id,
      to: toUserId,
      rating,
      comment,
      contract: contractId,
    });

    logger.info(`Review created from user ${req.user.id} to ${toUserId} on contract ${contractId}`);
    res.status(201).json({ review });
  } catch (err) {
    logger.error("Error creating review", err);
    next(err);
  }
};


const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find reviews where 'to' matches userId OR 'to' field is missing but contract's client or freelancer matches userId
    const reviews = await Review.find({
      $or: [
        { to: userId },
        { to: { $exists: false }, contract: { $exists: true } },
      ],
    })
      .populate("from", "name email")
      .populate({
        path: "contract",
        select: "client freelancer",
      })
      .sort({ createdAt: -1 });

    // Filter reviews to include those where 'to' matches userId or contract client/freelancer matches userId for old reviews
    const filteredReviews = reviews.filter((review) => {
      if (review.to) {
        return review.to.toString() === userId;
      }
      if (review.contract) {
        return (
          review.contract.client.toString() === userId ||
          review.contract.freelancer.toString() === userId
        );
      }
      return false;
    });

    const averageRating =
      filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
      (filteredReviews.length || 1);

    logger.info(`Fetched ${filteredReviews.length} reviews for user ${userId}`);
    res.json({
      reviews: filteredReviews,
      averageRating: averageRating.toFixed(1),
      total: filteredReviews.length,
    });
  } catch (err) {
    logger.error("Error fetching reviews", err);
    next(err);
  }
};


const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    console.log("deleteReview: reviewId param =", reviewId);

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ msg: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId).populate("contract");
    console.log("deleteReview: req.user.id =", req.user.id);
    console.log("deleteReview: review.from =", review ? review.from : null);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    const userId = req.user.id.toString();
    const fromId = review.from ? review.from.toString() : null;
    const contractClientId = review.contract?.client?.toString();
    const contractFreelancerId = review.contract?.freelancer?.toString();

    if (
      fromId !== userId &&
      contractClientId !== userId &&
      contractFreelancerId !== userId
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await review.deleteOne();
    logger.info(`Review ${reviewId} deleted by user ${req.user.id}`);
    res.json({ msg: "Review deleted" });
  } catch (err) {
    logger.error("Error deleting review", err);
    next(err);
  }
}; 
module.exports = {
  createReview,
  getReviewsForUser,
  deleteReview,
};