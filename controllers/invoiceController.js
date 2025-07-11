const Invoice = require("../models/Invoice");
const Contract = require("../models/Contract");
const { getSocketIO } = require("../utils/socket");
const logger = require("../utils/logger");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const stripe = require("../config/stripe");


const createInvoice = async (req, res, next) => {
  try {
    const { contractId, milestoneId, items, dueDate } = req.body;

    if (!contractId || !items || items.length === 0) {
      logger.warn(" Missing contract or items on invoice creation");
      return res.status(400).json({ msg: "Contract and items required" });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice = await Invoice.create({
      contract: contractId,
      milestone: milestoneId || undefined,
      issuedBy: req.user.id,
      items,
      total: totalAmount,
      dueDate,
    });

    getSocketIO().emit("new_invoice", invoice);
    logger.info(` Invoice ${invoice._id} created by ${req.user.id}`);

    res.status(201).json({ msg: "Invoice created", invoice });
  } catch (err) {
    logger.error(" Error creating invoice", err);
    next(err);
  }
};


const getUserInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({
      $or: [{ issuedBy: req.user.id }, { paidBy: req.user.id }],
    })
      .populate("contract", "status")
      .sort({ createdAt: -1 });

    logger.info(` Fetched invoices for user ${req.user.id}`);
    res.json({ invoices });
  } catch (err) {
    logger.error(" Error fetching user invoices", err);
    next(err);
  }
};


const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("contract", "status")
      .populate("milestone", "title")
      .populate("issuedBy", "name email");

    if (!invoice) {
      logger.warn(` Invoice not found: ${req.params.id}`);
      return res.status(404).json({ msg: "Invoice not found" });
    }

    logger.info(` Invoice ${req.params.id} retrieved`);
    res.json({ invoice });
  } catch (err) {
    logger.error(" Error getting invoice by ID", err);
    next(err);
  }
};


const markInvoicePaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

    if (invoice.status === "paid") {
      return res.status(400).json({ msg: "Already paid" });
    }

    invoice.status = "paid";
    invoice.paidAt = new Date();
    invoice.paidBy = req.user.id;
    await invoice.save();

    getSocketIO().emit("invoice_paid", invoice);
    logger.info(` Invoice ${invoice._id} marked as paid by ${req.user.id}`);

    res.json({ msg: "Invoice marked as paid", invoice });
  } catch (err) {
    logger.error(" Error marking invoice as paid", err);
    next(err);
  }
};


const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

    if (invoice.status === "paid") {
      return res.status(403).json({ msg: "Cannot delete a paid invoice" });
    }

    await invoice.deleteOne();
    logger.info(` Invoice ${invoice._id} deleted by ${req.user.id}`);
    res.json({ msg: "Invoice deleted" });
  } catch (err) {
    logger.error(" Error deleting invoice", err);
    next(err);
  }
};


const createStripePaymentIntent = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });
    if (invoice.status === "paid") {
      return res.status(400).json({ msg: "Invoice already paid" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100),
      currency: "usd",
      metadata: { invoiceId: invoice._id.toString() },
    });

    logger.info(` Stripe PaymentIntent created for invoice ${invoiceId}`);
    res.json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: invoice._id,
    });
  } catch (err) {
    logger.error(" Stripe payment intent error", err);
    next(err);
  }
};


const generateInvoicePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate("contract")
      .populate("issuedBy", "name email");

    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

    const doc = new PDFDocument();
    const filename = `invoice-${invoice._id}.pdf`;
    const invoicesDir = path.join(__dirname, "../invoices");

    // Ensure invoices directory exists
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filepath = path.join(invoicesDir, filename);
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

 
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 120 });
    }

    doc.fontSize(20).text("INVOICE", 400, 50, { align: "right" });
    doc.moveDown().moveDown();

    
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Issued By: ${invoice.issuedBy.name} (${invoice.issuedBy.email})`);
    doc.text(`Total: $${invoice.total.toFixed(2)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    doc.text(" Invoice Items:");
    invoice.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.description} — Qty: ${item.quantity} × $${item.unitPrice}`);
    });

    doc.end();

    writeStream.on("finish", () => {
      logger.info(`Invoice PDF generated for ${invoice._id}`);
      res.download(filepath, filename, (err) => {
        if (!err) fs.unlink(filepath, () => {});
      });
    });
  } catch (err) {
    logger.error(" Error generating invoice PDF", err);
    next(err);
  }
};

module.exports = {
  createInvoice,
  getUserInvoices,
  getInvoiceById,
  markInvoicePaid,
  deleteInvoice,
  createStripePaymentIntent,
  generateInvoicePDF,
};