const success = (res, data = {}, status = 200) =>
    res.status(status).json({ success: true, ...data });

const fail = (res, message, status = 500, extra = {}) =>
    res.status(status).json({ success: false, message, ...extra });

module.exports = { success, fail };
