import { getRedisClient } from '../config/redis.js';

const rateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    // Optionally skip securely in development if needed
    // if (process.env.NODE_ENV === 'development') return next();

    try {
      const redis = getRedisClient();

      let ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress ||
        req.ip;
      
      // Clean up IPv6 mapped IPv4
      if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
      }

      // To prevent bypassing the rate limit via random emails from the same IP,
      // we use both the IP and the email (if present) in the key, or we just rely on IP.
      const identifier = req.body?.email ? `${ip}:${req.body.email}` : ip;
      const key = `rate_limit:${identifier}`;

      // Use a multi block to perform atomic operations
      const multi = redis.multi();
      multi.incr(key);
      multi.ttl(key);
      
      const results = await multi.exec();
      const count = results[0];
      const ttl = results[1];

      const ttlSeconds = Math.ceil(windowMs / 1000);

      // Log values for debugging
      console.log(`[RateLimiter] Key: ${key} | Count: ${count} | TTL: ${ttl}`);

      // If this is the first request, or if the key somehow lost its TTL (ttl === -1), set it
      if (count === 1 || ttl === -1) {
        await redis.expire(key, ttlSeconds);
        console.log(`[RateLimiter] Set TTL for ${key} to ${ttlSeconds} seconds.`);
      }

      if (count > maxRequests) {
        const retryAfter = ttl > 0 ? ttl : ttlSeconds;
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again after ${retryAfter} seconds.`,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // In case of Redis failure, we fail open so the app keeps working
      next();
    }
  };
};

export default rateLimiter;