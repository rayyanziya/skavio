import { safeGet } from "@/lib/utils/fetch";
import type { CheckResult } from "@/types";

export async function checkSSL(url: URL): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const isHttps = url.protocol === "https:";

  // Basic HTTPS check
  results.push({
    id: "https",
    name: "HTTPS Enabled",
    category: "SSL / TLS",
    status: isHttps ? "pass" : "fail",
    severity: "critical",
    description: isHttps
      ? "The site is served over HTTPS — traffic between users and your site is encrypted."
      : "The site does not use HTTPS. All data transmitted is unencrypted and visible to attackers.",
    affectedValue: url.protocol,
  });

  // HTTP → HTTPS redirect
  if (isHttps) {
    const httpUrl = `http://${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}`;
    try {
      const res = await safeGet(httpUrl, 8000);
      const finalUrl = res?.url ?? "";
      const redirected = finalUrl.startsWith("https://");
      results.push({
        id: "http-redirect",
        name: "HTTP → HTTPS Redirect",
        category: "SSL / TLS",
        status: redirected ? "pass" : "fail",
        severity: "high",
        description: redirected
          ? "HTTP requests are correctly redirected to HTTPS."
          : "HTTP requests are not redirected to HTTPS — users who visit via HTTP are not automatically protected.",
        affectedValue: redirected ? "Redirects to HTTPS" : "No redirect detected",
      });
    } catch {
      results.push({
        id: "http-redirect",
        name: "HTTP → HTTPS Redirect",
        category: "SSL / TLS",
        status: "warn",
        severity: "high",
        description: "Could not verify HTTP → HTTPS redirect (connection failed or timed out).",
        affectedValue: "Unknown",
      });
    }
  }

  // HSTS preload eligibility (check header)
  // (Actual preload submission is out of scope, but we check the flags)

  return results;
}
