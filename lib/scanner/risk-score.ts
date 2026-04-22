import type { Finding } from "@/types";

export function calculateRiskScore(findings: Finding[]): { score: number; label: string; color: string } {
  const fails = findings.filter((f) => f.status === "fail");

  const critical = fails.filter((f) => f.severity === "critical").length;
  const high = fails.filter((f) => f.severity === "high").length;
  const medium = fails.filter((f) => f.severity === "medium").length;
  const low = fails.filter((f) => f.severity === "low").length;

  const deductions = critical * 25 + high * 12 + medium * 5 + low * 2;
  const score = Math.max(0, 100 - deductions);

  let label: string;
  let color: string;

  if (score >= 95) {
    label = "Secure";
    color = "#16a34a";
  } else if (score >= 80) {
    label = "Low Risk";
    color = "#2d6a4f";
  } else if (score >= 65) {
    label = "Medium Risk";
    color = "#ca8a04";
  } else if (score >= 40) {
    label = "High Risk";
    color = "#ea580c";
  } else {
    label = "Critical Risk";
    color = "#dc2626";
  }

  return { score, label, color };
}

export function getSummary(findings: Finding[]) {
  return {
    critical: findings.filter((f) => f.status === "fail" && f.severity === "critical").length,
    high: findings.filter((f) => f.status === "fail" && f.severity === "high").length,
    medium: findings.filter((f) => f.status === "fail" && f.severity === "medium").length,
    low: findings.filter((f) => f.status === "fail" && f.severity === "low").length,
    passed: findings.filter((f) => f.status === "pass").length,
    total: findings.length,
  };
}
