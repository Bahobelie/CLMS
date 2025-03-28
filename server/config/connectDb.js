const mongoose = require('mongoose');
require('dotenv').config();
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports= connectDb;
