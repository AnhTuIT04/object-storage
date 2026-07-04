const { fail } = require('../utils/response');

/**
 * Express error-handling middleware.
 * Surfaces multer errors (e.g. file too large) as 400 instead of generic 500.
 */
module.exports = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err && err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File size exceeds the 100MB limit'
            : err.message;
        return fail(res, message, 400);
    }

    console.error(err.stack || err);
    fail(res, 'Internal Server Error', 500);
};
