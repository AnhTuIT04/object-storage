const multer = require('multer');
const env = require('./env');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: env.upload.maxFileSize,
    },
});

module.exports = upload;
