"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  plan: string;
  isLoggedIn: boolean;
  className?: string;
  children: React.ReactNode;
}

export function UpgradeButton({ plan, isLoggedIn, className, children }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login?redirect=/dashboard/settings");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading…" : children}
    </button>
  );
}
