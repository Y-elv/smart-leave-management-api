/**
 * Mail configuration (Nodemailer).
 * Used for invite emails. All values from .env.
 */
export const mailConfig = {
  host: process.env.MAIL_HOST || "smtp.example.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true",
  user: process.env.MAIL_USER || "",
  pass: process.env.MAIL_PASS || "",
  from: process.env.MAIL_FROM || "noreply@example.com",
};

export default mailConfig;
