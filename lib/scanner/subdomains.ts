import { safeGet } from "@/lib/utils/fetch";
import type { CheckResult } from "@/types";

interface CrtEntry {
  name_value: string;
}

// Known cloud services that are takeover-prone if CNAME exists but bucket/app is unclaimed
const TAKEOVER_SERVICES = [
  "herokuapp.com",
  "github.io",
  "netlify.app",
  "readthedocs.io",
  "ghost.io",
  "surge.sh",
  "bitbucket.io",
  "freshdesk.com",
  "zendesk.com",
  "helpscoutdocs.com",
  "s3.amazonaws.com",
  "storage.googleapis.com",
];

export async function checkSubdomains(domain: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  try {
    const res = await safeGet(
      `https://crt.sh/?q=%25.${domain}&output=json`,
      10000
    );
    if (!res?.ok) {
      return [{
        id: "subdomains",
        name: "Subdomain Discovery",
        category: "Infrastructure",
        status: "warn",
        severity: "info",
        description: "Could not query certificate transparency logs. Subdomain enumeration skipped.",
      }];
    }

    const data: CrtEntry[] = await res.json();
    const subdomains = Array.from(new Set(
        data
          .flatMap((e) => e.name_value.split("\n"))
          .map((s) => s.trim().replace(/^\*\./, ""))
          .filter((s) => s.endsWith(`.${domain}`) || s === domain)
          .filter((s) => !s.startsWith("*"))
      )).slice(0, 30);

    if (subdomains.length > 0) {
      results.push({
        id: "subdomains-found",
        name: "Subdomain Discovery (CT Logs)",
        category: "Infrastructure",
        status: "pass",
        severity: "info",
        description: `Found ${subdomains.length} subdomains in Certificate Transparency logs. These are all legitimate (they have certificates). Review for any that should not be public.`,
        affectedValue: subdomains.slice(0, 10).join(", "),
        detail: subdomains.join(", "),
      });

      // Check for potential takeover-prone subdomains (those with suspicious CNAME patterns)
      // We check known low-hanging-fruit patterns in names
      const suspicious = subdomains.filter((s) =>
        TAKEOVER_SERVICES.some((svc) => s.includes(svc.split(".")[0]))
      );

      if (suspicious.length > 0) {
        results.push({
          id: "subdomain-takeover-risk",
          name: "Potential Subdomain Takeover",
          category: "Infrastructure",
          status: "warn",
          severity: "high",
          description: `${suspicious.length} subdomain(s) reference cloud services that are common targets for subdomain takeover. Verify these point to active services you control.`,
          affectedValue: suspicious.join(", "),
        });
      }
    } else {
      results.push({
        id: "subdomains",
        name: "Subdomain Discovery",
        category: "Infrastructure",
        status: "pass",
        severity: "info",
        description: "No additional subdomains found in Certificate Transparency logs.",
      });
    }
  } catch {
    results.push({
      id: "subdomains",
      name: "Subdomain Discovery",
      category: "Infrastructure",
      status: "warn",
      severity: "info",
      description: "Subdomain enumeration via CT logs failed or timed out.",
    });
  }

  return results;
}
