require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@rivae.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = new User({
      name: "Prajwal",
      email,
      role: "admin"
    });

    await admin.setPassword("Prajwal@123"); // 🔐 change later
    await admin.save();

    console.log("✅ Admin created successfully");
    console.log("Email:", email);
    console.log("Password: Prajwal@123");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
