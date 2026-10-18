import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const getCloudinaryConfig = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const config = getCloudinaryConfig();
const isConfigured = Boolean(config.cloud_name && config.api_key && config.api_secret);

if (isConfigured) {
  cloudinary.config(config);
  console.log(`[Cloudinary] Configured for cloud: ${config.cloud_name}`);
} else {
  console.warn('[Cloudinary] Missing environment credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Image uploads will require configuration.');
}

function ensureConfigured() {
  const currentConfig = getCloudinaryConfig();
  if (!currentConfig.cloud_name || !currentConfig.api_key || !currentConfig.api_secret) {
    throw new Error('Cloudinary credentials missing in server environment. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
  cloudinary.config(currentConfig);
}

/**
 * Upload a Base64 data URI to Cloudinary.
 * @param {string} dataUri 
 * @param {string} folder 
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadBase64(dataUri, folder = process.env.CLOUDINARY_FOLDER || 'senthoora_fancy_showcase') {
  ensureConfigured();

  if (!dataUri) {
    throw new Error('No image data provided for upload.');
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Upload a multer file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @param {string} folder 
 */
export function uploadBuffer(buffer, filename, folder = process.env.CLOUDINARY_FOLDER || 'senthoora_fancy_showcase') {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Stream Error]:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary by public ID.
 * @param {string} publicId 
 */
export async function deleteImage(publicId) {
  if (!publicId) return null;
  try {
    const currentConfig = getCloudinaryConfig();
    if (!currentConfig.cloud_name || !currentConfig.api_key || !currentConfig.api_secret) {
      console.warn('[Cloudinary] Skipping asset deletion: credentials not configured.');
      return null;
    }
    cloudinary.config(currentConfig);
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
    return null;
  }
}

export { cloudinary, isConfigured };
export default { uploadBase64, uploadBuffer, deleteImage, cloudinary, isConfigured };
