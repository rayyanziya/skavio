import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Terms of Service — Skavio" };

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-body mb-2">Terms of Service</h1>
        <p className="text-sm text-muted mb-10">Last updated: April 23, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-body mb-3">1. Acceptance</h2>
            <p className="text-muted">By using Skavio (&ldquo;the Service&rdquo;), you agree to these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">2. Permitted use</h2>
            <p className="text-muted mb-3">You may use Skavio to scan websites that you own or have explicit written permission to test. Skavio performs passive scans only — it reads publicly accessible HTTP headers, DNS records, and files, equivalent to a normal browser visit.</p>
            <p className="text-muted">You must not use Skavio to scan websites without authorization, to circumvent security controls, or for any illegal purpose.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">3. No warranty</h2>
            <p className="text-muted">Skavio is provided &ldquo;as is.&rdquo; We do not guarantee that scans are complete, accurate, or that acting on results will eliminate all security risks. Scan results are informational only — you are responsible for your own security decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">4. Limitation of liability</h2>
            <p className="text-muted">To the maximum extent permitted by law, Skavio and its operators shall not be liable for any damages arising from your use of the Service, including but not limited to data loss, security breaches, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">5. Subscriptions and billing</h2>
            <p className="text-muted mb-3">Paid plans are billed monthly through LemonSqueezy. You may cancel at any time; your plan remains active until the end of the billing period. Refunds are handled on a case-by-case basis — contact us within 7 days of a charge if you believe there is an error.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">6. Termination</h2>
            <p className="text-muted">We reserve the right to suspend or terminate accounts that violate these Terms, abuse the Service, or engage in behavior harmful to other users or third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">7. Changes</h2>
            <p className="text-muted">We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-body mb-3">8. Contact</h2>
            <p className="text-muted">Questions? Email <a href="mailto:support@skav.io" className="text-primary hover:underline">support@skav.io</a>.</p>
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
