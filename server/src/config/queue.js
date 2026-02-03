const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Create Redis Connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

connection.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
});

connection.on('connect', () => {
    console.log('✅ Redis Connected');
});

connection.on('ready', () => {
    console.log('✅ Redis Ready for Commands');
});

// Helper to wait for Redis readiness
const waitForRedis = () => {
    return new Promise((resolve, reject) => {
        if (connection.status === 'ready') return resolve(connection);

        connection.once('ready', () => resolve(connection));
        connection.once('error', (err) => reject(err));

        // Timeout after 10s
        setTimeout(() => {
            if (connection.status !== 'ready') {
                reject(new Error('Redis connection timeout'));
            }
        }, 10000);
    });
};

const csvUploadQueue = new Queue('csv-upload-queue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: {
            age: 24 * 3600,
        }
    }
});

const isQueueReady = () => {
    return connection.status === 'ready';
};

module.exports = { csvUploadQueue, connection, waitForRedis, isQueueReady };
