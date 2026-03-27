import { getRedisClient } from '../config/redis.js';

const rateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      const key = `rate_limit:${req.ip}`;
      
      const current = await redis.get(key);
      
      if (current === null) {
        // First request, set counter to 1 with expiry
        await redis.setEx(key, Math.ceil(windowMs / 1000), '1');
        next();
      } else if (parseInt(current) < maxRequests) {
        // Increment counter
        await redis.incr(key);
        next();
      } else {
        // Rate limit exceeded
        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`
        });
      }
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Allow request to continue if rate limiter fails
    }
  };
};

export default rateLimiter;