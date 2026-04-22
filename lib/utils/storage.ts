import type { ScanResult } from "@/types";

// In-memory store for dev. Will be replaced with Upstash Redis before deploy.
const store = new Map<string, { result: ScanResult; expiresAt: number }>();

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function storeScan(result: ScanResult): void {
  store.set(result.id, { result, expiresAt: Date.now() + TTL_MS });
  store.set(result.shareToken, { result, expiresAt: Date.now() + TTL_MS });
}

export function getScan(idOrToken: string): ScanResult | null {
  const entry = store.get(idOrToken);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(idOrToken);
    return null;
  }
  return entry.result;
}
