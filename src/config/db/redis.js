const redis = require('redis');
const logger = require('../../utils/logger');

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  }
});

const CART_PREFIX = 'cart:';
const SESSION_PREFIX = 'session:';
const DEFAULT_SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

const cartService = {
  getCart: async (userId) => {
    const key = CART_PREFIX + userId;
    const raw = await redisClient.get(key);
    if (!raw) return { items: [], updatedAt: null };
    try {
      return JSON.parse(raw);
    } catch {
      return { items: [], updatedAt: null };
    }
  },

  setCart: async (userId, cart) => {
    const key = CART_PREFIX + userId;
    const payload = { ...cart, updatedAt: new Date().toISOString() };
    await redisClient.set(key, JSON.stringify(payload));
    return payload;
  },

  deleteCart: async (userId) => {
    await redisClient.del(CART_PREFIX + userId);
  }
};

const sessionService = {
  set: async (key, value, ttlSec = DEFAULT_SESSION_TTL_SEC) => {
    const k = SESSION_PREFIX + key;
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setEx(k, ttlSec, val);
  },

  get: async (key) => {
    const raw = await redisClient.get(SESSION_PREFIX + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },

  del: async (key) => {
    await redisClient.del(SESSION_PREFIX + key);
  }
};

const initRedisData = async () => {
  try {
    await redisClient.set('user:name', 'Darula Admin');
    await redisClient.set('user:wallet_address', '0x1234567890ABCDEF');
    console.log('✅ Redis data initialized');
  } catch (err) {
    console.error('❌ Redis initialization failed:', err);
  }
};

const connectRedis = async () => {
  logger.info('Redis connection attempt', { operation: 'redis', operationName: 'connect' });
  const start = Date.now();
  try {
    redisClient.on('error', (err) => {
      logger.error('Redis client error', { operation: 'redis', error: err });
      console.error('❌ Redis Client Error', err);
    });
    await redisClient.connect();
    logger.info('Redis connected', { operation: 'redis', operationName: 'connect', success: true, durationMs: Date.now() - start });
    console.log('✅ Redis connected');
    await initRedisData();
  } catch (err) {
    logger.error('Redis connection failed', { operation: 'redis', operationName: 'connect', success: false, durationMs: Date.now() - start, error: err });
    console.error('❌ Redis connection failed:', err.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  cartService,
  sessionService
};
