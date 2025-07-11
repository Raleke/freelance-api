const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ["client", "freelancer", "admin"],
    default: "freelancer",
  },
  image: { type: String, default: null },
  cv: { type: String, default: null },
  bio: String,
  skills: { type: [String], default: [] },
   title: { type: String, default: "" }, 
  hourlyRate: { type: Number, default: 0 }, 
  location: { type: String, default: "" },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);