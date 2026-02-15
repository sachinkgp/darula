const redis = require('redis');

const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379
    }
});

const connectRedis = async () => {
    try {
        redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
        await redisClient.connect();
        console.log("✅ Redis connected");
    } catch (err) {
        console.error("❌ Redis connection failed:");
        console.error(err.message);
    }
};

module.exports = {
    redisClient,
    connectRedis
};