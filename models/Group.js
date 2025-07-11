const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isTeam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);