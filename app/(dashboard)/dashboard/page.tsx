import { createClient } from "@/lib/supabase/server";
import { getUserScans } from "@/lib/db/scans";
import Link from "next/link";
import { ScanInput } from "@/components/landing/scan-input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

function riskColor(score?: number) {
  if (!score) return "info";
  if (score >= 80) return "pass";
  if (score >= 65) return "low";
  if (score >= 40) return "medium";
  return "critical";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const scans = user ? await getUserScans(user.id, 5) : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-body mb-1">Overview</h1>
      <p className="text-sm text-muted mb-8">Run a new scan or review recent results.</p>

      {/* New scan */}
      <div className="border border-border bg-surface p-6 mb-8">
        <h2 className="text-sm font-semibold text-body mb-4">New Scan</h2>
        <ScanInput />
      </div>

      {/* Recent scans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-body">Recent Scans</h2>
          <Link href="/dashboard/scans" className="text-xs text-primary hover:underline">View all →</Link>
        </div>

        {scans.length === 0 ? (
          <div className="border border-border bg-surface p-8 text-center text-sm text-muted">
            No scans yet. Run your first scan above.
          </div>
        ) : (
          <div className="border border-border bg-surface divide-y divide-border">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/scan/${scan.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-background transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-body truncate group-hover:text-primary transition-colors">
                    {scan.url}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(scan.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {scan.riskScore !== undefined && (
                    <Badge variant={riskColor(scan.riskScore) as Parameters<typeof Badge>[0]["variant"]}>
                      {scan.riskScore}/100
                    </Badge>
                  )}
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
