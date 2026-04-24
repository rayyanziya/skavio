import type { ScanResult } from "@/types";

// In-memory cache of recent scans, keyed ONLY by the public shareToken.
// The private scanId is never a lookup key here — that prevents a scan's
// internal ID (visible in API responses / logs) from serving as a back-door
// to the public share route.
// Serverless warning: this Map is per-instance; DB fallback in getScanByToken
// is the authoritative store.
const store = new Map<string, { result: ScanResult; expiresAt: number }>();

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function storeScan(result: ScanResult): void {
  store.set(result.shareToken, { result, expiresAt: Date.now() + TTL_MS });
}

export function getScan(shareToken: string): ScanResult | null {
  const entry = store.get(shareToken);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(shareToken);
    return null;
  }
  return entry.result;
}
