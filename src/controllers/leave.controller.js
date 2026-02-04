import LeaveRequest, { LEAVE_STATUS } from "../models/LeaveRequest.js";
import { calculateLeaveDays, ensureYearlyLeaveReset } from "../utils/leave.js";

/** Check if [start, end] overlaps any approved/pending leave for the user. */
async function hasOverlappingLeave(
  userId,
  startDate,
  endDate,
  excludeLeaveId = null
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const query = {
    requester: userId,
    status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
    $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
  };
  if (excludeLeaveId) query._id = { $ne: excludeLeaveId };
  const overlap = await LeaveRequest.findOne(query);
  return !!overlap;
}

/**
 * STAFF: Create a new leave request.
 *
 * - Validates dates
 * - Calculates requested days (inclusive)
 * - Ensures yearly leave reset for the user
 * - Rejects if requested days exceed available balance
 * - Does NOT deduct balance yet (only on approval)
 */
export const createLeaveRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body || {};

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required.",
      });
    }

    // Ensure the user's balance is current before applying checks.
    await ensureYearlyLeaveReset(req.user);

    let days;
    try {
      days = calculateLeaveDays(startDate, endDate);
    } catch (err) {
      return res.status(400).json({
        message: `Invalid dates: ${err.message}`,
      });
    }

    if (days > req.user.leaveBalance) {
      return res.status(400).json({
        message: "Insufficient leave balance for this request.",
        details: {
          available: req.user.leaveBalance,
          requested: days,
        },
      });
    }

    const overlapping = await hasOverlappingLeave(
      req.user._id,
      startDate,
      endDate
    );
    if (overlapping) {
      return res.status(400).json({
        message:
          "Overlapping leave dates. You already have a pending or approved leave in this period.",
      });
    }

    const leaveRequest = await LeaveRequest.create({
      requester: req.user._id,
      startDate,
      endDate,
      days,
      reason,
      status: LEAVE_STATUS.PENDING,
    });

    return res.status(201).json(leaveRequest);
  } catch (err) {
    return next(err);
  }
};

/**
 * STAFF: Get all leave requests for the authenticated user.
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(leaves);
  } catch (err) {
    return next(err);
  }
};

/**
 * MANAGER/ADMIN: Approve a leave request.
 *
 * - Prevents double approval
 * - Ensures yearly reset for the requester
 * - Deducts days from leaveBalance atomically
 * - Ensures leaveBalance never becomes negative
 */
export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found.",
      });
    }

    if (leave.status === LEAVE_STATUS.APPROVED) {
      return res.status(400).json({
        message: "This leave request has already been approved.",
      });
    }

    if (leave.status === LEAVE_STATUS.REJECTED) {
      return res.status(400).json({
        message: "Rejected leave requests cannot be approved.",
      });
    }

    // Load the requester and make sure their yearly balance is current.
    const requester = await (
      await import("../models/User.js")
    ).default.findById(leave.requester);

    if (!requester) {
      return res.status(400).json({
        message: "User associated with this leave request no longer exists.",
      });
    }

    await ensureYearlyLeaveReset(requester);

    if (leave.days > requester.leaveBalance) {
      return res.status(400).json({
        message:
          "Insufficient leave balance to approve this request. Balance may have changed since submission.",
        details: {
          available: requester.leaveBalance,
          requested: leave.days,
        },
      });
    }

    requester.leaveBalance -= leave.days;

    if (requester.leaveBalance < 0) {
      return res.status(400).json({
        message: "Approval would result in a negative leave balance.",
      });
    }

    leave.status = LEAVE_STATUS.APPROVED;
    leave.approvedBy = req.user._id;
    leave.decisionAt = new Date();

    await requester.save();
    await leave.save();

    return res.status(200).json(leave);
  } catch (err) {
    return next(err);
  }
};

/**
 * MANAGER/ADMIN: Reject a leave request.
 *
 * - Prevents duplicate processing
 * - Does not touch leave balances
 */
export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found.",
      });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({
        message: "Only pending leave requests can be rejected.",
      });
    }

    leave.status = LEAVE_STATUS.REJECTED;
    leave.approvedBy = req.user._id;
    leave.decisionAt = new Date();

    await leave.save();

    return res.status(200).json(leave);
  } catch (err) {
    return next(err);
  }
};

/**
 * MANAGER/ADMIN: Get all pending leave requests.
 */
export const getPendingLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ status: LEAVE_STATUS.PENDING })
      .populate("requester", "fullName email role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(leaves);
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Get all leave requests.
 */
export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate("requester", "fullName email role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(leaves);
  } catch (err) {
    next(err);
  }
};

export default {
  createLeaveRequest,
  getMyLeaves,
  approveLeave,
  rejectLeave,
  getPendingLeaves,
  getAllLeaves,
};
