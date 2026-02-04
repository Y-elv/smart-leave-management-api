import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

/**
 * Generate a signed JWT for the authenticated user.
 *
 * @param {object} payload - data to embed in the token (e.g. { id, role })
 * @param {object} [options] - optional overrides for jwt.sign
 * @returns {string} signed JWT
 */
export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
};

/**
 * Verify a JWT and return the decoded payload.
 *
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} if token is invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  signToken,
  verifyToken,
};

