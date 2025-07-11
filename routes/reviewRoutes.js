const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsForUser,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middlewares/authMiddleware");


//  Create a review (freelancer or client)
router.post("/", authMiddleware, createReview);

// Get reviews for a user (by userId param)
router.get("/:userId", authMiddleware, getReviewsForUser);

//  Delete a review (owner or admin)
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;