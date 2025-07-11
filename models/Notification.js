const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",          
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["info", "success", "warning", "error"], 
    default: "info"
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: String,
}, {
  timestamps: true
});

module.exports = mongoose.model("Notification", NotificationSchema);