import mongoose from "mongoose";

/**
 * Establish a connection to MongoDB using Mongoose.
 * This is kept very small and focused so it can be reused by server.js.
 */
export const connectDb = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    // Basic startup log for visibility in development
    console.log("Connected to Databse");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
};
