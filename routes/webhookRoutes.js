const express = require("express");
const router = express.Router();
const { stripeWebhookHandler } = require("../controllers/webhookController");

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook event handlers
 */

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Stripe webhook event handler
 *     tags: [Webhooks]
 *     requestBody:
 *       description: Stripe webhook payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               id: evt_123
 *               type: payment_intent.succeeded
 *               data:
 *                 object:
 *                   id: pi_456
 *                   amount: 5000
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *     x-codeSamples:
 *       - lang: bash
 *         label: Stripe CLI
 *         source: |
 *           # Use Stripe CLI to forward events to your local webhook:
 *           stripe listen --forward-to http://localhost:4000/webhooks/stripe
 *           
 *           # You can then trigger an event like:
 *           stripe trigger payment_intent.succeeded
 */
router.post("/stripe", stripeWebhookHandler);

module.exports = router;