const { v4: uuidv4 } = require('uuid');
const { uploadFile, getPresignedUploadUrl } = require('../config/minio');
const { query } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const { generateVariants, extractMetadata } = require('../services/imageProcessor');

// Upload image directly
const uploadImage = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const post_id = req.body.post_id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    if (!post_id) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'post_id is required'
        }
      });
    }

    const media_id = uuidv4();
    const fileBuffer = req.file.buffer;
    const contentType = 'image/jpeg'; // We convert everything to JPEG

    console.log(`Processing image for post: ${post_id}`);

    // Extract metadata from original
    const metadata = await extractMetadata(fileBuffer);
    console.log('Image metadata:', metadata);

    // Generate size variants
    console.log('Generating image variants...');
    const variants = await generateVariants(fileBuffer);

    // Upload all variants to MinIO
    const basePath = `posts/${user_id}/${post_id}/${media_id}`;

    const [largeUrl, mediumUrl, thumbnailUrl] = await Promise.all([
      uploadFile(`${basePath}/large.jpg`, variants.large, contentType),
      uploadFile(`${basePath}/medium.jpg`, variants.medium, contentType),
      uploadFile(`${basePath}/thumbnail.jpg`, variants.thumbnail, contentType),
    ]);

    // Save to database
    await query(
      `INSERT INTO post_media (
        media_id, post_id, media_type, 
        media_url, feed_url, thumbnail_url,
        width, height, file_size, order_index
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        media_id, post_id, 'image',
        largeUrl, mediumUrl, thumbnailUrl,
        metadata.width, metadata.height,
        req.file.size, 0
      ]
    );

    // Publish event (for feed service, post service etc.)
    await publishEvent('media_uploaded', {
      media_id,
      post_id,
      user_id,
      media_type: 'image',
      urls: {
        large: largeUrl,
        medium: mediumUrl,
        thumbnail: thumbnailUrl
      }
    });

    console.log(`Media upload complete: ${media_id}`);

    res.status(201).json({
      status: 'success',
      data: {
        media: {
          media_id,
          post_id,
          media_type: 'image',
          urls: {
            large: largeUrl,
            medium: mediumUrl,
            thumbnail: thumbnailUrl
          },
          metadata: {
            width: metadata.width,
            height: metadata.height,
            file_size: req.file.size
          }
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload story image (no post_id required)
const uploadStory = async (req, res, next) => {
  try {
    const user_id = req.userId;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'NO_FILE', message: 'No file uploaded' }
      });
    }

    const media_id = uuidv4();
    const fileBuffer = req.file.buffer;
    const contentType = 'image/jpeg';

    const metadata = await extractMetadata(fileBuffer);
    const variants = await generateVariants(fileBuffer);

    const basePath = `stories/${user_id}/${media_id}`;

    const [largeUrl, mediumUrl, thumbnailUrl] = await Promise.all([
      uploadFile(`${basePath}/large.jpg`, variants.large, contentType),
      uploadFile(`${basePath}/medium.jpg`, variants.medium, contentType),
      uploadFile(`${basePath}/thumbnail.jpg`, variants.thumbnail, contentType),
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        media: {
          media_id,
          media_type: 'image',
          url: mediumUrl,
          urls: {
            large: largeUrl,
            medium: mediumUrl,
            thumbnail: thumbnailUrl
          },
          metadata: {
            width: metadata.width,
            height: metadata.height,
            file_size: req.file.size
          }
        }
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};


// Get presigned URL for direct browser upload
const getUploadUrl = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { post_id, file_name, file_type } = req.body;

    if (!post_id || !file_name || !file_type) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'post_id, file_name, and file_type are required'
        }
      });
    }

    const media_id = uuidv4();
    const objectName = `posts/${user_id}/${post_id}/${media_id}/original.jpg`;

    // Generate presigned URL (valid for 15 minutes)
    const uploadUrl = await getPresignedUploadUrl(objectName, 900);

    res.status(200).json({
      status: 'success',
      data: {
        upload_url: uploadUrl,
        media_id,
        object_name: objectName,
        expires_in: 900
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get media by ID
const getMedia = async (req, res, next) => {
  try {
    const { media_id } = req.params;

    const result = await query(
      `SELECT * FROM post_media WHERE media_id = $1`,
      [media_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'MEDIA_NOT_FOUND',
          message: 'Media not found'
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        media: result.rows[0]
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all media for a post
const getPostMedia = async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await query(
      `SELECT * FROM post_media 
       WHERE post_id = $1 
       ORDER BY order_index ASC`,
      [post_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        media: result.rows
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadStory,
  getUploadUrl,
  getMedia,
  getPostMedia
};