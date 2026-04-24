import { NextRequest, NextResponse } from "next/server";
import { validateUrl } from "@/lib/utils/url";
import { runScan } from "@/lib/scanner";
import { storeScan } from "@/lib/utils/storage";
import { saveScan, getUserScanCountThisMonth } from "@/lib/db/scans";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { PLAN_LIMITS } from "@/lib/lemonsqueezy";
import { limitScan } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    "unknown";

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  const validated = await validateUrl(body.url.trim());
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

  if (userId) {
    // Enforce monthly scan quota for logged-in users
    const profile = await getProfile(userId).catch(() => null);
    const plan = profile?.plan ?? "free";
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    const count = await getUserScanCountThisMonth(userId).catch(() => 0);
    if (count >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${limit} scans for your ${plan} plan this month. Upgrade to scan more.`,
          upgrade: true,
        },
        { status: 429 }
      );
    }
  } else {
    // Anonymous users: IP-based rate limit (Upstash if configured, in-memory fallback)
    const allowed = await limitScan(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 10 scans per hour per IP." },
        { status: 429 }
      );
    }
  }

  try {
    const result = await runScan(validated.url);

    storeScan(result);

    try {
      await saveScan(result, userId);
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
    }

    return NextResponse.json({ scanId: result.id, shareToken: result.shareToken });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
