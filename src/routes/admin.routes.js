import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles, USER_ROLES } from "../middleware/role.middleware.js";
import { createUser, inviteUser } from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(USER_ROLES.ADMIN));

/**
 * @swagger
 * /api/admin/create-user:
 *   post:
 *     summary: Create user (ADMIN only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or duplicate email
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN only
 */
router.post("/create-user", createUser);

/**
 * @swagger
 * /api/admin/invite-user:
 *   post:
 *     summary: Invite user by email (ADMIN only)
 *     description: Creates user with random temp password and sends invite email.
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [ADMIN, MANAGER, STAFF], default: STAFF }
 *     responses:
 *       201:
 *         description: User created and invite sent
 *       400:
 *         description: Validation error or duplicate email
 *       401:
 *         description: Authentication required
 *       403:
 *         description: ADMIN only
 *       500:
 *         description: Mail send failed (user may still be created)
 */
router.post("/invite-user", inviteUser);

export default router;
