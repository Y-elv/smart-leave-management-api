import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import { connectDb } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDb();

    server.listen(PORT, () => {
      // Basic startup log for visibility
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
