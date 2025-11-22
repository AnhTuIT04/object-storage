const express = require('express');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { ListBucketsCommand, ListObjectsV2Command, CreateBucketCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: "*",
    credentials: false
}));
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Object Storage API Documentation"
}));

// Configure AWS SDK v3 for ClawCloud
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true'
});

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Utility function to upload file to S3
const uploadToS3 = async (file, bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // Make file publicly readable
    };

    try {
        const upload = new Upload({
            client: s3Client,
            params: params
        });
        
        const result = await upload.done();
        
        // Construct the URL manually since SDK v3 doesn't return Location
        const endpoint = process.env.AWS_ENDPOINT || `https://s3.${process.env.AWS_REGION}.amazonaws.com`;
        const url = `${endpoint}/${bucketName}/${key}`;
        
        return {
            success: true,
            url: url,
            key: result.Key,
            bucket: result.Bucket
        };
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

/**
 * @swagger
 * /upload/{bucket}/single:
 *   post:
 *     summary: Upload a single file to a bucket
 *     description: Upload a single file to the specified ClawCloud storage bucket
 *     tags: [File Upload]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket to upload to
 *         example: my-bucket
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request - no file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/upload/:bucket/single', upload.single('file'), async (req, res) => {
    try {
        const { bucket } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Generate unique filename
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(7);
        const key = `${timestamp}-${random}`;
        const result = await uploadToS3(file, bucket, key);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: originalName,
                key: result.key,
                url: result.url,
                bucket: result.bucket,
                size: file.size,
                mimetype: file.mimetype
            }
        });

    } catch (error) {
        console.error('Single upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /upload/{bucket}/multiple:
 *   post:
 *     summary: Upload multiple files to a bucket
 *     description: Upload multiple files (up to 10) to the specified ClawCloud storage bucket
 *     tags: [File Upload]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket to upload to
 *         example: my-bucket
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *                 description: The files to upload (maximum 10 files)
 *     responses:
 *       200:
 *         description: Files upload process completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 *       400:
 *         description: Bad request - no files provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/upload/:bucket/multiple', upload.array('files', 10), async (req, res) => {
    try {
        const { bucket } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided'
            });
        }

        const uploadPromises = files.map(async (file) => {
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substring(7);
            const key = `${timestamp}-${random}`;
            
            try {
                const result = await uploadToS3(file, bucket, key);
                return {
                    success: true,
                    filename: file.originalname,
                    key: result.key,
                    url: result.url,
                    size: file.size,
                    mimetype: file.mimetype
                };
            } catch (error) {
                return {
                    success: false,
                    filename: file.originalname,
                    error: error.message
                };
            }
        });

        const results = await Promise.all(uploadPromises);
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        res.json({
            success: true,
            message: `Uploaded ${successful.length} of ${files.length} files`,
            data: {
                bucket: bucket,
                successful: successful,
                failed: failed,
                summary: {
                    total: files.length,
                    successful: successful.length,
                    failed: failed.length
                }
            }
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Object Storage API is running'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2023-10-30T10:00:00.000Z'
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Object Storage API is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: List all buckets
 *     description: Retrieve a list of all available buckets in the ClawCloud storage
 *     tags: [Bucket Management]
 *     responses:
 *       200:
 *         description: List of buckets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BucketsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/buckets', async (req, res) => {
    try {
        const command = new ListBucketsCommand({});
        const result = await s3Client.send(command);
        res.json({
            success: true,
            buckets: result.Buckets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /bucket/{bucket}/objects:
 *   get:
 *     summary: List objects in a bucket
 *     description: Retrieve a list of all objects in the specified bucket
 *     tags: [Bucket Management]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket to list objects from
 *         example: my-bucket
 *     responses:
 *       200:
 *         description: List of objects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObjectsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/bucket/:bucket/objects', async (req, res) => {
    try {
        const { bucket } = req.params;
        const command = new ListObjectsV2Command({ Bucket: bucket });
        const result = await s3Client.send(command);
        
        res.json({
            success: true,
            bucket: bucket,
            objects: result.Contents || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /bucket/{bucket}/create:
 *   post:
 *     summary: Create a new bucket
 *     description: Create a new bucket in ClawCloud storage
 *     tags: [Bucket Management]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket to create
 *         example: my-new-bucket
 *     responses:
 *       200:
 *         description: Bucket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Bucket created successfully'
 *                 bucket:
 *                   type: string
 *                   example: 'my-new-bucket'
 *       409:
 *         description: Bucket already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/bucket/:bucket/create', async (req, res) => {
    try {
        const { bucket } = req.params;
        
        const params = {
            Bucket: bucket,
            CreateBucketConfiguration: {
                LocationConstraint: process.env.AWS_REGION
            }
        };

        const command = new CreateBucketCommand(params);
        await s3Client.send(command);
        
        res.json({
            success: true,
            message: 'Bucket created successfully',
            bucket: bucket
        });
    } catch (error) {
        const statusCode = error.$metadata?.httpStatusCode === 409 ? 409 : 500;
        const message = statusCode === 409 ? 'Bucket already exists' : error.message;
        
        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
});

// Serve test HTML file
app.get('/test.html', (req, res) => {
    res.sendFile(__dirname + '/test.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Object Storage API server running on port ${PORT}`);
    console.log(`📁 Endpoint: ${process.env.AWS_ENDPOINT}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;