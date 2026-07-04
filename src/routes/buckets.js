const express = require('express');
const bucketController = require('../controllers/bucketController');

const router = express.Router();

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: List all buckets
 *     description: Retrieve a list of all available buckets in the Cloudflare R2 account
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
router.get('/buckets', bucketController.listBuckets);

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
router.get('/bucket/:bucket/objects', bucketController.listObjects);

/**
 * @swagger
 * /bucket/{bucket}/create:
 *   post:
 *     summary: Create a new bucket
 *     description: Create a new bucket in Cloudflare R2
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
router.post('/bucket/:bucket/create', bucketController.createBucket);

/**
 * @swagger
 * /bucket/{bucket}/object/{key}:
 *   delete:
 *     summary: Delete a single object in a bucket
 *     description: Delete one object by its key in the specified bucket
 *     tags: [Bucket Management]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket
 *         example: my-bucket
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The object key to delete
 *         example: 1710000000000-abc123.jpg
 *     responses:
 *       200:
 *         description: Object deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/bucket/:bucket/object/:key', bucketController.deleteObject);

/**
 * @swagger
 * /bucket/{bucket}/reset:
 *   delete:
 *     summary: Reset a bucket
 *     description: Delete all objects in the specified bucket (batched, up to 1000 per request)
 *     tags: [Bucket Management]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the bucket to reset
 *         example: my-bucket
 *     responses:
 *       200:
 *         description: Bucket reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/bucket/:bucket/reset', bucketController.resetBucket);

module.exports = router;
