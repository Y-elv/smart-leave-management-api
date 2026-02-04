import { Router } from 'express';
import {
  createLeaveRequest,
  getMyLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leave.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import { authorizeRoles, USER_ROLES } from '../middleware/role.middleware.js';

const router = Router();

// STAFF: create leave request
router.post('/', authenticate, authorizeRoles(USER_ROLES.STAFF), createLeaveRequest);

// STAFF: view own leave requests
router.get('/my', authenticate, authorizeRoles(USER_ROLES.STAFF), getMyLeaves);

// MANAGER / ADMIN: approve leave
router.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  approveLeave
);

// MANAGER / ADMIN: reject leave
router.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  rejectLeave
);

export default router;

