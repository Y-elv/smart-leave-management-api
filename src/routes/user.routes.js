import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles, USER_ROLES } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (ADMIN only)
 *     description: >
 *       Create a new user account. Only ADMIN role can perform this action.
 *       New users are initialized with leave balance based on annualLeaveEntitlement.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (ADMIN only)
 */
router.post("/", authenticate, authorizeRoles(USER_ROLES.ADMIN), createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (ADMIN only)
 *     description: >
 *       Retrieve a list of all users in the system. Only ADMIN role can perform this action.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (ADMIN only)
 */
router.get("/", authenticate, authorizeRoles(USER_ROLES.ADMIN), getAllUsers);

export default router;
