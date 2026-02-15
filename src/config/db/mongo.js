const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Don't exit - let the server continue (test runner can work without DB)
    throw err; // Re-throw so caller can handle
  }
};

module.exports = connectMongo;
