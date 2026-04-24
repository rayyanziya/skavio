"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScanInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Scan failed. Please try again.");
        return;
      }
      router.push(`/scan/${data.shareToken}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleScan} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yoursite.com"
          className="flex-1 h-12 px-4 text-body bg-surface border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted font-mono text-sm"
          disabled={loading}
          aria-label="Website URL to scan"
        />
        <Button type="submit" size="lg" disabled={loading || !url.trim()} className="whitespace-nowrap">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              Run Scan
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-severity-critical">{error}</p>
      )}
    </form>
  );
}
