import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ScanResult } from "@/types";

export async function saveScan(result: ScanResult, userId?: string): Promise<void> {
  const db = createServiceRoleClient();
  await db.from("scans").insert({
    id: result.id,
    url: result.url,
    status: result.status,
    risk_score: result.riskScore,
    risk_label: result.riskLabel,
    summary: result.summary,
    findings: result.findings,
    user_id: userId ?? null,
    share_token: result.shareToken,
    created_at: result.createdAt,
    completed_at: result.completedAt,
  });
}

export async function getScanById(id: string): Promise<ScanResult | null> {
  const db = createServiceRoleClient();
  const { data } = await db.from("scans").select("*").eq("id", id).single();
  if (!data) return null;
  return dbRowToScanResult(data);
}

export async function getScanByToken(token: string): Promise<ScanResult | null> {
  const db = createServiceRoleClient();
  const { data } = await db.from("scans").select("*").eq("share_token", token).single();
  if (!data) return null;
  return dbRowToScanResult(data);
}

export async function getUserScans(userId: string, limit = 20): Promise<ScanResult[]> {
  const db = createServiceRoleClient();
  const { data } = await db
    .from("scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(dbRowToScanResult);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToScanResult(row: any): ScanResult {
  return {
    id: row.id,
    url: row.url,
    status: row.status,
    riskScore: row.risk_score,
    riskLabel: row.risk_label,
    summary: row.summary,
    findings: row.findings ?? [],
    createdAt: row.created_at,
    completedAt: row.completed_at,
    shareToken: row.share_token,
  };
}
