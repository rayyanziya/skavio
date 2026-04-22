import { ScanInput } from "@/components/landing/scan-input";
import { Shield, Search, FileText, Lock, Globe, Code2, Mail, Server } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CHECK_CATEGORIES = [
  { icon: Shield, title: "Security Headers", desc: "CSP, HSTS, X-Frame-Options, CORS, referrer policy, and more." },
  { icon: Lock, title: "SSL / TLS", desc: "Certificate validity, TLS version, HTTP→HTTPS redirects, HSTS preload." },
  { icon: Search, title: "Exposed Secrets", desc: "API keys, tokens, and credentials leaked in HTML or JS bundles." },
  { icon: Globe, title: "CORS Config", desc: "Overly permissive cross-origin policies that expose your API." },
  { icon: Code2, title: "Cookie Security", desc: "HttpOnly, Secure, and SameSite flags on all session cookies." },
  { icon: FileText, title: "Info Disclosure", desc: ".env, .git/config, phpinfo, and other exposed sensitive files." },
  { icon: Mail, title: "Email Security", desc: "SPF, DMARC, DKIM, MTA-STS to prevent email spoofing." },
  { icon: Server, title: "Infrastructure", desc: "Subdomain discovery, takeover risks, CAA records, DNSSEC." },
];

const FAQ_ITEMS = [
  {
    q: "Is this legal? Can I scan any site?",
    a: "Skavio performs passive scans only — we read publicly available HTTP headers, DNS records, and files that are publicly accessible. This is equivalent to visiting a website in a browser. We recommend only scanning sites you own or have authorization to test.",
  },
  {
    q: "How long does a scan take?",
    a: "Most scans complete in 15–30 seconds. Complex sites or slow servers may take up to 45 seconds.",
  },
  {
    q: "Do I need an account?",
    a: "No account required for a free scan. Your results are accessible via a shareable link for 7 days.",
  },
  {
    q: "What's the difference between free and paid?",
    a: "Free scans show a severity summary and all finding names. Paid plans unlock full vulnerability details, AI-generated fix prompts you can paste into Cursor or Claude Code, PDF export, and scan history.",
  },
  {
    q: "Will scanning affect my site's performance?",
    a: "No. We make only a small number of HTTP requests (similar to a single page load) and never hammer your server with repeated requests.",
  },
  {
    q: "Do you store my scan results?",
    a: "Free scan results are stored for 7 days via a shareable link, then deleted. We don't sell or share your data.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-body text-lg tracking-tight">
            Sk<span className="text-primary">avio</span>
          </span>
          <div className="flex items-center gap-6 text-sm">
            <a href="#checks" className="text-muted hover:text-body transition-colors">What we check</a>
            <a href="#pricing" className="text-muted hover:text-body transition-colors">Pricing</a>
            <a href="#faq" className="text-muted hover:text-body transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 border border-primary-light bg-primary-light px-3 py-1 text-xs font-medium text-primary mb-8">
          <Shield className="h-3.5 w-3.5" />
          45+ passive security checks · No login required
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-body mb-5 leading-tight">
          Your app has vulnerabilities.
          <br />
          <span className="text-primary">Let&apos;s find them.</span>
        </h1>
        <p className="text-lg text-muted mb-10 max-w-xl mx-auto">
          Paste a URL. Get a full security autopsy in 30 seconds.
          Plain-English explanations, zero jargon.
        </p>

        <div className="flex justify-center mb-8">
          <ScanInput />
        </div>

        <p className="text-xs text-muted">
          Free · No account required · Results valid for 7 days
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-body text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste your URL", desc: "Enter any website URL — no login, no setup, no install." },
              { step: "02", title: "We run 45+ checks", desc: "Headers, SSL, secrets, DNS, cookies, and more — all in parallel, all passive." },
              { step: "03", title: "Get your report", desc: "Severity-rated findings with plain-English explanations and AI fix prompts." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <span className="text-3xl font-bold text-primary-light select-none leading-none mt-1">{step}</span>
                <div>
                  <h3 className="font-semibold text-body mb-1">{title}</h3>
                  <p className="text-sm text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we check */}
      <section id="checks" className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-body text-center mb-3">What we check</h2>
        <p className="text-muted text-center mb-10 text-sm">45+ passive security checks — all legal, no active probing</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECK_CATEGORIES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-border bg-surface p-5 hover:border-primary transition-colors">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold text-body text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-surface py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-body text-center mb-3">Simple pricing</h2>
          <p className="text-muted text-center mb-12 text-sm">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["3 scans / month", "Severity summary", "7-day result links", "No account needed"],
                cta: "Start scanning",
                highlight: false,
              },
              {
                name: "Starter",
                price: "€15",
                period: "/ month",
                features: ["30 scans / month", "Full vulnerability details", "AI fix prompts", "PDF export", "1 API key"],
                cta: "Get Starter",
                highlight: false,
              },
              {
                name: "Pro",
                price: "€33",
                period: "/ month",
                features: ["100 scans / month", "5 projects", "Daily monitoring + alerts", "Everything in Starter", "5 API keys"],
                cta: "Get Pro",
                highlight: true,
                badge: "Most Popular",
              },
              {
                name: "Agency",
                price: "$79",
                period: "/ month",
                features: ["Unlimited scans", "Unlimited projects", "White-label PDF reports", "20 API keys", "Dedicated support"],
                cta: "Get Agency",
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`border p-6 flex flex-col ${tier.highlight ? "border-primary bg-primary-light" : "border-border bg-surface"}`}
              >
                {tier.badge && (
                  <span className="text-xs font-semibold text-primary mb-3">{tier.badge}</span>
                )}
                <h3 className="font-bold text-body mb-1">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-body">{tier.price}</span>
                  <span className="text-sm text-muted ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-muted flex items-start gap-2">
                      <span className="text-primary font-bold mt-px">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full h-9 text-sm font-medium border transition-colors ${tier.highlight ? "bg-primary text-white border-primary hover:bg-primary-hover" : "bg-surface text-body border-border hover:border-primary hover:text-primary"}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-body text-center mb-10">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="border border-border bg-surface">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="px-6">
              <AccordionTrigger className="text-left font-medium text-body">{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border bg-primary py-14 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Run your free scan now</h2>
        <p className="text-green-100 mb-8 text-sm">No account. No credit card. Results in 30 seconds.</p>
        <div className="flex justify-center">
          <ScanInput />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span>© 2026 Skavio. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-body transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-body transition-colors">Terms</a>
            <a href="/security-checks" className="hover:text-body transition-colors">Security Checks</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
