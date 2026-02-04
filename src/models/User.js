import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

const currentYear = () => new Date().getFullYear();

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STAFF,
    },
    profilePictureUrl: {
      type: String,
      default: null,
    },

    /**
     * Yearly leave configuration and tracking.
     *
     * - annualLeaveEntitlement: base entitlement for a full year
     * - leaveBalance: current available leave days for the active leaveYear
     * - carryOverBalance: carried from previous year (max 5)
     * - leaveYear: the calendar year that leaveBalance applies to
     */
    annualLeaveEntitlement: {
      type: Number,
      default: 25,
      min: 0,
    },
    leaveBalance: {
      type: Number,
      default: 25,
      min: 0,
    },
    carryOverBalance: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    leaveYear: {
      type: Number,
      default: currentYear,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to shape user JSON for API responses
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    profilePictureUrl: this.profilePictureUrl,
    leaveBalance: this.leaveBalance,
    carryOverBalance: this.carryOverBalance,
    annualLeaveEntitlement: this.annualLeaveEntitlement,
    leaveYear: this.leaveYear,
  };
};

const User = model('User', userSchema);

export default User;

