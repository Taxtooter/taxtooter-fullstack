import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
});

// Initialize Redis connection
const initializeRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        process.exit(1);
    }
};

export { redisClient, initializeRedis }; 