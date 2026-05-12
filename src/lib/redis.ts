import Redis from 'ioredis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export const redis = env.redisUrl
  ? globalForRedis.redis ?? new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 })
  : null;

if (redis && process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
