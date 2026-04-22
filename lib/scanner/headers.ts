import type { CheckResult } from "@/types";

export async function checkHeaders(headers: Headers, baseUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // X-Frame-Options
  const xfo = headers.get("x-frame-options");
  results.push({
    id: "xfo",
    name: "X-Frame-Options",
    category: "Security Headers",
    status: xfo && ["DENY", "SAMEORIGIN"].includes(xfo.toUpperCase()) ? "pass" : "fail",
    severity: "medium",
    description: xfo
      ? "Clickjacking protection is set but may be misconfigured."
      : "Missing X-Frame-Options header — your site can be embedded in iframes on other sites, enabling clickjacking attacks.",
    affectedValue: xfo ?? "not set",
  });

  // X-Content-Type-Options
  const xcto = headers.get("x-content-type-options");
  results.push({
    id: "xcto",
    name: "X-Content-Type-Options",
    category: "Security Headers",
    status: xcto?.toLowerCase() === "nosniff" ? "pass" : "fail",
    severity: "medium",
    description: xcto
      ? "MIME type sniffing protection is correctly enabled."
      : "Missing X-Content-Type-Options: nosniff — browsers may misinterpret file types, enabling content injection attacks.",
    affectedValue: xcto ?? "not set",
  });

  // Content-Security-Policy
  const csp = headers.get("content-security-policy");
  const cspUnsafe = csp && (csp.includes("'unsafe-inline'") || csp.includes("'unsafe-eval'") || csp.includes("*"));
  results.push({
    id: "csp",
    name: "Content-Security-Policy",
    category: "Security Headers",
    status: !csp ? "fail" : cspUnsafe ? "warn" : "pass",
    severity: "high",
    description: !csp
      ? "No Content Security Policy found — your site has no protection against cross-site scripting (XSS) attacks."
      : cspUnsafe
      ? "CSP is present but uses unsafe directives ('unsafe-inline', 'unsafe-eval', or wildcard *) that significantly weaken its protection."
      : "Content Security Policy is correctly configured.",
    affectedValue: csp ?? "not set",
    detail: csp ?? undefined,
  });

  // Strict-Transport-Security
  const hsts = headers.get("strict-transport-security");
  const hstsMaxAge = hsts ? parseInt(hsts.match(/max-age=(\d+)/)?.[1] ?? "0") : 0;
  results.push({
    id: "hsts",
    name: "Strict-Transport-Security (HSTS)",
    category: "Security Headers",
    status: !hsts ? "fail" : hstsMaxAge < 31536000 ? "warn" : "pass",
    severity: "high",
    description: !hsts
      ? "Missing HSTS header — browsers are not forced to use HTTPS, leaving users vulnerable to downgrade attacks."
      : hstsMaxAge < 31536000
      ? `HSTS max-age is too short (${hstsMaxAge}s). Minimum recommended is 31536000 (1 year).`
      : "HSTS is correctly configured with a sufficient max-age.",
    affectedValue: hsts ?? "not set",
  });

  // Permissions-Policy
  const pp = headers.get("permissions-policy");
  results.push({
    id: "permissions-policy",
    name: "Permissions-Policy",
    category: "Security Headers",
    status: pp ? "pass" : "warn",
    severity: "low",
    description: pp
      ? "Permissions-Policy header is set, controlling browser feature access."
      : "Missing Permissions-Policy header — no restrictions on browser features like camera, microphone, or geolocation.",
    affectedValue: pp ?? "not set",
  });

  // Referrer-Policy
  const rp = headers.get("referrer-policy");
  const safeReferrer = ["no-referrer", "no-referrer-when-downgrade", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];
  results.push({
    id: "referrer-policy",
    name: "Referrer-Policy",
    category: "Security Headers",
    status: !rp ? "warn" : safeReferrer.includes(rp.toLowerCase()) ? "pass" : "warn",
    severity: "low",
    description: !rp
      ? "Missing Referrer-Policy — browsers may send full URLs (including sensitive paths) to third-party sites."
      : safeReferrer.includes(rp.toLowerCase())
      ? "Referrer-Policy is configured to a safe value."
      : `Referrer-Policy is set to '${rp}' which may leak URL information to third parties.`,
    affectedValue: rp ?? "not set",
  });

  // Server header exposure
  const server = headers.get("server");
  const serverExposes = server && /[\d.]+/.test(server);
  results.push({
    id: "server-header",
    name: "Server Header Disclosure",
    category: "Security Headers",
    status: !server ? "pass" : serverExposes ? "fail" : "warn",
    severity: "low",
    description: !server
      ? "Server header is not exposed — attackers cannot identify your server software."
      : serverExposes
      ? `Server header exposes software version (${server}), helping attackers identify known vulnerabilities.`
      : `Server header reveals software type (${server}). Consider removing it entirely.`,
    affectedValue: server ?? "not set",
  });

  // X-Powered-By
  const xpb = headers.get("x-powered-by");
  results.push({
    id: "x-powered-by",
    name: "X-Powered-By Disclosure",
    category: "Security Headers",
    status: xpb ? "fail" : "pass",
    severity: "low",
    description: xpb
      ? `X-Powered-By header exposes your technology stack (${xpb}), giving attackers a roadmap to known vulnerabilities.`
      : "X-Powered-By header is not exposed.",
    affectedValue: xpb ?? "not set",
  });

  void baseUrl;
  return results;
}
