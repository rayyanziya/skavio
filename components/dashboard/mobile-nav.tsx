"use client";
import { Shield, History, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Shield, label: "Overview" },
  { href: "/dashboard/scans", icon: History, label: "History" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function MobileDashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${active ? "text-primary font-medium" : "text-muted"}`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
        <form action="/auth/signout" method="POST" className="flex">
          <button
            type="submit"
            className="flex flex-col items-center justify-center gap-1 text-xs text-muted w-full transition-colors hover:text-body"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
