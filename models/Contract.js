const mongoose = require("mongoose");

const  ContractSchema = new mongoose.Schema({
job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "paused", "completed", "cancelled"],
    default: "active",
  },
  terms: String,
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Contract", ContractSchema);