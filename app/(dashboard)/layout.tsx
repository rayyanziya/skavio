import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Shield, History, Settings } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-surface flex flex-col shrink-0">
        <div className="h-14 border-b border-border flex items-center px-4">
          <Link href="/">
            <Image src="/Skavio.png" alt="Skavio" width={500} height={500} className="h-9 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: "/dashboard", icon: Shield, label: "Overview" },
            { href: "/dashboard/scans", icon: History, label: "Scan History" },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
          ].map(({ href, icon: Icon, label }) => (
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
            <p className="text-xs text-muted">Free plan</p>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
