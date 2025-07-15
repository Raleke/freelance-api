/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and transaction management
 */

const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  getPaymentHistory,
  getPaymentById,
  storeTransaction,
} = require("../controllers/paymentController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /payments/intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Payment intent creation data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *                 description: Amount to charge (in cents)
 *               currency:
 *                 type: string
 *                 example: usd
 *                 description: Currency code (default is 'usd')
 *               invoiceId:
 *                 type: string
 *                 example: 686d4b30cbd2915644129c5e
 *                 description: Optional associated invoice ID
 *     responses:
 *       200:
 *         description: Stripe payment intent created
 *       400:
 *         description: Missing or invalid fields
 */
router.post("/intent", authMiddleware, createPaymentIntent);

/**
 * @swagger
 * /payments/transaction:
 *   post:
 *     summary: Store a successful Stripe transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Full Stripe webhook event body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               id: evt_123456
 *               type: payment_intent.succeeded
 *               data:
 *                 object:
 *                   id: pi_123456
 *                   amount: 500000
 *                   metadata:
 *                     invoiceId: 686d4b30cbd2915644129c5e
 *                     userId: 686c02f14d4522baf52a4ed1
 *     responses:
 *       201:
 *         description: Transaction successfully stored
 *       400:
 *         description: Invalid event or payload
 *     x-codeSamples:
 *       - lang: bash
 *         label: Stripe CLI
 *         source: |
 *           # Simulate a successful payment intent using Stripe CLI:
 *           stripe trigger payment_intent.succeeded \
 *             --add payment_intent:metadata.invoiceId=686d4b30cbd2915644129c5e \
 *             --add payment_intent:metadata.userId=686c02f14d4522baf52a4ed1 \
 *             --override payment_intent:amount=500000
 */

router.post("/transaction", authMiddleware, storeTransaction);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Retrieve all payment records for the current user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user transactions
 */
router.get("/", authMiddleware, getPaymentHistory);

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Retrieve details for a specific payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment to fetch
 *     responses:
 *       200:
 *         description: Payment details returned
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get("/:paymentId", authMiddleware, getPaymentById);

module.exports = router;