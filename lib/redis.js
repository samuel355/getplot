const isUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let client;
let clientType;

const initClient = async () => {
  if (client) return;

  if (isUpstash) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const { Redis: UpstashRedis } = await import("@upstash/redis");
    client = new UpstashRedis({ url, token });
    clientType = "upstash";
  } else if (process.env.REDIS_URL) {
    const { default: IORedis } = await import("ioredis");
    client = new IORedis(process.env.REDIS_URL);
    clientType = "ioredis";
  } else {
    throw new Error(
      "No Redis configuration found. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN or REDIS_URL",
    );
  }
};

// Adapter providing a consistent API for get/set/keys/del across clients
const redis = {
  get type() {
    return clientType;
  },
  get raw() {
    return client;
  },
  async get(key) {
    await initClient();
    return client.get(key);
  },
  async set(key, value, ttl) {
    await initClient();
    if (clientType === "upstash") {
      // Upstash set accepts an options object for expiration
      if (typeof ttl === "number") return client.set(key, value, { ex: ttl });
      return client.set(key, value);
    }

    // ioredis: set with EX <seconds>
    if (typeof ttl === "number") return client.set(key, value, "EX", ttl);
    return client.set(key, value);
  },
  async keys(pattern) {
    await initClient();
    return client.keys(pattern);
  },
  async del(...keys) {
    await initClient();
    return client.del(...keys);
  },
};

export default redis;

/**
 * Generic caching helper
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default 3600 / 1 hour)
 */
export async function getOrSetCache(key, fetchFn, ttl = 3600) {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`Cache hit for key: ${key}`);
      return JSON.parse(cachedData);
    }

    console.log(`Cache miss for key: ${key}. Fetching data...`);
    const data = await fetchFn();

    if (data) {
      await redis.set(key, JSON.stringify(data), ttl);
    }

    return data;
  } catch (error) {
    console.error(`Redis error for key ${key}:`, error);
    // Fallback to fetching data directly if Redis fails
    return await fetchFn();
  }
}

/**
 * Clear cache for a specific key or pattern
 * @param {string} key - Cache key or pattern (if usePattern is true)
 * @param {boolean} usePattern - Whether to treat key as a pattern (e.g., "properties:*")
 */
export async function clearCache(key, usePattern = false) {
  try {
    if (usePattern) {
      const keys = await redis.keys(key);
      if (keys && keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} cache keys matching pattern: ${key}`);
      }
    } else {
      await redis.del(key);
      console.log(`Cleared cache key: ${key}`);
    }
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
}
