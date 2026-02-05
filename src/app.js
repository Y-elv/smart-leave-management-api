import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { getSwaggerSpec } from "./config/swagger.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://leave-manage.netlify.app",
  "http://localhost:8081",
  "https://leave-management-api.onrender.com",
];

const corsOptions = {
  origin(origin, callback) {
    // allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  // optionally expose headers to client:
  exposedHeaders: ["Content-Range", "X-Total-Count"],
};

// Core middleware -- CORS must be registered before routes/auth middlewares
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for all routes
app.use(express.json());
app.use(morgan("dev"));

// Debugging middleware: logs origin and the CORS headers we actually send
app.use((req, res, next) => {
  console.log(
    `[CORS DEBUG] ${req.method} ${req.originalUrl} Origin: ${
      req.headers.origin || "none"
    }`
  );
  res.on("finish", () => {
    console.log("[CORS DEBUG] Response headers:", {
      "Access-Control-Allow-Origin": res.getHeader(
        "Access-Control-Allow-Origin"
      ),
      "Access-Control-Allow-Credentials": res.getHeader(
        "Access-Control-Allow-Credentials"
      ),
      "Set-Cookie": res.getHeader("Set-Cookie"),
    });
  });
  next();
});

// Root: welcome and links (avoids 404 on GET /)
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Smart Leave Management API",
    docs: "/api/docs",
    health: "/health",
    auth: "/api/auth/login",
  });
});


app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(getSwaggerSpec());
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerUrl: "/api/docs.json" })
);

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

app.use((err, req, res, _next) => {
  console.error("[error]", req.method, req.path, err.message, err.stack);
  if (res.headersSent) {
    return;
  }
  // If CORS rejected, reply with 403 so browser preflight fails quickly
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS error" });
  }
  res.status(500).json({
    message: "Internal server error.",
  });
});

export default app;
