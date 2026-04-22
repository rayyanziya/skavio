import { promises as dns } from "dns";
import type { CheckResult } from "@/types";

async function resolveTxt(domain: string, subprefix = ""): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(`${subprefix ? subprefix + "." : ""}${domain}`);
    return records.flat();
  } catch {
    return [];
  }
}

export async function checkDns(domain: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const [txtRecords, dmarcRecords] = await Promise.all([
    resolveTxt(domain),
    resolveTxt(domain, "_dmarc"),
  ]);

  // SPF
  const spf = txtRecords.find((r) => r.startsWith("v=spf1"));
  results.push({
    id: "spf",
    name: "SPF Record",
    category: "DNS & Email Security",
    status: spf ? "pass" : "fail",
    severity: "medium",
    description: spf
      ? "SPF record is configured, specifying which mail servers are authorized to send email for this domain."
      : "No SPF record found. Without SPF, anyone can send emails pretending to be from your domain (email spoofing).",
    affectedValue: spf ?? "not found",
  });

  // DMARC
  const dmarc = dmarcRecords.find((r) => r.startsWith("v=DMARC1"));
  const dmarcPolicy = dmarc?.match(/p=(none|quarantine|reject)/i)?.[1];
  results.push({
    id: "dmarc",
    name: "DMARC Record",
    category: "DNS & Email Security",
    status: !dmarc ? "fail" : dmarcPolicy === "none" ? "warn" : "pass",
    severity: "medium",
    description: !dmarc
      ? "No DMARC record found. Without DMARC, email spoofing from your domain is trivially easy."
      : dmarcPolicy === "none"
      ? "DMARC is set to p=none (monitoring only). Upgrade to p=quarantine or p=reject to actively block spoofed emails."
      : `DMARC is configured with policy '${dmarcPolicy}', actively protecting against email spoofing.`,
    affectedValue: dmarc ?? "not found",
  });

  // DNSSEC
  try {
    await dns.resolve(domain, "DS");
    results.push({
      id: "dnssec",
      name: "DNSSEC",
      category: "DNS & Email Security",
      status: "pass",
      severity: "low",
      description: "DNSSEC is enabled. DNS responses are cryptographically signed, preventing DNS hijacking.",
      affectedValue: "Enabled",
    });
  } catch {
    results.push({
      id: "dnssec",
      name: "DNSSEC",
      category: "DNS & Email Security",
      status: "warn",
      severity: "low",
      description: "DNSSEC does not appear to be enabled. Without it, attackers can redirect your DNS to malicious servers.",
      affectedValue: "Not detected",
    });
  }

  // CAA records
  try {
    const caaRecords = await dns.resolve(domain, "CAA");
    results.push({
      id: "caa",
      name: "CAA Records",
      category: "DNS & Email Security",
      status: caaRecords.length > 0 ? "pass" : "warn",
      severity: "low",
      description: caaRecords.length > 0
        ? "CAA records restrict which certificate authorities can issue SSL certificates for your domain."
        : "No CAA records found. Any certificate authority can issue SSL certificates for your domain.",
      affectedValue: caaRecords.length > 0 ? `${caaRecords.length} record(s)` : "not found",
    });
  } catch {
    results.push({
      id: "caa",
      name: "CAA Records",
      category: "DNS & Email Security",
      status: "warn",
      severity: "low",
      description: "No CAA records found. Any certificate authority can issue SSL certificates for your domain.",
      affectedValue: "not found",
    });
  }

  // MTA-STS
  try {
    const mtaStsRecords = await resolveTxt(domain, "_mta-sts");
    const hasMtaSts = mtaStsRecords.some((r) => r.startsWith("v=STSv1"));
    results.push({
      id: "mta-sts",
      name: "MTA-STS",
      category: "DNS & Email Security",
      status: hasMtaSts ? "pass" : "warn",
      severity: "low",
      description: hasMtaSts
        ? "MTA-STS is configured, enforcing TLS encryption for inbound email delivery."
        : "No MTA-STS policy found. Email servers are not required to use TLS when delivering to your domain.",
      affectedValue: hasMtaSts ? "Configured" : "not found",
    });
  } catch {
    results.push({
      id: "mta-sts",
      name: "MTA-STS",
      category: "DNS & Email Security",
      status: "warn",
      severity: "low",
      description: "No MTA-STS policy found.",
      affectedValue: "not found",
    });
  }

  return results;
}
