const { Upload } = require('@aws-sdk/lib-storage');
const env = require('../config/env');
const s3Client = require('../config/s3');

/**
 * Upload a single file to S3 using multipart upload via lib-storage.
 * Returns the public URL constructed from OBJECT_ACCESS_URL plus the object key.
 */
const uploadToS3 = async (file, bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
    };

    try {
        const upload = new Upload({ client: s3Client, params });
        const result = await upload.done();

        const url = env.objectAccessUrl
            ? `${env.objectAccessUrl}/${key}`
            : result.Location;

        return {
            success: true,
            url,
            key: result.Key,
            bucket: result.Bucket,
        };
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

module.exports = { uploadToS3 };
