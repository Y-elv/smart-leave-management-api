/**
 * Leave-related helpers:
 * - calculateLeaveDays: safe, inclusive date range calculation
 * - ensureYearlyLeaveReset: yearly balance reset + carry-over logic
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const stripTime = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Calculate number of leave days between two dates (inclusive).
 *
 * This function:
 * - normalises timestamps to midnight to avoid timezone issues
 * - validates date order and values
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {number} number of days (>= 1)
 * @throws {Error} if dates are invalid or endDate is before startDate
 */
export const calculateLeaveDays = (startDate, endDate) => {
  const start = stripTime(startDate);
  const end = stripTime(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid dates provided');
  }

  if (end < start) {
    throw new Error('End date cannot be before start date');
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / MS_PER_DAY);

  // Inclusive of both start and end dates
  return diffDays + 1;
};

/**
 * Ensure a user's leave balance is correct for the current calendar year.
 *
 * BUSINESS RULES:
 * - Every STAFF user is entitled to 25 days per year by default
 * - At year change, carry over a maximum of 5 unused days
 * - New balance = annualLeaveEntitlement + carryOverBalance
 *
 * This function is intentionally defensive and can be safely called
 * on every login and before leave-related operations.
 *
 * @param {import('../models/User.js').default} user - Mongoose User document
 * @returns {Promise<import('../models/User.js').default>} updated user
 */
export const ensureYearlyLeaveReset = async (user) => {
  if (!user) {
    return user;
  }

  const currentYear = new Date().getFullYear();

  // If this is the first time or already on current year, nothing to do
  if (!user.leaveYear || user.leaveYear < currentYear) {
    const rawUnused =
      typeof user.leaveBalance === 'number'
        ? Math.max(0, user.leaveBalance)
        : user.annualLeaveEntitlement || 25;

    const carryOverBalance = Math.min(5, rawUnused);

    user.carryOverBalance = carryOverBalance;
    user.leaveYear = currentYear;
    user.leaveBalance = (user.annualLeaveEntitlement || 25) + carryOverBalance;

    await user.save();
  }

  return user;
};

