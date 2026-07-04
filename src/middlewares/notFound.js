const { fail } = require('../utils/response');

module.exports = (req, res) => {
    fail(res, 'Route not found', 404);
};
