const upload = require('../config/multer');
const { uploadToS3 } = require('../utils/upload');
const { generateKey } = require('../utils/keyGenerator');
const { success, fail } = require('../utils/response');

exports.uploadSingle = [
    upload.single('file'),
    async (req, res) => {
        try {
            const { bucket } = req.params;
            const file = req.file;

            if (!file) {
                return fail(res, 'No file provided', 400);
            }

            const key = generateKey(file.originalname);
            const result = await uploadToS3(file, bucket, key);

            success(res, {
                message: 'File uploaded successfully',
                data: {
                    filename: file.originalname,
                    key: result.key,
                    url: result.url,
                    bucket: result.bucket,
                    size: file.size,
                    mimetype: file.mimetype,
                },
            });
        } catch (error) {
            console.error('Single upload error:', error);
            fail(res, error.message, 500);
        }
    },
];

exports.uploadMultiple = [
    upload.array('files', 10),
    async (req, res) => {
        try {
            const { bucket } = req.params;
            const files = req.files;

            if (!files || files.length === 0) {
                return fail(res, 'No files provided', 400);
            }

            const results = await Promise.all(
                files.map(async (file) => {
                    try {
                        const key = generateKey(file.originalname);
                        const result = await uploadToS3(file, bucket, key);
                        return {
                            success: true,
                            filename: file.originalname,
                            key: result.key,
                            url: result.url,
                            size: file.size,
                            mimetype: file.mimetype,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            filename: file.originalname,
                            error: error.message,
                        };
                    }
                })
            );

            const successful = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);

            const overallSuccess = successful.length > 0;
            const message = failed.length === 0
                ? `Uploaded ${successful.length} of ${files.length} files`
                : `Uploaded ${successful.length} of ${files.length} files (${failed.length} failed)`;

            res.status(overallSuccess ? 200 : 500).json({
                success: overallSuccess,
                message,
                data: {
                    bucket,
                    successful,
                    failed,
                    summary: {
                        total: files.length,
                        successful: successful.length,
                        failed: failed.length,
                    },
                },
            });
        } catch (error) {
            console.error('Multiple upload error:', error);
            fail(res, error.message, 500);
        }
    },
];
