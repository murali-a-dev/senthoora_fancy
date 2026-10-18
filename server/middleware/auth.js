import crypto from 'crypto';

// In-process cryptographic session store (token -> { createdAt, expiresAt })
const activeSessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Clean up expired sessions periodically to avoid memory growth
 */
function purgeExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}

// Run purge check every 30 minutes
setInterval(purgeExpiredSessions, 30 * 60 * 1000).unref?.();

/**
 * Issue a cryptographically unguessable admin session token
 */
export function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return token;
}

/**
 * Verify if token is active and valid
 */
export function verifySession(token) {
  if (!token || typeof token !== 'string') return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

/**
 * Invalidate a token on logout
 */
export function destroySession(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

/**
 * Express middleware to protect admin-only routes
 */
export function requireAdmin(req, res, next) {
  const rawHeader = req.headers.authorization || '';
  const token = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : '';

  if (!token || !verifySession(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired admin session. Please log in with your Admin PIN.',
    });
  }

  next();
}

export default {
  createSession,
  verifySession,
  destroySession,
  requireAdmin,
};
