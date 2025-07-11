const stripe = require("../config/stripe");
const Invoice = require("../models/Invoice");
const express = require("express");
const router = express.Router();

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }), // Important!
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (!invoiceId) return res.status(400).send("Missing invoice ID");

      await Invoice.findByIdAndUpdate(invoiceId, {
        status: "paid",
        paidAt: new Date(),
      });

      console.log(`Invoice ${invoiceId} marked as paid`);
    }

    res.json({ received: true });
  }
);

module.exports = router;