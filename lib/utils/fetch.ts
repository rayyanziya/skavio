const DEFAULT_TIMEOUT_MS = 8000;

export async function safeFetch(
  url: string,
  options: RequestInit & { timeoutMs?: number; maxRedirects?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      redirect: "follow",
    });
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
