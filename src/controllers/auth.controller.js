import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { ensureYearlyLeaveReset } from '../utils/leave.js';

/**
 * POST /api/auth/login
 *
 * Authenticate user and return JWT + user profile, including leave fields.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Ensure leave balance is up to date for the current year on every login.
    await ensureYearlyLeaveReset(user);

    const token = signToken({
      id: String(user._id),
      role: user.role,
    });

    const safeUser = user.toSafeJSON();

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  login,
};

