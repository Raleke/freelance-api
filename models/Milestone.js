const mongoose = require("mongoose");

const MilestoneSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
  },
  title: String,
  description: String,
  amount: Number,
  dueDate: Date,
  isComplete: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Milestone", MilestoneSchema);
















