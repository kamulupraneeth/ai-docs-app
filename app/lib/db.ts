import mongoose from "mongoose";

const MONGODBURI = process.env.MONGODB_URI as string;

if (!MONGODBURI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODBURI, { dbName: "ai-docs-cluster" });
    isConnected = true;
    console.log("Connected to MONGODB");
  } catch (err) {
    console.error("MONGO DB connection error:", err);
    throw err;
  }
}
