import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="mb-8">
        <Image src="/skavio-bgrmv.png" alt="Skavio" width={500} height={160} className="h-8 w-auto" />
      </Link>
      <p className="text-6xl font-bold text-primary mb-4">404</p>
      <h1 className="text-xl font-semibold text-body mb-2">Page not found</h1>
      <p className="text-sm text-muted mb-8 max-w-sm">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="h-9 px-5 text-sm font-medium bg-primary text-white border border-primary hover:bg-primary-hover transition-colors inline-flex items-center"
      >
        Back to home
      </Link>
    </div>
  );
}
