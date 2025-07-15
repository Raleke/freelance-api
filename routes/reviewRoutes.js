const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsForUser,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management and operations
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review for a contract
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Review data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - toUserId
 *               - contractId
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great collaboration and communication!
 *               toUserId:
 *                 type: string
 *                 example: 64b1a47e527a60b6c8e5a9f1
 *               contractId:
 *                 type: string
 *                 example: 64b4b12cd3a5e8fd75b8e2c3
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or review already exists
 *       403:
 *         description: Unauthorized to review this contract
 *       404:
 *         description: Contract or user not found
 */
router.post("/", authMiddleware, createReview);

/**
 * @swagger
 * /reviews/{userId}:
 *   get:
 *     summary: Retrieve all reviews for a specific user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user whose reviews to fetch
 *         schema:
 *           type: string
 *           example: 64b1a47e527a60b6c8e5a9f1
 *     responses:
 *       200:
 *         description: List of reviews and average rating
 *       404:
 *         description: User not found or no reviews
 */
router.get("/:userId", authMiddleware, getReviewsForUser);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review (owner or admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: ID of the review to delete
 *         schema:
 *           type: string
 *           example: 64b4f8a2b94dcd3be928cf72
 *     responses:
 *       200:
 *         description: Review successfully deleted
 *       403:
 *         description: Unauthorized to delete this review
 *       404:
 *         description: Review not found
 */
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;