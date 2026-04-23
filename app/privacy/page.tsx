import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Privacy Policy — Skavio" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/skavio-bgrmv.png" alt="Skavio" width={500} height={160} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-body transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-body mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted mb-10">Last updated: April 23, 2026</p>

        <div className="space-y-8 text-sm text-body leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-body mb-3">What we collect</h2>
            <p className="text-muted mb-3">When you use Skavio, we collect:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted">
              <li>The URLs you submit for scanning</li>
              <li>Scan results (security findings, risk scores)</li>
              <li>Your email address if you create an account</li>
              <li>Basic usage data (scan count, account creation date)</li>
              <li>Standard server logs (IP address, browser type, timestamps)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">What we do not collect</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted">
              <li>Passwords (we use OAuth — Google and GitHub sign-in only)</li>
              <li>Payment card details (handled entirely by LemonSqueezy)</li>
              <li>Any data from the websites you scan beyond what is publicly accessible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">How we use your data</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted">
              <li>To run security scans and return results to you</li>
              <li>To enforce plan limits (scan quotas)</li>
              <li>To send transactional emails (e.g. subscription receipts via LemonSqueezy)</li>
              <li>To improve the accuracy and coverage of our security checks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">Data retention</h2>
            <p className="text-muted">Free scan results are stored for 7 days and then permanently deleted. Scan results linked to a paid account are retained for as long as the account is active. You can delete your account and all associated data at any time from your dashboard settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">Third-party services</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted">
              <li><strong className="text-body">Supabase</strong> — database and authentication</li>
              <li><strong className="text-body">LemonSqueezy</strong> — payment processing and subscription management</li>
              <li><strong className="text-body">Vercel</strong> — hosting and edge delivery</li>
              <li><strong className="text-body">Anthropic</strong> — AI-generated fix prompts (finding data only, not personal data)</li>
            </ul>
            <p className="text-muted mt-3">We do not sell, rent, or share your personal data with any other third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">Your rights</h2>
            <p className="text-muted">You can request access to, correction of, or deletion of your personal data at any time by deleting your account from Settings, or by emailing us. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">Contact</h2>
            <p className="text-muted">Questions about this policy? Email us at <a href="mailto:privacy@skav.io" className="text-primary hover:underline">privacy@skav.io</a>.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border bg-surface py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
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
