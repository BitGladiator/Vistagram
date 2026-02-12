const sharp = require('sharp');

// Image size variants
const IMAGE_SIZES = {
  original: null,       // Keep original dimensions
  large: {              // Full display
    width: 1080,
    height: 1080
  },
  medium: {             // Feed display
    width: 640,
    height: 640
  },
  thumbnail: {          // Small thumbnail
    width: 320,
    height: 320
  },
  small: {              // Profile picture size
    width: 150,
    height: 150
  }
};

// Process and resize image
const processImage = async (inputBuffer, sizeName) => {
  try {
    const size = IMAGE_SIZES[sizeName];

    let processor = sharp(inputBuffer)
      .withMetadata(false) // Strip EXIF data (privacy)
      .jpeg({ quality: 85, progressive: true }); // Convert to JPEG

    if (size) {
      processor = processor.resize(size.width, size.height, {
        fit: 'inside',        // Maintain aspect ratio
        withoutEnlargement: true  // Don't upscale small images
      });
    }

    const outputBuffer = await processor.toBuffer();
    return outputBuffer;
  } catch (error) {
    console.error(`Error processing image (${sizeName}):`, error);
    throw error;
  }
};

// Extract image metadata
const extractMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
};

// Generate all size variants
const generateVariants = async (inputBuffer) => {
  const variants = {};

  for (const sizeName of ['large', 'medium', 'thumbnail']) {
    variants[sizeName] = await processImage(inputBuffer, sizeName);
  }

  return variants;
};

module.exports = {
  processImage,
  extractMetadata,
  generateVariants,
  IMAGE_SIZES
};