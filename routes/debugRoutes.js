const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const sendEmail = require("../utils/mailer");
const generateInvoicePDF = require("../utils/pdfHelper");
const fs = require("fs");
const path = require("path");

const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, "../temp");

router.post("/send-invoice-email", async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ msg: "Missing invoiceId" });
    }

    const invoice = await Invoice.findById(invoiceId)
      .populate("issuedBy", "name email")
      .populate("paidBy", "name email");

    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    const filename = `test-invoice-${invoice._id}.pdf`;
    const filepath = path.join(TEMP_DIR, filename);

    await generateInvoicePDF(invoice, filepath);

    const html = `
      <h2>Payment Receipt Test</h2>
      <p>This is a test email for invoice PDF attachment.</p>
      <p><strong>Invoice ID:</strong> ${invoice._id}</p>
      <p><strong>Total:</strong> $${invoice.total}</p>
      <br/>
      <p>— Rolo Enterprises</p>
    `;

    await sendEmail({
      to: invoice.paidBy?.email || invoice.issuedBy.email,
      subject: `🧾 Test Invoice Email - ${invoice._id}`,
      html,
      attachments: [
        {
          filename,
          path: filepath,
        },
      ],
    });

    fs.unlink(filepath, () => {});
    res.json({ msg: "Test email sent " });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Email test failed ", error: err.message });
  }
});

module.exports = router;