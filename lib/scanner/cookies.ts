import type { CheckResult } from "@/types";

export function checkCookies(headers: Headers): CheckResult[] {
  const results: CheckResult[] = [];

  const setCookieHeader = headers.get("set-cookie");
  if (!setCookieHeader) {
    results.push({
      id: "cookies",
      name: "Cookie Security",
      category: "Cookie Security",
      status: "pass",
      severity: "medium",
      description: "No cookies are set on the main page response.",
    });
    return results;
  }

  // Parse multiple Set-Cookie headers (joined by comma in some cases)
  const cookies = setCookieHeader.split(/,(?=[^;])/);

  for (const cookie of cookies) {
    const nameMatch = cookie.match(/^([^=]+)=/);
    const cookieName = nameMatch ? nameMatch[1].trim() : "unknown";

    const hasHttpOnly = /;\s*HttpOnly/i.test(cookie);
    const hasSecure = /;\s*Secure/i.test(cookie);
    const hasSameSite = /;\s*SameSite=/i.test(cookie);
    const sameSiteVal = cookie.match(/;\s*SameSite=(\w+)/i)?.[1];

    if (!hasHttpOnly) {
      results.push({
        id: `cookie-httponly-${cookieName}`,
        name: `Cookie Missing HttpOnly: ${cookieName}`,
        category: "Cookie Security",
        status: "fail",
        severity: "medium",
        description: `The cookie '${cookieName}' is missing the HttpOnly flag. JavaScript on the page can read this cookie, enabling session theft via XSS attacks.`,
        affectedValue: cookieName,
      });
    }

    if (!hasSecure) {
      results.push({
        id: `cookie-secure-${cookieName}`,
        name: `Cookie Missing Secure Flag: ${cookieName}`,
        category: "Cookie Security",
        status: "fail",
        severity: "medium",
        description: `The cookie '${cookieName}' is missing the Secure flag. It can be transmitted over unencrypted HTTP connections.`,
        affectedValue: cookieName,
      });
    }

    if (!hasSameSite) {
      results.push({
        id: `cookie-samesite-${cookieName}`,
        name: `Cookie Missing SameSite: ${cookieName}`,
        category: "Cookie Security",
        status: "warn",
        severity: "low",
        description: `The cookie '${cookieName}' has no SameSite attribute. Modern browsers default to Lax, but explicitly setting it prevents cross-site request forgery (CSRF) attacks.`,
        affectedValue: cookieName,
      });
    } else if (sameSiteVal?.toLowerCase() === "none" && !hasSecure) {
      results.push({
        id: `cookie-samesite-none-${cookieName}`,
        name: `Cookie SameSite=None Without Secure: ${cookieName}`,
        category: "Cookie Security",
        status: "fail",
        severity: "medium",
        description: `The cookie '${cookieName}' uses SameSite=None but is missing the Secure flag. Browsers will reject this cookie.`,
        affectedValue: cookieName,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      id: "cookies-secure",
      name: "Cookie Security",
      category: "Cookie Security",
      status: "pass",
      severity: "medium",
      description: "All detected cookies have proper security flags (HttpOnly, Secure, SameSite).",
    });
  }

  return results;
}
