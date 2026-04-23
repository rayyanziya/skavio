import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, Search, Globe, Code2, FileText, Mail, Server, CheckCircle } from "lucide-react";

export const metadata = { title: "Security Checks — Skavio" };

const CHECKS = [
  {
    icon: Shield,
    title: "Security Headers",
    desc: "Analyzes HTTP response headers that protect against common browser-based attacks.",
    items: [
      "Content-Security-Policy (CSP) — presence and policy strength",
      "Strict-Transport-Security (HSTS) — max-age and includeSubDomains",
      "X-Frame-Options — clickjacking protection",
      "X-Content-Type-Options — MIME sniffing prevention",
      "Referrer-Policy — referrer data leakage",
      "Permissions-Policy — browser feature restrictions",
      "Cross-Origin-Opener-Policy (COOP)",
      "Cross-Origin-Embedder-Policy (COEP)",
      "Cross-Origin-Resource-Policy (CORP)",
    ],
  },
  {
    icon: Lock,
    title: "SSL / TLS",
    desc: "Verifies your HTTPS configuration and certificate health.",
    items: [
      "SSL certificate validity and expiry date",
      "HTTP → HTTPS redirect enforcement",
      "HSTS preload eligibility",
      "Mixed content detection (HTTP resources on HTTPS pages)",
      "TLS version compatibility",
    ],
  },
  {
    icon: Search,
    title: "Exposed Secrets",
    desc: "Scans HTML and JavaScript bundles for accidentally leaked credentials.",
    items: [
      "Stripe live and test API keys",
      "Google API keys",
      "AWS access key IDs (AKIA...)",
      "GitHub personal access tokens (ghp_, ghs_)",
      "Supabase JWT secrets",
      "Firebase configuration objects",
      "Generic api_key and password patterns in source",
      "Scans up to 5 JS bundle files per site",
    ],
  },
  {
    icon: Globe,
    title: "CORS Configuration",
    desc: "Identifies overly permissive cross-origin resource sharing policies.",
    items: [
      "Access-Control-Allow-Origin: * (wildcard) detection",
      "Credentials allowed with wildcard origin",
      "Overly broad allowed methods",
      "Exposed sensitive headers",
    ],
  },
  {
    icon: Code2,
    title: "Cookie Security",
    desc: "Checks session and tracking cookies for missing security flags.",
    items: [
      "HttpOnly flag — prevents JS access to cookies",
      "Secure flag — cookies only sent over HTTPS",
      "SameSite attribute — CSRF protection",
      "Session cookie exposure over HTTP",
    ],
  },
  {
    icon: FileText,
    title: "Information Disclosure",
    desc: "Probes for sensitive files and paths that should not be publicly accessible.",
    items: [
      ".env file exposure",
      ".git/config and git repository exposure",
      "phpinfo() output pages",
      "server-status and server-info pages",
      "wp-config.php (WordPress)",
      "Web server version leakage in headers",
      "X-Powered-By header disclosure",
      "security.txt presence (good practice check)",
    ],
  },
  {
    icon: Mail,
    title: "Email Security",
    desc: "Validates DNS records that prevent email spoofing and phishing.",
    items: [
      "SPF record presence and policy strength",
      "DMARC record presence, policy, and enforcement level",
      "DKIM selector detection",
      "MTA-STS policy",
      "BIMI record",
    ],
  },
  {
    icon: Server,
    title: "Infrastructure & DNS",
    desc: "Discovers subdomains and checks for misconfigurations at the DNS level.",
    items: [
      "Subdomain enumeration via Certificate Transparency logs (crt.sh)",
      "Subdomain takeover risk detection (dangling CNAME to deprovisioned services)",
      "CAA records — certificate authority restrictions",
      "DNSSEC validation",
      "IPv6 (AAAA record) presence",
      "Wildcard DNS detection",
    ],
  },
];

export default function SecurityChecksPage() {
  const total = CHECKS.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/skavio-bgrmv.png" alt="Skavio" width={500} height={160} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-body transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-body mb-3">Security Checks</h1>
          <p className="text-muted text-sm max-w-xl mx-auto">
            Skavio runs <strong className="text-body">{total}+ passive checks</strong> across 8 categories. All checks are read-only — we never send attack payloads or modify anything on your server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHECKS.map(({ icon: Icon, title, desc, items }) => (
            <div key={title} className="border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="font-semibold text-body">{title}</h2>
              </div>
              <p className="text-xs text-muted mb-4 leading-relaxed">{desc}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted">
                    <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-primary-light bg-primary-light p-8 text-center">
          <h2 className="font-bold text-body mb-2">Ready to scan your site?</h2>
          <p className="text-sm text-muted mb-6">Free · No account required · Results in 30 seconds</p>
          <Link
            href="/"
            className="inline-flex items-center h-10 px-6 text-sm font-medium bg-primary text-white border border-primary hover:bg-primary-hover transition-colors"
          >
            Start a free scan →
          </Link>
        </div>
      </div>

      <footer className="border-t border-border bg-surface py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© 2026 Skavio. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-body transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-body transition-colors">Terms</Link>
            <Link href="/security-checks" className="hover:text-body transition-colors">Security Checks</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
