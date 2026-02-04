import { Router } from 'express';
import { createUser, getAllUsers } from '../controllers/user.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import { authorizeRoles, USER_ROLES } from '../middleware/role.middleware.js';

const router = Router();

// ADMIN only
router.post(
  '/',
  authenticate,
  authorizeRoles(USER_ROLES.ADMIN),
  createUser
);

// ADMIN only
router.get(
  '/',
  authenticate,
  authorizeRoles(USER_ROLES.ADMIN),
  getAllUsers
);

export default router;

