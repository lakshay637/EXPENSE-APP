import mongoose from "mongoose";

let isConnected = false;

const DEFAULT_DB_URL = "mongodb+srv://lakshayb211_db_user:vNHxUJiRoy0W9S6u@cluster0.r1tqjew.mongodb.net/expense-tracker?retryWrites=true&w=majority";

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const dbUrl = process.env.DB_URL?.trim() || DEFAULT_DB_URL;

  try {
    const db = await mongoose.connect(dbUrl, {
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
