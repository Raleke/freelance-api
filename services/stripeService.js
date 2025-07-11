const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a one-time payment intent
 */
const createPaymentIntent = async ({ amount, currency = "usd", metadata }) => {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
  });
};

/**
 * Verifies webhook signature
 */
const verifyWebhook = (req) => {
  const signature = req.headers["stripe-signature"];
  return stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = {
  createPaymentIntent,
  verifyWebhook,
};