import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles, USER_ROLES } from "../middleware/role.middleware.js";
import { getStats, getUsers } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(USER_ROLES.ADMIN));

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Dashboard stats (ADMIN only)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: totalUsers, leaveRequests { pending, approved, rejected, total }
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN only
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /api/dashboard/users:
 *   get:
 *     summary: List users with role and leave balance (ADMIN only)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of users with leaveBalance, role, etc.
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN only
 */
router.get("/users", getUsers);

export default router;
