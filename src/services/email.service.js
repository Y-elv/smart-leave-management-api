/**
 * Email service using Nodemailer.
 * Sends invite emails with temporary password and login instructions.
 */
import nodemailer from "nodemailer";
import { mailConfig } from "../config/mail.js";

const transporter =
  mailConfig.user && mailConfig.pass
    ? nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: mailConfig.secure,
        auth: {
          user: mailConfig.user,
          pass: mailConfig.pass,
        },
      })
    : null;

/**
 * Send invite email to a new user with temporary password and role.
 * @param {string} to - Recipient email
 * @param {string} fullName - User full name
 * @param {string} role - User role (ADMIN / MANAGER / STAFF)
 * @param {string} temporaryPassword - Temporary password to include
 * @param {string} [loginUrl] - Optional login URL for instructions
 */
export async function sendInviteEmail({
  to,
  fullName,
  role,
  temporaryPassword,
  loginUrl = "Use the same API base URL with POST /api/auth/login",
}) {
  if (!transporter) {
    throw new Error(
      "Mail not configured. Set MAIL_USER, MAIL_PASS, MAIL_HOST in .env."
    );
  }

  const subject = "You have been invited to Smart Leave Management";
  const text = `
Hello ${fullName},

You have been invited to the Leave Management System with the role: ${role}.

Your temporary credentials:
- Email: ${to}
- Temporary password: ${temporaryPassword}

Please log in and change your password if the system supports it.
Login: ${loginUrl}

Best regards,
Leave Management Team
  `.trim();

  const html = `
<p>Hello <strong>${fullName}</strong>,</p>
<p>You have been invited to the Leave Management System with the role: <strong>${role}</strong>.</p>
<p>Your temporary credentials:</p>
<ul>
  <li>Email: ${to}</li>
  <li>Temporary password: <code>${temporaryPassword}</code></li>
</ul>
<p>Please log in and change your password if the system supports it.</p>
<p>Login: ${loginUrl}</p>
<p>Best regards,<br/>Leave Management Team</p>
  `.trim();

  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject,
    text,
    html,
  });
}

export default { sendInviteEmail };
