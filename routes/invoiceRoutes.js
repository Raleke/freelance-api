const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getUserInvoices,
  getInvoiceById,
  markInvoicePaid,
  deleteInvoice,
  createStripePaymentIntent,
  generateInvoicePDF,
} = require("../controllers/invoiceController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");



// Create a new invoice
router.post("/", authMiddleware, createInvoice);

// Get all invoices for logged-in user (client or freelancer)
router.get("/", authMiddleware, getUserInvoices);

// Get specific invoice
router.get("/:id", authMiddleware, getInvoiceById);

// Mark invoice as paid (admin or system/Stripe webhook might trigger this)
router.patch("/:id/pay", authMiddleware, markInvoicePaid);

// Delete an invoice (owner only or admin)
router.delete("/:id", authMiddleware, deleteInvoice);

// Stripe payment intent (client initiating payment)
router.post("/create-payment-intent", authMiddleware, createStripePaymentIntent);

// Download invoice PDF (client/freelancer)
router.get("/:id/pdf", authMiddleware, generateInvoicePDF);

module.exports = router;