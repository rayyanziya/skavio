export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type CheckStatus = "pass" | "fail" | "warn";
export type ScanStatus = "pending" | "running" | "complete" | "failed";

export interface Finding {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  severity: Severity;
  description: string;
  detail?: string;
  affectedValue?: string;
}

export interface ScanResult {
  id: string;
  url: string;
  status: ScanStatus;
  riskScore?: number;
  riskLabel?: string;
  findings: Finding[];
  createdAt: string;
  completedAt?: string;
  shareToken: string;
  summary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    total: number;
  };
}

export interface CheckResult {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  severity: Severity;
  description: string;
  detail?: string;
  affectedValue?: string;
}
