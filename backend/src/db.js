import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (!process.env.DB_URL) {
    console.error("❌ DB_URL environment variable is missing.");
    return false;
  }

  try {
    const db = await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ Database connected successfully!");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
};
