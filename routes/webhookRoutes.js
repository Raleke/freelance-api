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
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *      400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *  stripe cli
 *  command: stripe listen --forward-to http://localhost:4000/api/webhooks/stripe 
 *  This command will forward Stripe events to your local server for testing.
 * 
 */
router.post("/stripe", stripeWebhookHandler);

module.exports = router;
