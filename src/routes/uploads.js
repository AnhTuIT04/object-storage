const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

/**
 * @swagger
 * /upload/{bucket}/single:
 *   post:
 *     summary: Upload a single file to a bucket
 *     description: Upload a single file to the specified Cloudflare R2 bucket
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
 *         description: Bad request - no file provided or file too large
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
router.post('/upload/:bucket/single', uploadController.uploadSingle);

/**
 * @swagger
 * /upload/{bucket}/multiple:
 *   post:
 *     summary: Upload multiple files to a bucket
 *     description: Upload multiple files (up to 10) to the specified Cloudflare R2 bucket
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
 *         description: Bad request - no files provided or a file is too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or all uploads failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload/:bucket/multiple', uploadController.uploadMultiple);

module.exports = router;
