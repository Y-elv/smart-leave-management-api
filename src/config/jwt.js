/**
 * Simple JWT configuration helper.
 * Centralises access to the JWT secret and common options.
 */

export const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-production';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

