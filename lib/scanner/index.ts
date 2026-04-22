import pLimit from "p-limit";
import { checkHeaders } from "./headers";
import { checkSSL } from "./ssl";
import { checkSecrets } from "./secrets";
import { checkCors } from "./cors";
import { checkCookies } from "./cookies";
import { checkDisclosure } from "./disclosure";
import { checkDns } from "./dns";
import { checkMixedContent } from "./mixed-content";
import { checkSecurityTxt } from "./security-txt";
import { checkSubdomains } from "./subdomains";
import { calculateRiskScore, getSummary } from "./risk-score";
import { safeFetch } from "@/lib/utils/fetch";
import { extractDomain, normalizeUrl } from "@/lib/utils/url";
import type { CheckResult, Finding, ScanResult } from "@/types";
import { randomBytes } from "crypto";

function toFindings(checks: CheckResult[]): Finding[] {
  return checks.map((c, i) => ({
    ...c,
    id: c.id ?? `finding-${i}`,
  }));
}

export async function runScan(url: URL): Promise<ScanResult> {
  const startedAt = new Date();
  const origin = normalizeUrl(url);
  const domain = extractDomain(url);
  const limit = pLimit(8);

  // Fetch the main page first (needed for header + HTML-based checks)
  let mainResponse: Response | null = null;
  let html = "";

  try {
    mainResponse = await safeFetch(origin, {
      method: "GET",
      timeoutMs: 10000,
      headers: {
        "User-Agent": "Skavio-Scanner/1.0 (security-audit; +https://skavio.ai)",
      },
    });
    html = await mainResponse.text();
  } catch {
    // If the site is unreachable, return a failed scan
    return {
      id: randomBytes(8).toString("hex"),
      url: url.href,
      status: "failed",
      findings: [],
      createdAt: startedAt.toISOString(),
      shareToken: randomBytes(8).toString("hex"),
    };
  }

  const headers = mainResponse?.headers ?? new Headers();

  // Run all check groups concurrently with p-limit
  const [
    headerResults,
    sslResults,
    secretResults,
    corsResults,
    cookieResults,
    disclosureResults,
    dnsResults,
    mixedContentResults,
    securityTxtResults,
    subdomainResults,
  ] = await Promise.all([
    limit(() => checkHeaders(headers, origin)),
    limit(() => checkSSL(url)),
    limit(() => checkSecrets(origin)),
    limit(() => Promise.resolve(checkCors(headers))),
    limit(() => Promise.resolve(checkCookies(headers))),
    limit(() => checkDisclosure(origin)),
    limit(() => checkDns(domain)),
    limit(() => Promise.resolve(checkMixedContent(html, url.href))),
    limit(() => checkSecurityTxt(origin)),
    limit(() => checkSubdomains(domain)),
  ]);

  const allChecks: CheckResult[] = [
    ...headerResults,
    ...sslResults,
    ...secretResults,
    ...corsResults,
    ...cookieResults,
    ...disclosureResults,
    ...dnsResults,
    ...mixedContentResults,
    ...securityTxtResults,
    ...subdomainResults,
  ];

  const findings = toFindings(allChecks);
  const { score, label } = calculateRiskScore(findings);
  const summary = getSummary(findings);

  return {
    id: randomBytes(8).toString("hex"),
    url: url.href,
    status: "complete",
    riskScore: score,
    riskLabel: label,
    findings,
    summary,
    createdAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    shareToken: randomBytes(8).toString("hex"),
  };
}
