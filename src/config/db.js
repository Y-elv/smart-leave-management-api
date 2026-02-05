import mongoose from "mongoose";

/**
 * Establish a connection to MongoDB using Mongoose.
 * This is kept very small and focused so it can be reused by server.js.
 */
export const connectDb = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("[db] MONGO_URI is not defined");
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  console.log("[db] Connecting to MongoDB...");
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("[db] Connected to Database");
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB", err.message);
    throw err;
  }
};
