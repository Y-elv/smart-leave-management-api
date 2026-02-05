import { Router } from "express";
import multer from 'multer';
import {
  createLeaveRequest,
  getMyLeaves,
  approveLeave,
  rejectLeave,
  getPendingLeaves,
  getAllLeaves,
} from "../controllers/leave.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles, USER_ROLES } from "../middleware/role.middleware.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC/DOCX files are allowed.'));
    }
  },
});

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Create a leave request with optional document (STAFF only)
 *     description: >
 *       Submit a new leave request with an optional document attachment. The system will:
 *       - Calculate the number of days (inclusive of start and end dates)
 *       - Ensure yearly leave reset is applied
 *       - Validate that the user has sufficient leave balance
 *       - Reject the request if balance is insufficient
 *       - Create the request with PENDING status (balance is NOT deducted yet)
 *       - Upload the document to Cloudinary if provided
 *     tags:
 *       - Leave Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave (YYYY-MM-DD)
 *                 example: "2026-03-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of leave (YYYY-MM-DD)
 *                 example: "2026-03-05"
 *               reason:
 *                 type: string
 *                 description: Reason for leave
 *                 example: "Family vacation"
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Optional document to attach (PDF, JPG, PNG, DOC, DOCX, max 5MB)
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRequest'
 *       400:
 *         description: Invalid dates, insufficient leave balance, or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (STAFF only)
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(USER_ROLES.STAFF),
  upload.single('document'),
  createLeaveRequest
);
router.post(
  "/request",
  authenticate,
  authorizeRoles(USER_ROLES.STAFF),
  upload.single('document'),
  createLeaveRequest
);

/**
 * @swagger
 * /api/leaves/my:
 *   get:
 *     summary: Get my leave requests (STAFF only)
 *     description: >
 *       Retrieve all leave requests for the authenticated user.
 *       Results are sorted by creation date (newest first).
 *     tags:
 *       - Leave Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaveRequest'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (STAFF only)
 */
router.get("/my", authenticate, authorizeRoles(USER_ROLES.STAFF), getMyLeaves);

/**
 * @swagger
 * /api/leaves/pending:
 *   get:
 *     summary: List pending leave requests (MANAGER/ADMIN)
 *     tags: [Leave Requests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of pending leaves }
 *       401: { description: Authentication required }
 *       403: { description: MANAGER/ADMIN only }
 */
router.get(
  "/pending",
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  getPendingLeaves
);

/**
 * @swagger
 * /api/leaves/all:
 *   get:
 *     summary: List all leave requests (ADMIN only)
 *     tags: [Leave Requests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of all leaves }
 *       401: { description: Authentication required }
 *       403: { description: ADMIN only }
 */
router.get(
  "/all",
  authenticate,
  authorizeRoles(USER_ROLES.ADMIN),
  getAllLeaves
);

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   patch:
 *     summary: Approve a leave request (MANAGER/ADMIN only)
 *     description: >
 *       Approve a pending leave request. The system will:
 *       - Prevent double approval
 *       - Ensure yearly leave reset for the requester
 *       - Validate sufficient leave balance
 *       - Deduct leave days from the requester's balance
 *       - Ensure balance never becomes negative
 *     tags:
 *       - Leave Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRequest'
 *       400:
 *         description: Already approved, rejected, or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (MANAGER/ADMIN only)
 *       404:
 *         description: Leave request not found
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  approveLeave
);
router.put(
  "/:id/approve",
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  approveLeave
);

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   patch:
 *     summary: Reject a leave request (MANAGER/ADMIN only)
 *     description: >
 *       Reject a pending leave request. Only pending requests can be rejected.
 *       This action does NOT affect the user's leave balance.
 *     tags:
 *       - Leave Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRequest'
 *       400:
 *         description: Request is not pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions (MANAGER/ADMIN only)
 *       404:
 *         description: Leave request not found
 */
router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  rejectLeave
);
router.put(
  "/:id/reject",
  authenticate,
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  rejectLeave
);

export default router;
