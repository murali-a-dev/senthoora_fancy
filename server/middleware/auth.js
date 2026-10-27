import crypto from 'crypto';

// Secret key for HMAC signing (uses configured ADMIN_PIN + secret salt)
const getSecretKey = () => {
  const pin = process.env.ADMIN_PIN || '1234';
  const secret = process.env.SESSION_SECRET || 'senthoora-fancy-secure-hmac-salt-2026';
  return crypto.createHash('sha256').update(`${pin}:${secret}`).digest();
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const revokedTokens = new Set();

/**
 * Issue a cryptographically signed admin session token.
 * Stateless: remains valid even across server/nodemon restarts.
 */
export function createSession() {
  const expiry = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${expiry}.${nonce}`;
  const hmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify if token is active and cryptographically valid.
 */
export function verifySession(token) {
  if (!token || typeof token !== 'string') return false;
  if (revokedTokens.has(token)) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiryStr, nonce, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    return false;
  }

  const payload = `${expiryStr}.${nonce}`;
  const expectedHmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expectedHmac, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Invalidate a token on logout
 */
export function destroySession(token) {
  if (token) {
    revokedTokens.add(token);
    if (revokedTokens.size > 1000) {
      const first = revokedTokens.values().next().value;
      revokedTokens.delete(first);
    }
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
