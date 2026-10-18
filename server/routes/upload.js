import { Router } from 'express';
import multer from 'multer';
import { uploadBase64, uploadBuffer } from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'), false);
    }
  },
});

/**
 * POST /api/upload
 * Requires Admin authentication
 * Supports either multipart file field 'image' or JSON { image: 'data:image/...base64' }
 */
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // 1. Multipart file upload
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, req.file.originalname);
      return res.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
        format: result.format,
      });
    }

    // 2. Base64 JSON upload
    const { image, base64 } = req.body;
    const payload = image || base64;
    if (payload && typeof payload === 'string' && payload.startsWith('data:image/')) {
      const result = await uploadBase64(payload);
      return res.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
        format: result.format,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'No valid image provided. Send a file or base64 data URI.',
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload image to Cloudinary.',
    });
  }
});

export default router;
