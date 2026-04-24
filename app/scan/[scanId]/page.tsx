import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScan } from "@/lib/utils/storage";
import { getScanByToken } from "@/lib/db/scans";
import { ResultsClient } from "./results-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  // The URL segment is the public shareToken, not the private scanId.
  const { scanId: token } = await params;

  // Try in-memory first (fastest), fall back to Supabase. Both lookups are
  // strictly by share_token so private scan IDs cannot be used to reach this page.
  let result = getScan(token);
  if (!result) {
    result = await getScanByToken(token);
  }

  if (!result) notFound();

  return <ResultsClient result={result} />;
}
