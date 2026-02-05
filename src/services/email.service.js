/**
 * Email service using Nodemailer.
 * - Reads config from environment (supports quoted values / spaces)
 * - Builds a transporter and exposes a sendInviteEmail helper
 * - Exports a small multer/router example for leave upload
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import express from "express";

dotenv.config();

// Utility to read env values safely (strip surrounding quotes and trim)
const env = (key, fallback = "") => {
  const raw = process.env[key];
  if (!raw && raw !== "") return fallback;
  return String(raw).replace(/^["'](.+(?=["']$))["']$/, "$1").trim();
};

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// -- Cloudinary config (optional)
cloudinary.config({
  cloud_name: env("CLOUDINARY_CLOUD_NAME"),
  api_key: env("CLOUDINARY_API_KEY"),
  api_secret: env("CLOUDINARY_API_SECRET"),
});

// -- Mail configuration
export const mailConfig = {
  host: env("MAIL_HOST", "smtp.gmail.com"),
  port: Number(env("MAIL_PORT") || 587),
  secure: env("MAIL_SECURE") === "true",
  user: env("MAIL_USER", ""),
  pass: env("MAIL_PASS", ""),
  from: env("MAIL_FROM", "Smart Leave <noreply@example.com>"),
};

console.log("MAIL_USER:", mailConfig.user || "not set");
console.log("MAIL_HOST:", mailConfig.host);
console.log("MAIL_FROM:", mailConfig.from);
console.log("NODE_ENV:", env("NODE_ENV", "development"));

let transporter = null;

if (mailConfig.user && mailConfig.pass) {
  transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
    tls: {
      rejectUnauthorized: env("NODE_ENV") === "production",
    },
  });

  transporter
    .verify()
    .then(() => console.log("Mail transporter verified"))
    .catch((err) =>
      console.error("Mail transporter verification failed:", err?.message)
    );
} else {
  console.warn(
    "Mail transporter not configured. Set MAIL_USER and MAIL_PASS."
  );
}

/**
 * Send invite email
 */
export async function sendInviteEmail({
  to,
  fullName,
  role,
  temporaryPassword,
  loginUrl = "#",
}) {
  if (!transporter) {
    throw new Error("Mail not configured.");
  }

  const subject = "You're invited to Smart Leave Management";

  const text = `
Hello ${fullName},

You have been invited to the Smart Leave Management System.

Role: ${role}
Email: ${to}
Temporary Password: ${temporaryPassword}

Login here: ${loginUrl}

Please change your password after logging in.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#2563eb;color:#ffffff;padding:24px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">Smart Leave Management</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                  Account Invitation
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px;color:#1f2937;">
                <p style="font-size:15px;margin-top:0;">
                  Hello <strong>${fullName}</strong>,
                </p>

                <p style="font-size:15px;line-height:1.6;">
                  You have been invited to join the <strong>Smart Leave Management System</strong>.
                  Your assigned role is:
                </p>

                <p style="font-size:16px;font-weight:bold;color:#2563eb;">
                  ${role}
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:20px 0;">
                  <p style="margin:0 0 8px;font-weight:bold;">Your temporary credentials</p>
                  <p style="margin:4px 0;"><strong>Email:</strong> ${to}</p>
                  <p style="margin:4px 0;">
                    <strong>Password:</strong>
                    <span style="background:#e5e7eb;padding:4px 8px;border-radius:4px;font-family:monospace;">
                      ${temporaryPassword}
                    </span>
                  </p>
                </div>

                <p style="font-size:14px;color:#374151;">
                  Please log in and change your password immediately after your first login.
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <a href="${loginUrl}"
                    style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
                    Login to Your Account
                  </a>
                </div>

                <p style="font-size:13px;color:#6b7280;">
                  If the button doesn’t work, copy and paste this link into your browser:
                  <br />
                  <span style="color:#2563eb;">${loginUrl}</span>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} Smart Leave Management<br/>
                This is an automated message. Please do not reply.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const info = await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject,
    text,
    html,
  });

  return info;
}

// --- example router (leave upload)
router.post("/leaves", upload.single("document"), async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const document = req.file;

    res.status(200).json({
      message: "Leave request submitted successfully",
      data: {
        startDate,
        endDate,
        reason,
        documentUploaded: !!document,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
});

export { router, transporter };
export default mailConfig;
