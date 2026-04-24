import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash is used in production. If the env vars are absent (e.g. local dev),
// we transparently fall back to per-instance in-memory buckets — this loses
// persistence across instances but keeps dev builds working without Redis.
function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

const redis = upstashConfigured() ? Redis.fromEnv() : null;

const scanRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "rl:scan",
      analytics: true,
    })
  : null;

const fixPromptRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "24 h"),
      prefix: "rl:fix",
      analytics: true,
    })
  : null;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export async function limitScan(ip: string): Promise<boolean> {
  if (scanRatelimit) {
    const { success } = await scanRatelimit.limit(ip);
    return success;
  }
  return memoryLimit(`scan:${ip}`, 10, 60 * 60 * 1000);
}

export async function limitFixPrompt(ip: string): Promise<boolean> {
  if (fixPromptRatelimit) {
    const { success } = await fixPromptRatelimit.limit(ip);
    return success;
  }
  return memoryLimit(`fix:${ip}`, 2, 24 * 60 * 60 * 1000);
}
