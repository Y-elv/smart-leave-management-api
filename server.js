import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import { connectDb } from "./src/config/db.js";
import { scheduleYearlyReset } from "./src/services/leaveReset.service.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

const server = http.createServer(app);

const start = async () => {
  try {
    console.log("[server] Starting...");
    await connectDb();
    console.log("[server] Database ready, scheduling yearly leave reset");
    scheduleYearlyReset();

    server.listen(PORT, () => {
      console.log(`[server] API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start", err.message);
    process.exit(1);
  }
};

start();
