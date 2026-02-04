/**
 * Environment configuration helper.
 * Supports switching between local and production environments.
 */

const NODE_ENV = process.env.NODE_ENV || "development";

const isProduction = NODE_ENV === "production";
const isDevelopment = NODE_ENV === "development";

// Base URLs for different environments
// You can override these via LOCAL_URL / PRODUCTION_URL env vars.
const BASE_URLS = {
  local: process.env.LOCAL_URL || "http://localhost:8081",
  // Default production URL placeholder requested by user
  production: process.env.PRODUCTION_URL || "",
};

// Get the current base URL based on environment
const getBaseUrl = () => {
  // Allow explicit override via environment variable
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // Default to production URL if in production, otherwise local
  return isProduction ? BASE_URLS.production : BASE_URLS.local;
};

export const env = {
  NODE_ENV,
  isProduction,
  isDevelopment,
  BASE_URLS,
  getBaseUrl,
  PORT: process.env.PORT || 8080,
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/smart_leave_management",
  JWT_SECRET: process.env.JWT_SECRET || "changeme-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

export default env;
