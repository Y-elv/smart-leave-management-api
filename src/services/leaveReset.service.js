/**
 * Yearly leave balance reset via node-cron.
 * Runs every Jan 1st: applies carry-over (max 5), sets leaveBalance = annualLeaveEntitlement + carryOverBalance.
 */
import cron from "node-cron";
import User from "../models/User.js";

const MAX_CARRY_OVER = 5;

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[leaveReset.service ${ts}] ${msg}`);
}

async function runYearlyReset() {
  const year = new Date().getFullYear();
  log(`Starting yearly leave reset for year ${year}`);

  try {
    const users = await User.find({}).lean();
    let updated = 0;

    for (const u of users) {
      const rawUnused = Math.max(0, Number(u.leaveBalance) || 25);
      const carryOverBalance = Math.min(MAX_CARRY_OVER, rawUnused);
      const annualLeaveEntitlement = Number(u.annualLeaveEntitlement) || 25;
      const leaveBalance = annualLeaveEntitlement + carryOverBalance;

      await User.updateOne(
        { _id: u._id },
        {
          $set: {
            leaveYear: year,
            carryOverBalance,
            leaveBalance,
          },
        }
      );
      updated++;
    }

    log(`Yearly reset complete. Updated ${updated} users for year ${year}.`);
  } catch (err) {
    log(`Yearly reset failed: ${err.message}`);
    console.error(err);
  }
}

/**
 * Schedule cron: every Jan 1 at 00:01.
 */
export function scheduleYearlyReset() {
  cron.schedule("1 0 1 1 *", () => {
    runYearlyReset();
  });
  log("Scheduled yearly leave reset (1 Jan 00:01).");
}

export async function runOnce() {
  await runYearlyReset();
}

export default { scheduleYearlyReset, runOnce };
