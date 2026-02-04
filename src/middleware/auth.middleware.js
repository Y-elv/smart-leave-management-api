import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

/**
 * Authentication middleware.
 *
 * - Expects a Bearer token in the Authorization header
 * - Validates the JWT
 * - Loads the corresponding user from the database
 * - Attaches the full user document to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required. Missing Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.',
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User associated with this token no longer exists.',
      });
    }

    req.user = user;
    req.auth = { id: String(user._id), role: user.role };

    return next();
  } catch (err) {
    return next(err);
  }
};

export default authenticate;

