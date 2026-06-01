require('dotenv').config({ path: '.env.local' });

const { Redis } = require('@upstash/redis');

async function testRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(
      '❌ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not found in .env.local'
    );
    process.exit(1);
  }

  console.log('🚀 Connecting to Upstash Redis...');

  const redis = new Redis({
    url,
    token,
  });

  try {
    // Test Write
    const writeStart = Date.now();

    await redis.set('test:connection', 'Redis is working!', {
      ex: 60,
    });

    const writeTime = Date.now() - writeStart;

    console.log(`✅ Write successful (${writeTime}ms)`);

    // Test Read
    const readStart = Date.now();

    const value = await redis.get('test:connection');

    const readTime = Date.now() - readStart;

    if (value === 'Redis is working!') {
      console.log(`✅ Read successful: "${value}" (${readTime}ms)`);
    } else {
      console.error('❌ Read failed: Value mismatch');
      console.log('Received:', value);
    }

    console.log('\n--- Performance Test ---');
    console.log(`Redis response time: ${readTime}ms`);
    console.log('Typical DB response: 100-300ms');

    if (readTime > 0) {
      console.log(
        `Estimated Speedup: ${Math.round(200 / readTime)}x faster`
      );
    }
  } catch (error) {
    console.error('❌ Redis connection error:');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testRedis();