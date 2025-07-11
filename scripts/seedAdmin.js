const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@gmail.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  await User.create({
    name: "Super Admin",
    email,
    password: hashedPassword,
    role: "admin",
    isVerified: true,
  });

  console.log("Admin user created.");
  process.exit();
}

seedAdmin();