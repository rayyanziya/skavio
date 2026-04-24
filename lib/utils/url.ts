import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

const BLOCKED_HOSTNAME_SUFFIXES = [/^localhost$/i, /\.local$/i, /\.internal$/i];

export type ValidatedUrl = { ok: true; url: URL } | { ok: false; error: string };

export async function validateUrl(raw: string): Promise<ValidatedUrl> {
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "Invalid URL format." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Only HTTP and HTTPS URLs are allowed." };
  }

  // Hostname comes out of URL parser without IPv6 brackets, but strip defensively.
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  for (const pattern of BLOCKED_HOSTNAME_SUFFIXES) {
    if (pattern.test(hostname)) {
      return { ok: false, error: "Scanning private or internal hosts is not allowed." };
    }
  }

  const addresses: string[] = [];
  if (isIP(hostname)) {
    addresses.push(hostname);
  } else {
    try {
      const results = await lookup(hostname, { all: true });
      if (results.length === 0) {
        return { ok: false, error: "Could not resolve hostname." };
      }
      addresses.push(...results.map((r) => r.address));
    } catch {
      return { ok: false, error: "Could not resolve hostname." };
    }
  }

  for (const addr of addresses) {
    if (!isPublicUnicast(addr)) {
      return { ok: false, error: "Scanning private or internal hosts is not allowed." };
    }
  }

  return { ok: true, url };
}

function isPublicUnicast(addr: string): boolean {
  let parsed: ReturnType<typeof ipaddr.parse>;
  try {
    parsed = ipaddr.parse(addr);
  } catch {
    return false;
  }

  // Normalize IPv4-mapped IPv6 (::ffff:127.0.0.1) to its IPv4 form so .range()
  // classifies loopback/private correctly instead of bucketing as generic IPv6.
  if (parsed.kind() === "ipv6" && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    parsed = (parsed as ipaddr.IPv6).toIPv4Address();
  }

  return parsed.range() === "unicast";
}

export function extractDomain(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}

export function normalizeUrl(url: URL): string {
  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
}
