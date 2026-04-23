import { createClient } from "@/lib/supabase/server";
import { getUserScans } from "@/lib/db/scans";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

function riskVariant(score?: number) {
  if (!score) return "info";
  if (score >= 80) return "pass";
  if (score >= 65) return "low";
  if (score >= 40) return "medium";
  return "critical";
}

export default async function ScansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const scans = user ? await getUserScans(user.id, 50) : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-body mb-1">Scan History</h1>
      <p className="text-sm text-muted mb-8">{scans.length} scan{scans.length !== 1 ? "s" : ""} total</p>

      {scans.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center">
          <p className="text-sm text-muted mb-3">No scans yet.</p>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">Run your first scan →</Link>
        </div>
      ) : (
        <div className="border border-border bg-surface divide-y divide-border">
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/scan/${scan.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-background transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-body truncate group-hover:text-primary transition-colors">
                  {scan.url}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-muted">{new Date(scan.createdAt).toLocaleString()}</p>
                  {scan.summary && (
                    <p className="text-xs text-muted">
                      {scan.summary.critical > 0 && <span className="text-severity-critical">{scan.summary.critical} critical · </span>}
                      {scan.summary.high > 0 && <span className="text-severity-high">{scan.summary.high} high · </span>}
                      {scan.summary.passed} passed
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {scan.riskScore !== undefined && (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <Badge variant={riskVariant(scan.riskScore) as any}>
                    {scan.riskScore}/100 · {scan.riskLabel}
                  </Badge>
                )}
                <ExternalLink className="h-3.5 w-3.5 text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
