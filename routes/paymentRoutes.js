const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  getPaymentHistory,
  getPaymentById,
  storeTransaction,
} = require("../controllers/paymentController");

const authMiddleware = require("../middlewares/authMiddleware");



// Create Stripe payment intent
router.post("/intent", authMiddleware, createPaymentIntent);

// Store successful transaction (can also be called from webhook)
router.post("/transaction", authMiddleware, storeTransaction);

// Get all payment history for logged-in user
router.get("/", authMiddleware, getPaymentHistory);

// Get a single payment by ID
router.get("/:paymentId", authMiddleware, getPaymentById);

module.exports = router;