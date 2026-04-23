import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const provider = user.app_metadata?.provider ?? "email";
  const providerLabel = provider === "google" ? "Google" : provider === "github" ? "GitHub" : "Email";

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
          <h2 className="text-sm font-semibold text-body">Plan</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-body">Free</p>
            <p className="text-xs text-muted mt-0.5">3 scans/month · Severity summary only</p>
          </div>
          <button className="h-8 px-4 text-xs font-medium border border-primary text-primary hover:bg-primary-light transition-colors">
            Upgrade
          </button>
        </div>
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
          <button className="h-8 px-4 text-xs font-medium border border-red-300 text-severity-critical hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
