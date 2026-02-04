import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

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
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Missing Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired authentication token.",
      });
    }

    // Super admin (bootstrap): not stored in DB
    if (decoded.id === "super-admin") {
      req.user = {
        _id: "super-admin",
        role: "ADMIN",
        fullName: process.env.SUPER_ADMIN_NAME || "Super Admin",
        email: decoded.email || process.env.SUPER_ADMIN_EMAIL,
      };
      req.auth = { id: "super-admin", role: "ADMIN" };
      return next();
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User associated with this token no longer exists.",
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
