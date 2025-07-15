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

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and payments
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Invoice data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *             required:
 *               - clientId
 *               - amount
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createInvoice);

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices for logged-in user (client or freelancer)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getUserInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get specific invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.get("/:id", authMiddleware, getInvoiceById);

/**
 * @swagger
 * /invoices/{id}/pay:
 *   patch:
 *     summary: Mark invoice as paid
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice marked as paid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.patch("/:id/pay", authMiddleware, markInvoicePaid);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete an invoice (owner only or admin)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.delete("/:id", authMiddleware, deleteInvoice);

/**
 * @swagger
 * /invoices/create-payment-intent:
 *   post:
 *     summary: Create Stripe payment intent (client initiating payment)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Payment intent data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *             required:
 *               - amount
 *     responses:
 *       200:
 *         description: Payment intent created
 *       401:
 *         description: Unauthorized
 */
router.post("/create-payment-intent", authMiddleware, createStripePaymentIntent);

/**
 * @swagger
 * /invoices/{id}/pdf:
 *   get:
 *     summary: Download invoice PDF
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.get("/:id/pdf", authMiddleware, generateInvoicePDF);

module.exports = router;
