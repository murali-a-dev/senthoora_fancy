import { Router } from 'express';
import { getDb } from '../config/firebase.js';
import { deleteImage } from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'products';

// Helper to strip HTML tags from input
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * GET /api/inventory
 * Public and Admin listing of products
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION).get();
    const items = [];

    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt descending or id
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error('Fetch inventory error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/inventory/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/inventory
 * Add new inventory product
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, photo, image, imageId, rate, category, description, featured, badge, stockStatus, tags } = req.body;

    const imageUrl = photo || image;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Product photo is required.' });
    }
    if (rate === undefined || rate === null || rate === '' || isNaN(Number(rate))) {
      return res.status(400).json({ success: false, message: 'Valid display rate is required.' });
    }

    const numericRate = Number(rate);
    const cleanedName = sanitizeText(name);
    const cleanedDescription = sanitizeText(description);
    const cleanedBadge = sanitizeText(badge);
    const cleanedCategory = sanitizeText(category) || 'bangles';
    const cleanedStock = sanitizeText(stockStatus) || 'In Showroom';

    const processedTags = Array.isArray(tags)
      ? tags.map(sanitizeText).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => sanitizeText(t)).filter(Boolean)
      : [];

    const newItem = {
      name: cleanedName,
      photo: imageUrl,
      image: imageUrl,
      imageId: imageId || null,
      rate: numericRate,
      rateDisplay: `₹${numericRate.toLocaleString('en-IN')}`,
      category: cleanedCategory,
      description: cleanedDescription,
      featured: Boolean(featured),
      badge: cleanedBadge,
      stockStatus: cleanedStock,
      tags: processedTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = getDb();
    const docRef = await db.collection(COLLECTION).add(newItem);

    return res.status(201).json({
      success: true,
      message: 'Product added successfully to showcase!',
      data: { id: docRef.id, ...newItem },
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/inventory/:id
 * Edit existing product
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const existingData = doc.data();
    const { name, photo, image, imageId, rate, category, description, featured, badge, stockStatus, tags } = req.body;

    const newImageUrl = photo || image || existingData.image || existingData.photo;
    const numericRate = rate !== undefined && rate !== '' ? Number(rate) : existingData.rate;

    // Check if image changed and clean up old Cloudinary asset properly
    if (existingData.imageId && imageId && existingData.imageId !== imageId) {
      await deleteImage(existingData.imageId).catch((err) =>
        console.warn('[Cloudinary] Old image cleanup failed:', err.message)
      );
    }

    const updatedData = {
      name: name !== undefined ? sanitizeText(name) : existingData.name,
      photo: newImageUrl,
      image: newImageUrl,
      imageId: imageId !== undefined ? imageId : existingData.imageId,
      rate: numericRate,
      rateDisplay: `₹${numericRate.toLocaleString('en-IN')}`,
      category: category !== undefined ? sanitizeText(category) : existingData.category,
      description: description !== undefined ? sanitizeText(description) : existingData.description,
      featured: featured !== undefined ? Boolean(featured) : existingData.featured,
      badge: badge !== undefined ? sanitizeText(badge) : existingData.badge,
      stockStatus: stockStatus !== undefined ? sanitizeText(stockStatus) : existingData.stockStatus,
      tags: tags !== undefined
        ? (Array.isArray(tags) ? tags.map(sanitizeText).filter(Boolean) : String(tags).split(',').map(sanitizeText).filter(Boolean))
        : existingData.tags,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedData);

    return res.json({
      success: true,
      message: 'Product updated successfully!',
      data: { id, ...existingData, ...updatedData },
    });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete product
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const item = doc.data();

    // Remove from Cloudinary if imageId exists
    if (item.imageId) {
      await deleteImage(item.imageId).catch((err) =>
        console.warn('[Cloudinary] Image delete notice:', err.message)
      );
    }

    await docRef.delete();

    return res.json({
      success: true,
      message: 'Product removed from showcase.',
      deletedId: id,
    });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
