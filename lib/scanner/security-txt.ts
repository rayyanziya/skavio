import { safeGet } from "@/lib/utils/fetch";
import type { CheckResult } from "@/types";

export async function checkSecurityTxt(origin: string): Promise<CheckResult[]> {
  const locations = [`${origin}/.well-known/security.txt`, `${origin}/security.txt`];

  for (const url of locations) {
    try {
      const res = await safeGet(url, 5000);
      if (res?.ok) {
        const text = await res.text();
        if (text.includes("Contact:")) {
          return [{
            id: "security-txt",
            name: "security.txt",
            category: "Best Practices",
            status: "pass",
            severity: "info",
            description: "security.txt is present and contains a Contact field. Security researchers know how to report vulnerabilities responsibly.",
            affectedValue: url,
          }];
        }
      }
    } catch {}
  }

  return [{
    id: "security-txt",
    name: "security.txt",
    category: "Best Practices",
    status: "warn",
    severity: "info",
    description: "No security.txt file found. This optional file (RFC 9116) tells security researchers how to contact you about vulnerabilities.",
    affectedValue: "not found",
  }];
}
