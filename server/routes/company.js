import { Router } from 'express';
import { getDb } from '../config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const DOC_ID = 'main_config';
const COLLECTION = 'companyDetails';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORE_FILE = path.join(__dirname, '../data/store.json');

// Write queue to serialize concurrent updates to store.json
let writeQueue = Promise.resolve();

// Helper to read fallback store
function getLocalFallback() {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, 'utf8'));
      return data.companyDetails?.[DOC_ID] || null;
    }
  } catch (err) {
    console.warn('Error reading local fallback:', err.message);
  }
  return null;
}

// Helper to save fallback store with serialized queue
function saveLocalFallback(data) {
  writeQueue = writeQueue.then(async () => {
    try {
      let store = {};
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        store = JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, 'utf8'));
      }
      if (!store.companyDetails) store.companyDetails = {};
      store.companyDetails[DOC_ID] = { ...(store.companyDetails[DOC_ID] || {}), ...data };
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
    } catch (err) {
      console.warn('Error saving local fallback:', err.message);
    }
  });
  return writeQueue;
}

/**
 * GET /api/company
 * Retrieve dynamic company details stored in Firebase
 */
router.get('/', async (_req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();

    if (!doc.exists) {
      const localData = getLocalFallback();
      if (localData) {
        return res.json({ success: true, isCustomized: true, data: localData });
      }
      return res.json({ success: true, isCustomized: false, data: null });
    }

    return res.json({ success: true, isCustomized: true, data: doc.data() });
  } catch (err) {
    console.warn('Firebase read notice (using local fallback):', err.message);
    const localData = getLocalFallback();
    if (localData) {
      return res.json({ success: true, isCustomized: true, data: localData });
    }
    return res.json({ success: true, isCustomized: false, data: null });
  }
});

/**
 * PUT /api/company
 * Update company details (Admin only)
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // Keep local fallback store in sync using serialized queue
    await saveLocalFallback(updateData);

    try {
      const db = getDb();
      await db.collection(COLLECTION).doc(DOC_ID).set(updateData, { merge: true });
    } catch (dbErr) {
      console.warn('[Firebase] Notice while saving to Firestore (local copy saved):', dbErr.message);
      if (dbErr.message.includes('firestore.googleapis.com') || dbErr.code === 7) {
        return res.json({
          success: true,
          message: 'Saved to database! (Note: Enable Cloud Firestore in Firebase Console for cloud sync)',
          data: updateData,
          firestoreNotice:
            'Please create/enable Cloud Firestore in Firebase Console: https://console.firebase.google.com/project/senthoora-fancy/firestore',
        });
      }
    }

    return res.json({
      success: true,
      message: 'Store details updated successfully!',
      data: updateData,
    });
  } catch (err) {
    console.error('Update company details error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
