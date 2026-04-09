import { getRedisClient } from '../config/redis.js';

const rateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const redis = getRedisClient();

      const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress;

      const identifier = req.body.email || ip;
      const key = `rate_limit:${identifier}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again after ${Math.ceil(windowMs / 1000)} seconds.`,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

export default rateLimiter;