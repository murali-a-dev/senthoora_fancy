import { Router } from 'express';
import { getDb } from '../config/firebase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const DOC_ID = 'main_config';
const COLLECTION = 'companyDetails';

// Server-side in-memory cache for company details
let companyCache = null;
let companyCacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function invalidateCompanyCache() {
  companyCache = null;
  companyCacheTime = 0;
}

export async function getCachedCompany(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && companyCache && (now - companyCacheTime < CACHE_TTL_MS)) {
    return companyCache;
  }

  const db = getDb();
  const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
  const cachedData = {
    exists: doc.exists,
    data: doc.exists ? doc.data() : null,
  };

  companyCache = cachedData;
  companyCacheTime = now;
  return cachedData;
}

/**
 * GET /api/company
 * Retrieve dynamic company details stored in Cloud Firestore (served from in-memory cache)
 */
router.get('/', async (req, res) => {
  try {
    const forceFresh = req.query.fresh === 'true';
    const cached = await getCachedCompany(forceFresh);

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    if (!cached.exists || !cached.data) {
      return res.json({ success: true, isCustomized: false, data: null, cached: !forceFresh });
    }

    return res.json({ success: true, isCustomized: true, data: cached.data, cached: !forceFresh });
  } catch (err) {
    console.error('Fetch company details error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/company
 * Update company details in Cloud Firestore (Admin only)
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const db = getDb();
    await db.collection(COLLECTION).doc(DOC_ID).set(updateData, { merge: true });
    invalidateCompanyCache();

    return res.json({
      success: true,
      message: 'Store details updated successfully in Cloud Firestore!',
      data: updateData,
    });
  } catch (err) {
    console.error('Update company details error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
