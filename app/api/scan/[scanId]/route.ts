import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/utils/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  if (!scanId || typeof scanId !== "string") {
    return NextResponse.json({ error: "Invalid scan ID." }, { status: 400 });
  }

  const result = getScan(scanId);

  if (!result) {
    return NextResponse.json(
      { error: "Scan not found or expired." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
