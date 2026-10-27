/**
 * Shared image utilities — import from here in all components.
 * Fixes: compressImage was duplicated in AdminInventory.jsx and AdminAbout.jsx.
 */

/**
 * Compresses an image File to a base64 data URI.
 * @param {File} file - Image file to compress
 * @param {number} maxDim - Maximum width/height in pixels (default 1200)
 * @param {number} quality - JPEG quality 0–1 (default 0.85)
 * @param {number} maxSizeBytes - Reject files larger than this before reading (default 20 MB)
 * @returns {Promise<string>} Base64 data URI
 */
export const compressImage = (file, maxDim = 1200, quality = 0.85, maxSizeBytes = 20 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided.'));

    // FIX: Reject huge files before they can freeze the browser tab
    if (file.size > maxSizeBytes) {
      return reject(
        new Error(
          `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please use a file under ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`
        )
      );
    }

    if (!file.type?.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target.result); // fallback: uncompressed
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
