import { Router } from 'express';
import { getDb } from '../config/firebase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'inquiries';

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * POST /api/inquiry
 * Customer submits a product/store inquiry from Contact or Showcase
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message, productName, productId } = req.body;

    const cleanedName = sanitizeText(name);
    const cleanedPhone = sanitizeText(phone);

    if (!cleanedName || !cleanedPhone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const inquiry = {
      name: cleanedName,
      phone: cleanedPhone,
      email: sanitizeText(email),
      message: sanitizeText(message),
      productName: productName ? sanitizeText(productName) : null,
      productId: productId ? sanitizeText(productId) : null,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const db = getDb();
    const docRef = await db.collection(COLLECTION).add(inquiry);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Our store team will reach out soon.',
      id: docRef.id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/inquiry
 * Admin lists inquiries (Protected)
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION).get();
    const list = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
