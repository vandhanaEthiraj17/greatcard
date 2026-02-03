const mongoose = require('mongoose');
const { connection: redisConnection, isQueueReady } = require('../config/queue');

// @desc    Ensure DB and Redis are available
// @usage   Apply to critical routes (like upload)
const ensureServicesReady = (req, res, next) => {
    const isDbReady = mongoose.connection.readyState === 1;
    const isRedisReady = redisConnection.status === 'ready';
    const isWorkerReady = isQueueReady(); // We assume if Redis is ready, Queue is ready 

    if (!isDbReady || !isRedisReady || !isWorkerReady) {
        console.warn(`[Service Guard] Blocked request. DB: ${isDbReady}, Redis: ${isRedisReady}, Worker/Queue: ${isWorkerReady}`);
        return res.status(503).json({
            success: false,
            message: 'Service is temporarily unavailable. Please try again later.'
        });
    }

    next();
};

module.exports = ensureServicesReady;
