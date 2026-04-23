import { notFound } from "next/navigation";
import { getScan } from "@/lib/utils/storage";
import { getScanById, getScanByToken } from "@/lib/db/scans";
import { ResultsClient } from "./results-client";

export default async function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;

  // Try in-memory first (fastest), fall back to Supabase
  let result = getScan(scanId);
  if (!result) {
    result = await getScanById(scanId) ?? await getScanByToken(scanId);
  }

  if (!result) notFound();

  return <ResultsClient result={result} />;
}
