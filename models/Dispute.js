const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone" },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: String,
    resolution: String,
    status: {
      type: String,
      enum: ["open", "in-review", "resolved", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);