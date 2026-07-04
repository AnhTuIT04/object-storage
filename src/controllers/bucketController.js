const {
    ListBucketsCommand,
    ListObjectsV2Command,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const env = require('../config/env');
const { success, fail } = require('../utils/response');

exports.listBuckets = async (req, res) => {
    try {
        const result = await s3Client.send(new ListBucketsCommand({}));
        success(res, { buckets: result.Buckets });
    } catch (error) {
        fail(res, error.message, 500);
    }
};

exports.listObjects = async (req, res) => {
    try {
        const { bucket } = req.params;
        const result = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket }));
        success(res, { bucket, objects: result.Contents || [] });
    } catch (error) {
        fail(res, error.message, 500);
    }
};

exports.createBucket = async (req, res) => {
    try {
        const { bucket } = req.params;

        // R2 only accepts LocationConstraint values that are location hints
        // (wnam, enam, weur, eeur, apac, oc). The values "auto", "us-east-1"
        // and "" alias to automatic placement, in which case we must NOT send
        // CreateBucketConfiguration at all (R2 rejects LocationConstraint: auto).
        const region = env.aws.region;
        const isLocationHint = ['wnam', 'enam', 'weur', 'eeur', 'apac', 'oc'].includes(region);

        const params = {
            Bucket: bucket,
            ...(isLocationHint && {
                CreateBucketConfiguration: { LocationConstraint: region },
            }),
        };

        await s3Client.send(new CreateBucketCommand(params));

        success(res, { message: 'Bucket created successfully', bucket });
    } catch (error) {
        const statusCode = error.$metadata?.httpStatusCode === 409 ? 409 : 500;
        const message = statusCode === 409 ? 'Bucket already exists' : error.message;
        fail(res, message, statusCode);
    }
};

exports.deleteObject = async (req, res) => {
    try {
        const { bucket, key } = req.params;

        await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

        success(res, {
            message: 'Object deleted successfully',
            data: { bucket, key },
        });
    } catch (error) {
        fail(res, error.message, 500);
    }
};

exports.resetBucket = async (req, res) => {
    try {
        const { bucket } = req.params;
        let continuationToken;
        let deletedCount = 0;

        // List and delete in batches until the bucket is empty.
        do {
            const listResult = await s3Client.send(
                new ListObjectsV2Command({
                    Bucket: bucket,
                    ContinuationToken: continuationToken,
                })
            );

            const objects = listResult.Contents || [];

            if (objects.length > 0) {
                // Batch delete up to 1000 objects per request.
                for (let i = 0; i < objects.length; i += 1000) {
                    const chunk = objects.slice(i, i + 1000);
                    const result = await s3Client.send(
                        new DeleteObjectsCommand({
                            Bucket: bucket,
                            Delete: {
                                Objects: chunk.map((o) => ({ Key: o.Key })),
                                Quiet: true,
                            },
                        })
                    );
                    const errors = result.Errors || [];
                    deletedCount += chunk.length - errors.length;
                }
            }

            continuationToken = listResult.IsTruncated
                ? listResult.NextContinuationToken
                : undefined;
        } while (continuationToken);

        success(res, {
            message: 'Bucket reset successfully',
            data: { bucket, deletedCount },
        });
    } catch (error) {
        fail(res, error.message, 500);
    }
};
