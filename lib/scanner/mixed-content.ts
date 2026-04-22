import type { CheckResult } from "@/types";

export function checkMixedContent(html: string, pageUrl: string): CheckResult[] {
  const results: CheckResult[] = [];
  const isHttps = pageUrl.startsWith("https://");

  if (!isHttps) return [];

  // Look for http:// resources on an HTTPS page
  const httpResources: string[] = [];
  const patterns = [
    /<img[^>]+src=["'](http:\/\/[^"']+)["']/gi,
    /<script[^>]+src=["'](http:\/\/[^"']+)["']/gi,
    /<link[^>]+href=["'](http:\/\/[^"']+)["']/gi,
    /<iframe[^>]+src=["'](http:\/\/[^"']+)["']/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      httpResources.push(match[1]);
    }
  }

  const unique = Array.from(new Set(httpResources)).slice(0, 5);

  results.push({
    id: "mixed-content",
    name: "Mixed Content",
    category: "Best Practices",
    status: unique.length > 0 ? "fail" : "pass",
    severity: "medium",
    description: unique.length > 0
      ? `Found ${unique.length} HTTP resource(s) loaded on an HTTPS page. Browsers may block these or warn users, and they can be intercepted.`
      : "No mixed content detected — all resources are loaded over HTTPS.",
    affectedValue: unique.length > 0 ? unique.join(", ") : undefined,
  });

  // SRI check on external scripts
  const externalScripts: string[] = [];
  const sriMissing: string[] = [];
  const scriptPattern = /<script([^>]+)>/gi;
  let m;
  while ((m = scriptPattern.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (src.startsWith("http") && !src.includes(new URL(pageUrl).hostname)) {
      externalScripts.push(src);
      if (!attrs.includes("integrity=")) sriMissing.push(src);
    }
  }

  if (externalScripts.length > 0) {
    results.push({
      id: "sri",
      name: "Subresource Integrity (SRI)",
      category: "Best Practices",
      status: sriMissing.length === 0 ? "pass" : "warn",
      severity: "medium",
      description: sriMissing.length === 0
        ? "All external scripts have Subresource Integrity (SRI) hashes, protecting against CDN compromise."
        : `${sriMissing.length} of ${externalScripts.length} external script(s) lack SRI hashes. If the CDN serving these scripts is compromised, malicious code could execute on your site.`,
      affectedValue: sriMissing.length > 0 ? sriMissing.slice(0, 3).join(", ") : undefined,
    });
  }

  // security.txt
  results.push({
    id: "security-txt",
    name: "security.txt",
    category: "Best Practices",
    status: "warn",
    severity: "info",
    description: "No security.txt check performed at this level (checked separately).",
  });

  return results.filter(r => r.id !== "security-txt");
}
