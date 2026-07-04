const path = require('path');

/**
 * Generate a unique object key for an uploaded file.
 * Format: `<timestamp>-<random>` optionally suffixed with the original file extension.
 */
const generateKey = (originalname) => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(7);
    const ext = originalname ? path.extname(originalname) : '';
    return `${timestamp}-${random}${ext}`;
};

module.exports = { generateKey };
