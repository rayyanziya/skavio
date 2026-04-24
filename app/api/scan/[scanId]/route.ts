import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/utils/storage";
import { getScanByToken } from "@/lib/db/scans";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  // Path segment is the public shareToken — the private scanId is never
  // accepted here, so a leaked internal ID cannot fetch scan results.
  const { scanId: token } = await params;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid scan token." }, { status: 400 });
  }

  const result = getScan(token) ?? (await getScanByToken(token));

  if (!result) {
    return NextResponse.json(
      { error: "Scan not found or expired." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
