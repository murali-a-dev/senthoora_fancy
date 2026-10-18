import { Router } from 'express';
import { createSession, verifySession, destroySession, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/admin/auth
 * Authenticate with configured Admin PIN
 */
router.post('/auth', (req, res) => {
  try {
    const { pin } = req.body;
    const configuredPin = process.env.ADMIN_PIN || '1234';

    if (!pin) {
      return res.status(400).json({ success: false, message: 'Please enter the Admin PIN' });
    }

    // Strict validation against configured PIN (no hardcoded bypass)
    if (String(pin).trim() === String(configuredPin).trim()) {
      const token = createSession();
      return res.json({
        success: true,
        message: 'Access granted to Sri Senthoora Fancy Store Admin Portal',
        token,
        adminUser: {
          role: 'Administrator',
          store: 'Sri Senthoora Fancy Store',
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Incorrect Admin PIN. Please verify and try again.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/verify
 * Validate existing admin session token
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (verifySession(token)) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false, message: 'Invalid or expired session' });
});

/**
 * POST /api/admin/logout
 * Revoke admin session token
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  destroySession(token);
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
