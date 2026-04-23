import { NextRequest, NextResponse } from "next/server";
import { validateUrl } from "@/lib/utils/url";
import { runScan } from "@/lib/scanner";
import { storeScan } from "@/lib/utils/storage";
import { saveScan } from "@/lib/db/scans";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory rate limiter (per IP, 10 scans/hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 10 scans per hour per IP." },
      { status: 429 }
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  const validated = validateUrl(body.url.trim());
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Check if user is logged in
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {}

  try {
    const result = await runScan(validated.url);

    // Always keep in-memory for fast retrieval during the session
    storeScan(result);

    // Persist to Supabase (always — anonymous scans get user_id = null)
    try {
      await saveScan(result, userId);
    } catch (dbErr) {
      // Don't fail the scan if DB write fails — in-memory fallback still works
      console.error("DB save error:", dbErr);
    }

    return NextResponse.json({ scanId: result.id, shareToken: result.shareToken });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
