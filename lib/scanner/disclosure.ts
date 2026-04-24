import { safeGet, safeHead, safeText } from "@/lib/utils/fetch";
import type { CheckResult } from "@/types";

const SENSITIVE_PATHS = [
  { path: "/.env", name: ".env File Exposed", severity: "critical" as const },
  { path: "/.env.local", name: ".env.local File Exposed", severity: "critical" as const },
  { path: "/.env.production", name: ".env.production File Exposed", severity: "critical" as const },
  { path: "/.git/config", name: "Git Config Exposed", severity: "critical" as const },
  { path: "/.git/HEAD", name: "Git Repository Exposed", severity: "high" as const },
  { path: "/wp-config.php", name: "WordPress Config Exposed", severity: "critical" as const },
  { path: "/phpinfo.php", name: "PHP Info Page Exposed", severity: "high" as const },
  { path: "/admin", name: "Admin Panel Exposed", severity: "medium" as const },
  { path: "/api/graphql", name: "GraphQL Introspection", severity: "low" as const },
  { path: "/.DS_Store", name: ".DS_Store File Exposed", severity: "medium" as const },
  { path: "/config.json", name: "Config JSON Exposed", severity: "high" as const },
  { path: "/package.json", name: "package.json Exposed", severity: "medium" as const },
];

export async function checkDisclosure(baseUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const origin = new URL(baseUrl).origin;

  await Promise.all(
    SENSITIVE_PATHS.map(async ({ path, name, severity }) => {
      const url = `${origin}${path}`;
      try {
        const res = await safeHead(url, 6000);
        const exposed = res && res.ok && res.status !== 404;

        if (exposed) {
          // For .git/config and .env, do a GET to confirm actual content
          let confirmedExposed = true;
          if (path === "/.git/config" || path === "/.env") {
            const getRes = await safeGet(url, 6000);
            const text = getRes ? await safeText(getRes, 64 * 1024) : "";
            confirmedExposed = text.length > 0 && !text.toLowerCase().includes("<!doctype html");
          }

          if (confirmedExposed) {
            results.push({
              id: `disclosure-${path.replace(/[^a-z0-9]/g, "-")}`,
              name,
              category: "Information Disclosure",
              status: "fail",
              severity,
              description: `${name}: The file at \`${path}\` is publicly accessible. This can expose credentials, server configuration, or source code to attackers.`,
              affectedValue: url,
            });
          }
        }
      } catch {}
    })
  );

  // robots.txt check for sensitive paths
  try {
    const robotsRes = await safeGet(`${origin}/robots.txt`, 6000);
    if (robotsRes?.ok) {
      const robotsText = await safeText(robotsRes, 128 * 1024);
      const sensitivePaths = robotsText.match(/Disallow:\s*(\/[^\s]+)/g);
      if (sensitivePaths && sensitivePaths.length > 3) {
        results.push({
          id: "robots-sensitive",
          name: "Robots.txt Reveals Sensitive Paths",
          category: "Information Disclosure",
          status: "warn",
          severity: "low",
          description: `robots.txt lists ${sensitivePaths.length} disallowed paths. While intended to block crawlers, this also tells attackers exactly which paths may contain sensitive content.`,
          affectedValue: sensitivePaths.slice(0, 5).join(", "),
        });
      }
    }
  } catch {}

  if (results.length === 0) {
    results.push({
      id: "disclosure-clean",
      name: "Information Disclosure",
      category: "Information Disclosure",
      status: "pass",
      severity: "high",
      description: "No sensitive files or configurations found at common exposure paths.",
    });
  }

  return results;
}
