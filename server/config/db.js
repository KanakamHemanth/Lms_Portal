const mongoose = require("mongoose");

async function connectDB() {
  const mongoURI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/coursecraft";
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log("MongoDB connected successfully...");
  } catch (err) {
    console.warn("Primary MongoDB connection failed:", err.message);
    if (!mongoURI.includes("127.0.0.1") && !mongoURI.includes("localhost")) {
      console.log("Attempting fallback to local MongoDB...");
      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/coursecraft", { serverSelectionTimeoutMS: 4000 });
        console.log("Connected to local MongoDB successfully.");
      } catch (localErr) {
        console.error("Local MongoDB connection also failed:", localErr.message);
      }
    }
  }
}

module.exports = connectDB;