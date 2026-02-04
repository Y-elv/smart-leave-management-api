/**
 * Admin dashboard: stats and users list.
 */
import User from "../models/User.js";
import LeaveRequest, { LEAVE_STATUS } from "../models/LeaveRequest.js";

/**
 * GET /api/dashboard/stats
 * ADMIN only. Total users, leave requests (pending, approved, rejected).
 */
export async function getStats(req, res, next) {
  try {
    const [userCount, pending, approved, rejected] = await Promise.all([
      User.countDocuments(),
      LeaveRequest.countDocuments({ status: LEAVE_STATUS.PENDING }),
      LeaveRequest.countDocuments({ status: LEAVE_STATUS.APPROVED }),
      LeaveRequest.countDocuments({ status: LEAVE_STATUS.REJECTED }),
    ]);

    return res.status(200).json({
      totalUsers: userCount,
      leaveRequests: {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/users
 * ADMIN only. List users with role and leaveBalance.
 */
export async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select(
        "fullName email role leaveBalance leaveYear annualLeaveEntitlement carryOverBalance createdAt"
      )
      .lean();

    const list = users.map((u) => ({
      id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      leaveBalance: u.leaveBalance,
      leaveYear: u.leaveYear,
      annualLeaveEntitlement: u.annualLeaveEntitlement,
      carryOverBalance: u.carryOverBalance,
      createdAt: u.createdAt,
    }));

    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
}

export default { getStats, getUsers };
