import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { PLAN_LABELS } from "@/lib/lemonsqueezy";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Shield, History, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Shield, label: "Overview" },
  { href: "/dashboard/scans", icon: History, label: "Scan History" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id).catch(() => null);
  const planLabel = PLAN_LABELS[profile?.plan ?? "free"] ?? "Free";

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile top header */}
      <header className="md:hidden sticky top-0 z-40 border-b border-border bg-surface h-14 flex items-center justify-between px-4">
        <Link href="/">
          <Image src="/skavio-bgrmv.png" alt="Skavio" width={500} height={160} className="h-7 w-auto" />
        </Link>
        <p className="text-xs text-muted truncate max-w-[180px]">{user.email}</p>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 border-r border-border bg-surface flex-col shrink-0 sticky top-0 h-screen">
          <div className="h-14 border-b border-border flex items-center px-4">
            <Link href="/">
              <Image src="/Skavio.png" alt="Skavio" width={500} height={500} className="h-9 w-auto" />
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-body hover:bg-background transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-body truncate">{user.email}</p>
              <p className="text-xs text-muted">{planLabel} plan</p>
            </div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-body w-full text-left transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main content — extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileDashboardNav />
    </div>
  );
}
