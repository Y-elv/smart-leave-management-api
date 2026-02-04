import { USER_ROLES } from "../models/User.js";

/**
 * Role-based authorization middleware factory.
 *
 * Example:
 *   router.patch(
 *     '/:id/approve',
 *     authenticate,
 *     authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
 *     approveLeave
 *   );
 */
export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to perform this action.",
      });
    }

    return next();
  };

export const authorizeAdmin = authorizeRoles(USER_ROLES.ADMIN);
export const authorizeManager = authorizeRoles(
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN
);
export const authorizeStaff = authorizeRoles(USER_ROLES.STAFF);

export { USER_ROLES };
