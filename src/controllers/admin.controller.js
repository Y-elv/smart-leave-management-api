/**
 * Admin-only endpoints: super admin login, create user, invite user.
 */
import bcrypt from "bcrypt";
import crypto from "crypto";
import User, { USER_ROLES } from "../models/User.js";
import { signToken } from "../utils/token.js";
import { sendInviteEmail } from "../services/email.service.js";

const JWT_ADMIN_EXPIRY = "8h";

/**
 * POST /api/auth/admin/login (no auth required)
 * Bootstrap super admin: credentials from env only, not stored in DB.
 * Env vars are read at request time so they are available after dotenv.config().
 */
export async function adminLogin(req, res, next) {
  try {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").trim();
    const superAdminPassword = (process.env.SUPER_ADMIN_PASSWORD || "").trim();
    const superAdminName = (
      process.env.SUPER_ADMIN_NAME || "Super Admin"
    ).trim();

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }
    const normalized = (email && String(email).toLowerCase().trim()) || "";
    const pass = password != null ? String(password).trim() : "";

    if (!superAdminEmail || !superAdminPassword) {
      return res.status(503).json({
        message:
          "Super admin login is not configured. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env.",
      });
    }
    if (normalized !== superAdminEmail.toLowerCase()) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    if (pass !== superAdminPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(
      {
        id: "super-admin",
        role: "ADMIN",
        email: normalized,
      },
      { expiresIn: JWT_ADMIN_EXPIRY }
    );

    return res.status(200).json({
      token,
      user: {
        id: "super-admin",
        fullName: superAdminName,
        email: normalized,
        role: "ADMIN",
        profilePictureUrl: null,
        leaveBalance: 25,
        carryOverBalance: 0,
        annualLeaveEntitlement: 25,
        leaveYear: new Date().getFullYear(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/create-user
 * ADMIN only. Create user with hashed password, leaveBalance=25.
 */
export async function createUser(req, res, next) {
  try {
    const {
      fullName,
      email,
      password,
      role = USER_ROLES.STAFF,
      profilePictureUrl,
      annualLeaveEntitlement,
    } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "fullName, email, and password are required.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nowYear = new Date().getFullYear();
    const baseEntitlement =
      typeof annualLeaveEntitlement === "number" ? annualLeaveEntitlement : 25;

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      profilePictureUrl: profilePictureUrl || null,
      annualLeaveEntitlement: baseEntitlement,
      leaveBalance: baseEntitlement,
      carryOverBalance: 0,
      leaveYear: nowYear,
    });

    return res.status(201).json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/invite-user
 * ADMIN only. Create user with random temp password and send invite email.
 */
export async function inviteUser(req, res, next) {
  try {
    const { fullName, email, role = USER_ROLES.STAFF } = req.body || {};

    if (!fullName || !email) {
      return res.status(400).json({
        message: "fullName and email are required.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    const temporaryPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const nowYear = new Date().getFullYear();

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      annualLeaveEntitlement: 25,
      leaveBalance: 25,
      carryOverBalance: 0,
      leaveYear: nowYear,
    });

    try {
      const baseUrl =
        process.env.API_BASE_URL ||
        process.env.LOCAL_URL ||
        "http://localhost:8081";
      await sendInviteEmail({
        to: user.email,
        fullName: user.fullName,
        role: user.role,
        temporaryPassword,
        loginUrl: `${baseUrl}/api/auth/login`,
      });
    } catch (mailErr) {
      return res.status(500).json({
        message: "User created but failed to send invite email.",
        user: user.toSafeJSON(),
        error:
          process.env.NODE_ENV === "development" ? mailErr.message : undefined,
      });
    }

    return res.status(201).json({
      message: "User created and invite email sent.",
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}

export default { adminLogin, createUser, inviteUser };
