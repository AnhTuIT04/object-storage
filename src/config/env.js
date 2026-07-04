require('dotenv').config();

const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT', 'AWS_REGION'];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const toBool = (value) => {
    if (value === undefined) return false;
    return String(value).toLowerCase() === 'true';
};

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        endpoint: process.env.AWS_ENDPOINT,
        forcePathStyle: toBool(process.env.AWS_S3_FORCE_PATH_STYLE),
    },
    objectAccessUrl: process.env.OBJECT_ACCESS_URL,
    upload: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxFiles: 10,
    },
};
