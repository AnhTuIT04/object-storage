const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

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
router.get('/health', healthController.health);

module.exports = router;
