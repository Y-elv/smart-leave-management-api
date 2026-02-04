import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root: welcome and links (avoids 404 on GET /)
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Smart Leave Management API",
    docs: "/api/docs",
    health: "/health",
    auth: "/api/auth/login",
  });
});

// Swagger documentation
// - UI:       /api/docs or /api/docs/ (Swagger may redirect /api/docs -> /api/docs/ for assets)
// - Raw JSON: /api/docs.json
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "smart-leave-management-api" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    message: "Resource not found.",
    path: req.originalUrl,
  });
});

// Global error handler (last in the chain)
// Ensures we never leak internal errors to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

export default app;
