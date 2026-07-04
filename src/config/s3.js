const { S3Client } = require('@aws-sdk/client-s3');
const env = require('./env');

const s3Client = new S3Client({
    credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
    },
    region: env.aws.region,
    endpoint: env.aws.endpoint,
    forcePathStyle: env.aws.forcePathStyle,
});

module.exports = s3Client;
