import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const cacheMiddleware = (duration: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                logger.info('Cache hit', { key });
                return res.json(JSON.parse(cachedResponse));
            }

            // Store the original res.json function
            const originalJson = res.json;

            // Override res.json method
            res.json = function (body: any) {
                // Store the response in cache
                redisClient.setEx(key, duration, JSON.stringify(body))
                    .catch((err: any) => logger.error('Cache set error:', err));

                // Call the original res.json
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

// Function to clear cache for a specific pattern
export const clearCache = async (pattern: string) => {
    try {
        const keys = await redisClient.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info('Cache cleared', { pattern, keys });
        }
    } catch (error) {
        logger.error('Cache clear error:', error);
    }
}; 