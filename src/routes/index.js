const express = require('express');
const systemRoutes = require('./system');
const uploadRoutes = require('./uploads');
const bucketRoutes = require('./buckets');

const router = express.Router();

router.use(systemRoutes);
router.use(uploadRoutes);
router.use(bucketRoutes);

module.exports = router;
