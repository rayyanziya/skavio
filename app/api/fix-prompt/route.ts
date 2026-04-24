import { NextRequest, NextResponse } from "next/server";
import { generateFixPrompt, type FindingInput } from "@/lib/ai/fix-prompt";
import { createClient } from "@/lib/supabase/server";
import { getProfile, checkAndIncrementFixPrompt } from "@/lib/db/profiles";
import { limitFixPrompt } from "@/lib/rate-limit";

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

  const MAX_FIELD = 1024;
  const cap = (v: string | undefined) => (typeof v === "string" ? v.slice(0, MAX_FIELD) : v);
  body = {
    ...body,
    name: cap(body.name)!,
    severity: cap(body.severity)!,
    category: cap(body.category)!,
    description: cap(body.description)!,
    detail: cap(body.detail),
    affectedValue: cap(body.affectedValue),
  };

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
    const ip =
      req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip")?.trim() ??
      req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
      "unknown";
    const allowed = await limitFixPrompt(ip);
    if (!allowed) {
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
