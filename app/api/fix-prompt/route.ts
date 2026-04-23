import { NextRequest, NextResponse } from "next/server";
import { generateFixPrompt, type FindingInput } from "@/lib/ai/fix-prompt";
import { createClient } from "@/lib/supabase/server";
import { getProfile, checkAndIncrementFixPrompt } from "@/lib/db/profiles";

// Anonymous users: 2 per IP per day
const anonLimitMap = new Map<string, { count: number; resetAt: number }>();
const ANON_LIMIT = 2;
const ANON_WINDOW_MS = 24 * 60 * 60 * 1000;

function checkAnonLimit(ip: string): boolean {
  const now = Date.now();
  const entry = anonLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    anonLimitMap.set(ip, { count: 1, resetAt: now + ANON_WINDOW_MS });
    return true;
  }
  if (entry.count >= ANON_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  let body: Partial<FindingInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, severity, category, description } = body;
  if (!name || !severity || !category || !description) {
    return NextResponse.json(
      { error: "Missing required fields: name, severity, category, description." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI fix prompts are not configured on this server." },
      { status: 503 }
    );
  }

  // Check quota
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {}

  if (userId) {
    const profile = await getProfile(userId).catch(() => null);
    const plan = profile?.plan ?? "free";
    const result = await checkAndIncrementFixPrompt(userId, plan).catch(() => ({ allowed: true, used: 0, limit: Infinity }));
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: `You've used all ${result.limit} free AI fix prompts this month. Upgrade to get unlimited fix prompts.`,
          upgrade: true,
        },
        { status: 429 }
      );
    }
  } else {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkAnonLimit(ip)) {
      return NextResponse.json(
        {
          error: "You've used your 2 free AI fix prompts. Create a free account or upgrade to get more.",
          upgrade: true,
        },
        { status: 429 }
      );
    }
  }

  try {
    const fixPrompt = await generateFixPrompt(body as FindingInput);
    return NextResponse.json({ fixPrompt });
  } catch (err) {
    console.error("Fix prompt generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate fix prompt. Please try again." },
      { status: 500 }
    );
  }
}
