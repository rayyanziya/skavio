import { createClient } from "@/lib/supabase/server";
import { getUserScans, getUserScanCountThisMonth } from "@/lib/db/scans";
import { getProfile } from "@/lib/db/profiles";
import { PLAN_LIMITS, PLAN_LABELS } from "@/lib/lemonsqueezy";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const upgraded = params.upgraded === "1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [scans, profile, used] = await Promise.all([
    user ? getUserScans(user.id, 5) : Promise.resolve([]),
    user ? getProfile(user.id).catch(() => null) : Promise.resolve(null),
    user ? getUserScanCountThisMonth(user.id).catch(() => 0) : Promise.resolve(0),
  ]);

  const plan = profile?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 3;
  const planLabel = PLAN_LABELS[plan] ?? "Free";
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const nearLimit = limit !== Infinity && used >= limit - 1;

  return (
    <div>
      {upgraded && (
        <div className="border border-primary bg-primary-light px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-primary">Welcome to {planLabel}!</p>
          <p className="text-xs text-muted mt-0.5">Your plan has been upgraded. Run your first scan below.</p>
        </div>
      )}

      <h1 className="text-xl font-bold text-body mb-1">Overview</h1>
      <p className="text-sm text-muted mb-6">Run a new scan or review recent results.</p>

      {/* Quota bar */}
      <div className="border border-border bg-surface p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-body">
            {planLabel} plan ·{" "}
            {limit === Infinity ? "Unlimited scans" : `${used} of ${limit} scans used this month`}
          </span>
          {plan === "free" && (
            <Link href="/dashboard/settings" className="text-xs text-primary hover:underline">
              Upgrade →
            </Link>
          )}
        </div>
        {limit !== Infinity && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${nearLimit ? "bg-severity-high" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {used >= limit && limit !== Infinity && (
          <p className="text-xs text-severity-critical mt-2">
            Scan limit reached.{" "}
            <Link href="/dashboard/settings" className="underline">Upgrade your plan</Link>
            {" "}to run more scans.
          </p>
        )}
      </div>

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
                href={`/scan/${scan.shareToken}`}
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
