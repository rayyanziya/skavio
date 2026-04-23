import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/skavio-bgrmv.png" alt="Skavio" width={500} height={160} className="h-10 w-auto" />
        </Link>
        {children}
      </div>
    </div>
  );
}
