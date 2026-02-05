import bcrypt from "bcrypt";
import User, { USER_ROLES } from "../models/User.js";

/**
 * ADMIN: Create a new user.
 */
export const createUser = async (req, res, next) => {
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
    return next(err);
  }
};

/**
 * ADMIN: Get all users.
 */
export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users.map((u) => u.toSafeJSON()));
  } catch (err) {
    return next(err);
  }
};

/**
 * Get current authenticated user (works for all roles, including super admin).
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Super admin: not stored in DB
    if (req.auth?.id === "super-admin") {
      const u = req.user; // object from auth.middleware
      return res.status(200).json({
        id: "super-admin",
        fullName: u.fullName || "Super Admin",
        email: u.email || null,
        role: u.role || "ADMIN",
        profilePictureUrl: null,
        leaveBalance: 25,
        carryOverBalance: 0,
        annualLeaveEntitlement: 25,
        leaveYear: new Date().getFullYear(),
      });
    }

    // Normal users (STAFF / MANAGER / ADMIN in DB)
    const userId = req.auth?.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user.toSafeJSON());
  } catch (err) {
    return next(err);
  }
};

export default {
  createUser,
  getAllUsers,
  getMe,
};
