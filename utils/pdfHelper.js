const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = async (invoice, filepath) => {
  // Ensure output directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filepath);
    
    doc.pipe(stream);

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Issued By: ${invoice.issuedBy?.name} (${invoice.issuedBy?.email})`);
    doc.text(`Total: $${invoice.total.toFixed(2)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    doc.text("Items:");
    invoice.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.description} — Qty: ${item.quantity} × $${item.unitPrice}`);
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

module.exports = generateInvoicePDF;