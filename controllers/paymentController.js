const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const logger = require("../utils/logger");


const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "usd", invoiceId } = req.body;

    if (!amount) {
      logger.warn("Missing payment amount");
      return res.status(400).json({ msg: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: {
        userId: req.user.id,
        invoiceId: invoiceId || "N/A",
      },
    });

    logger.info(`PaymentIntent created for user ${req.user.id} - $${amount}`);
    res.json({
      clientSecret: paymentIntent.client_secret,
      stripePaymentIntentId: paymentIntent.id,
      msg: "Payment initiated",
    });
  } catch (err) {
    logger.error("Error creating payment intent", err);
    next(err);
  }
};


const storeTransactionFromEvent = async (stripeEvent) => {
  try {
    const intent = stripeEvent.data.object;

    const transaction = new Transaction({
      stripePaymentIntentId: intent.id,
      amount: intent.amount_received / 100,
      currency: intent.currency,
      status: intent.status,
      user: intent.metadata?.userId || null,
      invoice: intent.metadata?.invoiceId || null,
    });

    await transaction.save();
    logger.info(`Transaction stored: ${transaction.stripePaymentIntentId}`);

    if (intent.metadata?.invoiceId) {
      await Invoice.findByIdAndUpdate(intent.metadata.invoiceId, {
        status: "paid",
        paidAt: new Date(),
      });
      logger.info(`Invoice ${intent.metadata.invoiceId} marked as paid`);
    }

    return transaction;
  } catch (err) {
    logger.error("Error storing transaction", err);
  }
};

const storeTransaction = async (req, res, next) => {
  try {
    const stripeEvent = req.body;

    if (!stripeEvent || !stripeEvent.data || !stripeEvent.data.object) {
      logger.warn("Invalid Stripe event object in request body");
      return res.status(400).json({ msg: "Invalid Stripe event object" });
    }

    const transaction = await storeTransactionFromEvent(stripeEvent);

    if (!transaction) {
      return res.status(500).json({ msg: "Failed to store transaction" });
    }

    res.status(201).json({ msg: "Transaction stored", transaction });
  } catch (err) {
    logger.error("Error in storeTransaction route handler", err);
    next(err);
  }
};


const getPaymentHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    logger.info(`Fetched payment history for user ${req.user.id}`);
    res.json({ transactions });
  } catch (err) {
    logger.error("Error fetching payment history", err);
    next(err);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Transaction.findById(req.params.paymentId);

    if (!payment) {
      logger.warn(`Payment not found: ${req.params.paymentId}`);
      return res.status(404).json({ msg: "Payment not found" });
    }

    logger.info(` payment.user = ${payment.user}, req.user.id = ${req.user.id}`);

    // Ensure both IDs are strings before comparison
    if (String(payment.user) !== String(req.user.id)) {
      logger.warn(`Unauthorized access to payment ${payment._id} by user ${req.user.id}`);
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    res.json({ payment });
  } catch (err) {
    logger.error("Error fetching payment by ID", err);
    next(err);
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentHistory,
  getPaymentById,
  storeTransaction,
};