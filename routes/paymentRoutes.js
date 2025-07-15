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
 *           stripe trigger payment_intent.succeeded \
 *             --add payment_intent:metadata.invoiceId=686d4b30cbd2915644129c5e \
 *             --add payment_intent:metadata.userId=686c02f14d4522baf52a4ed1 \
 *             --override payment_intent:amount=500000
 * you should use the Stripe CLI to test this endpoint
 * and the webhook integration.
 * The CLI command above simulates a successful payment intent with metadata.
 * Make sure to replace the metadata values with actual IDs from your database.
 * This will trigger the webhook event that your application listens to,
 * allowing you to test the transaction storage functionality.
 * Make sure your server is running and the webhook endpoint is correctly set up in Stripe.
 * You can also use the Stripe dashboard to manually create a payment intent
 * and then simulate the webhook event using the CLI.
 * This will help you verify that the transaction is stored correctly
 * and that the payment history can be retrieved.
 * output should be similar to: payment_intent.created [evt_3Rj5pWCTRrF4CybP0Dvegz6G]
2025-07-09 22:47:07  <--  [200] POST http://localhost:4000/api/webhooks/stripe [evt_3Rj5pWCTRrF4CybP0Dvegz6G]
2025-07-09 23:10:32   --> charge.succeeded [evt_3Rj6CBCTRrF4CybP0Vccu9Pc]
2025-07-09 23:10:32   --> payment_intent.succeeded [evt_3Rj6CBCTRrF4CybP0Yo1MGHs]
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