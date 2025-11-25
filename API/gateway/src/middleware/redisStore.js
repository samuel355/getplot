/**
 * Custom Redis Store for express-rate-limit compatible with redis v4+
 * This adapter bridges the gap between express-rate-limit and the new redis client
 */
class RedisStore {
  constructor(options) {
    // Support both direct client or getter function for lazy access
    this.getClient = typeof options.getClient === 'function' 
      ? options.getClient 
      : () => options.client;
    this.prefix = options.prefix || 'rl:';
    this.windowMs = options.windowMs || 15 * 60 * 1000;
  }
  
  get client() {
    return this.getClient();
  }

  /**
   * Get rate limit data from Redis
   * express-rate-limit expects this to return a promise or use callback
   */
  async get(key) {
    try {
      if (!this.client) {
        return undefined;
      }
      const stored = await this.client.get(`${this.prefix}${key}`);
      if (!stored) {
        return undefined;
      }
      return JSON.parse(stored);
    } catch (err) {
      // Return undefined on error to allow requests through
      return undefined;
    }
  }

  /**
   * Increment rate limit counter
   * express-rate-limit expects: { totalHits, resetTime }
   */
  async increment(key) {
    try {
      if (!this.client) {
        // If Redis is not available, allow the request
        return {
          totalHits: 1,
          resetTime: new Date(Date.now() + this.windowMs),
        };
      }

      const redisKey = `${this.prefix}${key}`;
      const now = Date.now();
      
      // Increment the counter
      const count = await this.client.incr(redisKey);
      
      // Set expiration on first increment (TTL in seconds)
      if (count === 1) {
        await this.client.expire(redisKey, Math.ceil(this.windowMs / 1000));
      }

      // Get remaining TTL to calculate reset time
      const ttl = await this.client.ttl(redisKey);
      const resetTime = new Date(now + (ttl > 0 ? ttl * 1000 : this.windowMs));

      return {
        totalHits: count,
        resetTime,
      };
    } catch (err) {
      // On error, allow the request (fail open)
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.windowMs),
      };
    }
  }

  /**
   * Decrement rate limit counter (optional, used by skipSuccessfulRequests)
   */
  async decrement(key) {
    try {
      if (this.client) {
        await this.client.decr(`${this.prefix}${key}`);
      }
    } catch (err) {
      // Ignore errors on decrement
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetKey(key) {
    try {
      if (this.client) {
        await this.client.del(`${this.prefix}${key}`);
      }
    } catch (err) {
      // Ignore errors on reset
    }
  }

  /**
   * Shutdown the store (optional)
   */
  shutdown() {
    // The client is managed by the shared redis module
    // Don't disconnect here
  }
}

module.exports = RedisStore;

