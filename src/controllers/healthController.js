const { success } = require('../utils/response');

exports.health = (req, res) => {
    success(res, {
        message: 'Object Storage API is running',
        timestamp: new Date().toISOString(),
    });
};
