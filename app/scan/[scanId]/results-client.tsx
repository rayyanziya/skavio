"use client";
import { useState } from "react";
import type { ScanResult, Finding, Severity } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Copy, Check, Share2, ArrowLeft, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_CONFIG = {
  critical: { label: "Critical", variant: "critical" as const, dot: "bg-severity-critical" },
  high: { label: "High", variant: "high" as const, dot: "bg-severity-high" },
  medium: { label: "Medium", variant: "medium" as const, dot: "bg-severity-medium" },
  low: { label: "Low", variant: "low" as const, dot: "bg-primary" },
  info: { label: "Info", variant: "info" as const, dot: "bg-gray-400" },
};

function RiskMeter({ score, label }: { score: number; label: string }) {
  const color =
    score >= 95 ? "#16a34a" :
    score >= 80 ? "#2d6a4f" :
    score >= 65 ? "#ca8a04" :
    score >= 40 ? "#ea580c" : "#dc2626";

  return (
    <div className="flex flex-col items-center justify-center w-28 h-28 border-4 rounded-full" style={{ borderColor: color }}>
      <span className="text-3xl font-bold text-body leading-none">{score}</span>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fixPrompt, setFixPrompt] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [promptUpgrade, setPromptUpgrade] = useState(false);
  const cfg = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.info;

  if (finding.status === "pass") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border border-border bg-surface">
        <span className="w-2 h-2 rounded-full bg-passed flex-shrink-0" />
        <span className="text-sm text-muted flex-1">{finding.name}</span>
        <Badge variant="pass" className="text-xs">Pass</Badge>
      </div>
    );
  }

  async function handleCopyFixPrompt() {
    // If already generated, just copy
    if (fixPrompt) {
      await navigator.clipboard.writeText(fixPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // First click: generate via Claude Haiku
    setLoadingPrompt(true);
    setPromptError("");
    setPromptUpgrade(false);
    try {
      const res = await fetch("/api/fix-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finding.name,
          severity: finding.severity,
          category: finding.category,
          description: finding.description,
          detail: finding.detail,
          affectedValue: finding.affectedValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromptError(data.error ?? "Failed to generate fix prompt.");
        if (data.upgrade) setPromptUpgrade(true);
        return;
      }
      setFixPrompt(data.fixPrompt);
      await navigator.clipboard.writeText(data.fixPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setPromptError("Network error. Please try again.");
    } finally {
      setLoadingPrompt(false);
    }
  }

  return (
    <div className="border border-border bg-surface">
      <button
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0 mt-1.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant={finding.status === "warn" ? "warn" : cfg.variant}>
              {finding.status === "warn" ? "Warning" : cfg.label}
            </Badge>
            <span className="text-sm font-medium text-body">{finding.name}</span>
          </div>
          <p className="text-xs text-muted line-clamp-2">{finding.description}</p>
          {finding.affectedValue && (
            <code className="text-xs font-mono text-muted mt-1 block truncate">{finding.affectedValue}</code>
          )}
        </div>
        <span className="text-muted flex-shrink-0 ml-2 mt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 animate-fade-in">
          <p className="text-sm text-body mb-3">{finding.description}</p>
          {finding.detail && (
            <pre className="text-xs font-mono bg-gray-50 border border-border p-3 overflow-x-auto text-muted mb-3 whitespace-pre-wrap break-all">
              {finding.detail}
            </pre>
          )}
          {finding.affectedValue && finding.affectedValue !== finding.detail && (
            <div className="mb-3">
              <span className="text-xs text-muted font-medium">Affected value: </span>
              <code className="text-xs font-mono text-body">{finding.affectedValue}</code>
            </div>
          )}

          {/* Generated fix prompt preview */}
          {fixPrompt && (
            <div className="mb-3 bg-primary-light border border-green-200 p-3">
              <p className="text-xs font-medium text-primary mb-1">AI Fix Prompt</p>
              <p className="text-xs text-body leading-relaxed">{fixPrompt}</p>
            </div>
          )}

          {promptError && (
            <div className="mb-2">
              <p className="text-xs text-severity-critical">{promptError}</p>
              {promptUpgrade && (
                <a href="/signup" className="text-xs text-primary underline mt-1 inline-block">
                  Create free account or upgrade →
                </a>
              )}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFixPrompt}
            disabled={loadingPrompt}
            className="text-xs gap-1.5"
          >
            {loadingPrompt ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating…
              </>
            ) : copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {fixPrompt ? "Copy Again" : "Copy AI Fix Prompt"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ResultsClient({ result }: { result: ScanResult }) {
  const [shareMsg, setShareMsg] = useState("");
  const summary = result.summary ?? { critical: 0, high: 0, medium: 0, low: 0, passed: 0, total: 0 };

  const grouped = SEVERITY_ORDER.reduce<Record<string, Finding[]>>((acc, sev) => {
    acc[sev] = result.findings.filter((f) => f.status !== "pass" && f.severity === sev);
    return acc;
  }, {} as Record<string, Finding[]>);

  const passed = result.findings.filter((f) => f.status === "pass");

  async function handleShare() {
    const url = `${window.location.origin}/scan/${result.shareToken}`;
    await navigator.clipboard.writeText(url);
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-4 w-4" />
            <Image src="/Skavio.png" alt="Skavio" width={500} height={500} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
              <Share2 className="h-3 w-3" />
              {shareMsg || "Share"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Security Report</span>
            </div>
            <h1 className="text-xl font-bold text-body break-all">{result.url}</h1>
            <p className="text-xs text-muted mt-1">
              Scanned {new Date(result.createdAt).toLocaleString()} ·{" "}
              {result.findings.length} checks
            </p>
          </div>
          {result.riskScore !== undefined && (
            <RiskMeter score={result.riskScore} label={result.riskLabel ?? ""} />
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Critical", count: summary.critical, color: "text-severity-critical", border: "border-red-200", bg: "bg-red-50" },
            { label: "High", count: summary.high, color: "text-severity-high", border: "border-orange-200", bg: "bg-orange-50" },
            { label: "Medium", count: summary.medium, color: "text-severity-medium", border: "border-amber-200", bg: "bg-amber-50" },
            { label: "Low", count: summary.low, color: "text-primary", border: "border-green-200", bg: "bg-green-50" },
            { label: "Passed", count: summary.passed, color: "text-passed", border: "border-green-300", bg: "bg-primary-light" },
          ].map(({ label, count, color, border, bg }) => (
            <div key={label} className={`border ${border} ${bg} p-4 text-center`}>
              <div className={`text-2xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div className="space-y-6">
          {SEVERITY_ORDER.map((sev) => {
            const findings = grouped[sev];
            if (!findings || findings.length === 0) return null;
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <div key={sev}>
                <h2 className="text-sm font-semibold text-body mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label} ({findings.length})
                </h2>
                <div className="space-y-2">
                  {findings.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Passed */}
          {passed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-body mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-passed" />
                Passed ({passed.length})
              </h2>
              <div className="space-y-1">
                {passed.map((f) => (
                  <FindingCard key={f.id} finding={f} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upsell banner */}
        <Card className="mt-10 border-primary-light bg-primary-light">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-body text-sm">Get AI-powered fix prompts for every issue</p>
              <p className="text-xs text-muted mt-0.5">
                Paste them into Cursor, Claude Code, or Copilot and fix vulnerabilities in minutes.
              </p>
            </div>
            <Button size="sm" className="whitespace-nowrap">Upgrade to Starter →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
