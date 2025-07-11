const stripe = require("../config/stripe");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const generateInvoicePDF = require("../utils/pdfHelper");
const sendEmail = require("../utils/mailer");

// Load temp dir from .env or fallback
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, "../temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const stripeWebhookHandler = async (req, res) => {
  console.log(" stripeWebhookHandler reached!");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error("Stripe webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        if (!invoiceId) {
          logger.warn("Missing invoiceId in metadata");
          break;
        }

        const invoice = await Invoice.findById(invoiceId)
          .populate("issuedBy", "name email") // freelancer
          .populate("paidBy", "name email")
          .populate({
            path: "contract",
            populate: {
              path: "client",
              select: "name email",
            },
          });

        if (!invoice) {
          logger.warn(`Invoice not found: ${invoiceId}`);
          break;
        }

        if (invoice.status === "paid") {
          logger.info(`Invoice ${invoiceId} already marked as paid`);
          break;
        }

        invoice.status = "paid";
        invoice.paidAt = new Date();
        invoice.paidBy = paymentIntent.metadata.userId || invoice.paidBy;
        invoice.total = paymentIntent.amount_received / 100; 
        await invoice.save();

        logger.info(`Invoice ${invoiceId} marked as paid`);

        const existingTx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id });

if (!existingTx) {
  await Transaction.create({
    stripePaymentIntentId: paymentIntent.id,
    user: paymentIntent.metadata.userId,
    amount: paymentIntent.amount_received / 100,
    currency: paymentIntent.currency,
    status: "completed",
    invoice: invoice._id,
  });

  logger.info(`Stored new transaction for paymentIntent ${paymentIntent.id}`);
} else {
  logger.info(`Transaction already exists for ${paymentIntent.id}`);
}

        // await Transaction.findOneAndUpdate(
        //   { stripePaymentIntentId: paymentIntent.id },
        //   { status: "completed" }
        // );

        const recipientEmail = invoice.issuedBy?.email;
        logger.info(`Preparing to send receipt to freelancer: ${recipientEmail}`);

        if (!recipientEmail) {
          logger.warn(`No recipient email found for invoice ${invoice._id}`);
          break;
        }

        // Generate PDF
        const filename = `receipt-${invoice._id}.pdf`;
        const filepath = path.join(TEMP_DIR, filename);

        try {
          await generateInvoicePDF(invoice, filepath);
          logger.info(`PDF generated at ${filepath}`);
        } catch (pdfErr) {
          logger.error(`Failed to generate PDF: ${pdfErr.message}`);
          break;
        }

        const fsExists = fs.existsSync(filepath);
        if (!fsExists) {
          logger.warn(`PDF file does not exist at expected path: ${filepath}`);
          break;
        }

        const client = invoice.contract?.client;
        const receiptHtml = `
          <h2> Payment Received</h2>
          <p>Your invoice has been successfully paid by <strong>${invoice.paidBy?.name || "the client"}</strong>.</p>
          <p><strong>Invoice ID:</strong> ${invoice._id}</p>
         <p><strong>Amount Paid:</strong> $${(paymentIntent.amount_received / 100).toFixed(2)}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
          <p><strong>Paid At:</strong> ${invoice.paidAt.toISOString()}</p>
          <p><strong>Issued By:</strong> ${client?.name || "Unknown"} (${client?.email || "N/A"})</p>
          <br/>
          <p>Thanks for your hard work. Keep it up!</p>
          <p>— Rolo Enterprises</p>
        `;
console.log(" Email Dispatch Sequence Starting...");
console.log(" Freelancer (recipient):", recipientEmail);
console.log(" Attachment Path:", filepath);
console.log(" Email Subject:", `Payment Receipt – Invoice #${invoice._id}`);
        try {
          await sendEmail({
            to: recipientEmail,
            subject: ` Payment Receipt – Invoice #${invoice._id}`,
            html: receiptHtml,
            attachments: [
              {
                filename: filename,
                path: filepath,
                contentType: "application/pdf"
              },
            ],
          });

          console.log(` Receipt email sent to freelancer (${recipientEmail})`);
        } catch (emailErr) {
          console.error(`Failed to send receipt email: ${emailErr.message}`);
        }

        fs.unlink(filepath, (err) => {
          if (err) logger.warn(`Temp file cleanup failed: ${err.message}`);
        });

        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object;
        logger.warn(`Invoice payment failed: ${failedInvoice.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        logger.info(`Subscription cancelled: ${event.data.object.id}`);
        break;
      }

      case "payment_intent.created": {
        const paymentIntent = event.data.object;
        logger.info(`PaymentIntent created: ${paymentIntent.id} for amount $${paymentIntent.amount / 100}`);
        // Additional processing for payment_intent.created can be added here if needed
        break;
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Internal webhook error" });
  }
};



module.exports = {
  stripeWebhookHandler,
};