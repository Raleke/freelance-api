const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({

name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
    },
  ],
   pendingInvites: [String],
}, { timestamps: true });

module.exports = mongoose.model ("Organization", OrganizationSchema);