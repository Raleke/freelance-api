const express = require("express");
const router = express.Router();
const { stripeWebhookHandler } = require("../controllers/webhookController");

router.post("/stripe", stripeWebhookHandler);

module.exports = router;