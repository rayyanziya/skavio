import { validateUrl } from "./url";

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB cap on scanned responses
const MAX_REDIRECTS = 3;

type SafeFetchInit = RequestInit & { timeoutMs?: number };

export async function safeFetch(url: string, options: SafeFetchInit = {}): Promise<Response> {
  return safeFetchInternal(url, options, 0);
}

async function safeFetchInternal(
  url: string,
  options: SafeFetchInit,
  depth: number
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const validated = await validateUrl(url);
  if (!validated.ok) {
    throw new Error(validated.error);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(validated.url, {
      ...fetchOptions,
      signal: controller.signal,
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location && depth < MAX_REDIRECTS) {
        try {
          await res.body?.cancel();
        } catch {}
        const nextUrl = new URL(location, validated.url).href;
        return safeFetchInternal(nextUrl, options, depth + 1);
      }
    }

    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function safeHead(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response | null> {
  try {
    return await safeFetch(url, { method: "HEAD", timeoutMs });
  } catch {
    return null;
  }
}

export async function safeGet(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response | null> {
  try {
    return await safeFetch(url, { method: "GET", timeoutMs });
  } catch {
    return null;
  }
}

export async function safeText(res: Response, maxBytes = DEFAULT_MAX_BYTES): Promise<string> {
  if (!res.body) return "";

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    try { await res.body.cancel(); } catch {}
    return "";
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch {}
        break;
      }
      chunks.push(value);
    }
  } catch {
    return "";
  }

  const size = Math.min(total, maxBytes);
  const combined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    if (offset + chunk.byteLength > size) {
      combined.set(chunk.subarray(0, size - offset), offset);
      break;
    }
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(combined);
}
