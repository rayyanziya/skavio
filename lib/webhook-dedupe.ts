import { Redis } from "@upstash/redis";

// LemonSqueezy doesn't sign a timestamp or unique event id, so the replay
// surface is "exact body + valid signature." We dedupe by SHA-256 of the raw
// body over a 24h window — covers legitimate retries and blocks replay
// attacks using captured webhook payloads. We only mark a body "seen" AFTER
// successful processing so that a failed handler doesn't silently drop the
// event on its retry.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const WINDOW_MS = 24 * 60 * 60 * 1000;
const memorySeen = new Map<string, number>();

function purgeMemory(now: number) {
  for (const [k, t] of memorySeen) {
    if (now - t > WINDOW_MS) memorySeen.delete(k);
  }
}

export async function hasSeenEvent(hash: string): Promise<boolean> {
  if (redis) {
    const v = await redis.get<string>(`webhook:ls:${hash}`);
    return v !== null;
  }
  const now = Date.now();
  purgeMemory(now);
  return memorySeen.has(hash);
}

export async function markEventSeen(hash: string): Promise<void> {
  if (redis) {
    await redis.set(`webhook:ls:${hash}`, "1", { ex: WINDOW_MS / 1000 });
    return;
  }
  memorySeen.set(hash, Date.now());
}
