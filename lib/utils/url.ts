const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /\.local$/i,
  /\.internal$/i,
];

export function validateUrl(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "Invalid URL format." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Only HTTP and HTTPS URLs are allowed." };
  }

  const hostname = url.hostname;
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(hostname)) {
      return { ok: false, error: "Scanning private or internal hosts is not allowed." };
    }
  }

  // Block raw IPs (not hostname)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return { ok: false, error: "Scanning IP addresses directly is not allowed." };
  }

  return { ok: true, url };
}

export function extractDomain(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}

export function normalizeUrl(url: URL): string {
  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
}
