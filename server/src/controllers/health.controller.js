const mongoose = require('mongoose');
const { connection: redisConnection } = require('../config/queue');

// @desc    Check DB Health
// @route   GET /api/health/db
exports.getDbHealth = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

        const statusMap = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };

        const redisStatus = redisConnection.status;
        // connecting, connect, ready, close, reconnecting, end

        const isHealthy = dbStatus === 1 && redisStatus === 'ready';

        if (!isHealthy) {
            return res.status(503).json({
                success: false,
                status: 'Unhealthy',
                services: {
                    mongodb: statusMap[dbStatus] || 'Unknown',
                    redis: redisStatus
                },
                timestamp: new Date()
            });
        }

        res.status(200).json({
            success: true,
            status: 'Healthy',
            services: {
                mongodb: statusMap[dbStatus],
                redis: redisStatus
            },
            timestamp: new Date()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
