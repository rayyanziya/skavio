import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getUserScanCountThisMonth } from "@/lib/db/scans";
import { PLAN_LIMITS, PLAN_LABELS } from "@/lib/lemonsqueezy";
import { UpgradeButton } from "@/components/upgrade-button";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const providerRaw = user.identities?.[0]?.provider ?? user.app_metadata?.provider ?? "email";
  const providerLabel = providerRaw === "google" ? "Google" : providerRaw === "github" ? "GitHub" : "Email";

  const profile = await getProfile(user.id).catch(() => null);
  const plan = profile?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 3;
  const used = await getUserScanCountThisMonth(user.id).catch(() => 0);
  const planLabel = PLAN_LABELS[plan] ?? "Free";
  const isActive = profile?.ls_status === "active" || profile?.ls_status === "on_trial";
  const isCancelled = profile?.ls_status === "cancelled";

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-body mb-1">Settings</h1>
      <p className="text-sm text-muted mb-8">Manage your account</p>

      {/* Account info */}
      <div className="border border-border bg-surface mb-4">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-body">Account</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-muted mb-1">Email</p>
            <p className="text-sm text-body font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Sign-in method</p>
            <p className="text-sm text-body font-medium">{providerLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Account created</p>
            <p className="text-sm text-body">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="border border-border bg-surface mb-4">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-body">Plan &amp; Usage</h2>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-body">{planLabel}</p>
              <p className="text-xs text-muted mt-0.5">
                {limit === Infinity ? "Unlimited scans/month" : `${limit} scans/month`}
                {isCancelled && profile?.period_end && (
                  <span className="text-severity-critical ml-1">
                    · Cancels {new Date(profile.period_end).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            {plan !== "free" && isActive && profile?.ls_portal_url ? (
              <a
                href={profile.ls_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-4 text-xs font-medium border border-border text-body hover:border-primary hover:text-primary transition-colors flex items-center whitespace-nowrap"
              >
                Manage subscription
              </a>
            ) : plan === "free" || !isActive ? (
              <UpgradeButton
                plan="starter"
                isLoggedIn={true}
                className="h-8 px-4 text-xs font-medium border border-primary text-primary hover:bg-primary-light transition-colors"
              >
                Upgrade
              </UpgradeButton>
            ) : null}
          </div>

          {/* Usage bar */}
          {limit !== Infinity && (
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Scans this month</span>
                <span>{used} / {limit}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Upgrade options for free users */}
        {plan === "free" && (
          <div className="px-5 pb-5 border-t border-border pt-4">
            <p className="text-xs text-muted mb-3">Upgrade for more scans and full vulnerability details</p>
            <div className="grid grid-cols-3 gap-2">
              {(["starter", "pro", "agency"] as const).map((p) => (
                <UpgradeButton
                  key={p}
                  plan={p}
                  isLoggedIn={true}
                  className="h-8 text-xs font-medium border border-border bg-surface text-body hover:border-primary hover:text-primary transition-colors"
                >
                  {PLAN_LABELS[p]} →
                </UpgradeButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 bg-surface">
        <div className="px-5 py-4 border-b border-red-200">
          <h2 className="text-sm font-semibold text-severity-critical">Danger Zone</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-body">Delete account</p>
            <p className="text-xs text-muted mt-0.5">Permanently delete your account and all scan data.</p>
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
