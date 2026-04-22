import { notFound } from "next/navigation";
import { getScan } from "@/lib/utils/storage";
import { ResultsClient } from "./results-client";

export default async function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const result = getScan(scanId);

  if (!result) notFound();

  return <ResultsClient result={result} />;
}
