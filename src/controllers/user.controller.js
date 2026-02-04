import bcrypt from 'bcrypt';
import User, { USER_ROLES } from '../models/User.js';

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
        message: 'fullName, email, and password are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        message: 'A user with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nowYear = new Date().getFullYear();

    const baseEntitlement =
      typeof annualLeaveEntitlement === 'number'
        ? annualLeaveEntitlement
        : 25;

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

export default {
  createUser,
  getAllUsers,
};

