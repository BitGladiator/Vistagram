const Minio = require('minio');
require('dotenv').config();

// Create MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Initialize bucket
const initBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);

    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Created MinIO bucket: ${BUCKET_NAME}`);

      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(
        BUCKET_NAME,
        JSON.stringify(policy)
      );

      console.log(`Set public read policy on bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`MinIO bucket exists: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
    throw error;
  }
};

// Upload file to MinIO
const uploadFile = async (objectName, buffer, contentType) => {
  try {
    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': contentType }
    );

    const url = `${process.env.CDN_URL}/${objectName}`;
    console.log(`Uploaded file: ${objectName}`);
    return url;
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw error;
  }
};

// Delete file from MinIO
const deleteFile = async (objectName) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
    console.log(`Deleted file: ${objectName}`);
    return true;
  } catch (error) {
    console.error('MinIO delete error:', error);
    throw error;
  }
};

// Generate presigned URL for direct upload
const getPresignedUploadUrl = async (objectName, expiry = 900) => {
  try {
    const url = await minioClient.presignedPutObject(
      BUCKET_NAME,
      objectName,
      expiry
    );
    return url;
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw error;
  }
};

module.exports = {
  minioClient,
  BUCKET_NAME,
  initBucket,
  uploadFile,
  deleteFile,
  getPresignedUploadUrl
};