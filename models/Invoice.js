const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
});

const invoiceSchema = new mongoose.Schema(
  {
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [itemSchema],
    total: { type: Number, required: true },
    dueDate: Date,
    paidAt: Date,
    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);