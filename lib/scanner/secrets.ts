import { safeGet, safeText } from "@/lib/utils/fetch";
import type { CheckResult } from "@/types";

const SECRET_PATTERNS: { name: string; pattern: RegExp; severity: "critical" | "high" }[] = [
  { name: "Stripe Live Key", pattern: /sk_live_[a-zA-Z0-9]{20,}/g, severity: "critical" },
  { name: "Stripe Test Key", pattern: /sk_test_[a-zA-Z0-9]{20,}/g, severity: "high" },
  { name: "Google API Key", pattern: /AIza[0-9A-Za-z\-_]{35}/g, severity: "critical" },
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "GitHub Personal Token", pattern: /ghp_[a-zA-Z0-9]{36}/g, severity: "critical" },
  { name: "GitHub App Token", pattern: /ghs_[a-zA-Z0-9]{36}/g, severity: "critical" },
  { name: "Supabase Anon Key", pattern: /eyJ[a-zA-Z0-9_\-]{50,}\.[a-zA-Z0-9_\-]{50,}/g, severity: "high" },
  { name: "Firebase Config", pattern: /firebaseConfig\s*=\s*\{[^}]{50,}\}/g, severity: "high" },
  { name: "Generic API Key", pattern: /['"](api[_-]?key|apiKey|api_secret)['"]\s*[:=]\s*['"][a-zA-Z0-9\-_]{16,}['"]/gi, severity: "high" },
  { name: "Generic Password", pattern: /['"](password|passwd|secret)['"]\s*[:=]\s*['"][^'"]{8,}['"]/gi, severity: "high" },
];

async function fetchTextContent(url: string): Promise<string> {
  try {
    const res = await safeGet(url, 8000);
    if (!res || !res.ok) return "";
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text") && !ct.includes("javascript") && !ct.includes("html")) return "";
    return await safeText(res, 500 * 1024); // cap at 500KB
  } catch {
    return "";
  }
}

function extractJsUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const srcPattern = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = srcPattern.exec(html)) !== null) {
    try {
      const abs = new URL(match[1], baseUrl).href;
      if (abs.startsWith("http")) urls.push(abs);
    } catch {}
  }
  return urls.slice(0, 5); // only check first 5 JS bundles
}

function scanForSecrets(content: string): { name: string; severity: "critical" | "high"; sample: string }[] {
  const found: { name: string; severity: "critical" | "high"; sample: string }[] = [];
  for (const { name, pattern, severity } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(content);
    if (match) {
      const raw = match[0];
      const sample = raw.length > 40 ? `${raw.slice(0, 20)}...${raw.slice(-8)}` : raw;
      found.push({ name, severity, sample });
    }
  }
  return found;
}

export async function checkSecrets(baseUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const html = await fetchTextContent(baseUrl);
  if (!html) return results;

  const allSecrets: { name: string; severity: "critical" | "high"; sample: string; source: string }[] = [];

  // Scan HTML
  const htmlSecrets = scanForSecrets(html);
  for (const s of htmlSecrets) allSecrets.push({ ...s, source: "HTML page" });

  // Scan JS bundles
  const jsUrls = extractJsUrls(html, baseUrl);
  await Promise.all(
    jsUrls.map(async (jsUrl) => {
      const jsContent = await fetchTextContent(jsUrl);
      const jsSecrets = scanForSecrets(jsContent);
      for (const s of jsSecrets) allSecrets.push({ ...s, source: jsUrl });
    })
  );

  if (allSecrets.length === 0) {
    results.push({
      id: "exposed-secrets",
      name: "Exposed API Keys / Secrets",
      category: "Exposed Secrets",
      status: "pass",
      severity: "critical",
      description: "No exposed API keys, tokens, or secrets detected in page source or JavaScript bundles.",
    });
  } else {
    for (const secret of allSecrets) {
      results.push({
        id: `secret-${secret.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: `Exposed ${secret.name}`,
        category: "Exposed Secrets",
        status: "fail",
        severity: secret.severity,
        description: `A ${secret.name} was found in ${secret.source}. This credential is publicly visible and must be rotated immediately.`,
        affectedValue: secret.sample,
      });
    }
  }

  return results;
}
